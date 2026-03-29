import { NextRequest, NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";

interface GitHubRequestBody {
  action: "create-repo" | "push" | "check-token" | "import";
  token: string;
  repoName?: string;
  repoFullName?: string;
  branch?: string;
  files?: Record<string, string>;
  description?: string;
  isPrivate?: boolean;
}

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };
}

async function checkToken(token: string) {
  const res = await fetch(`${GITHUB_API}/user`, {
    headers: githubHeaders(token),
  });

  if (!res.ok) {
    return { valid: false, username: "" };
  }

  const data = await res.json();
  return { valid: true, username: data.login as string };
}

async function createRepo(
  token: string,
  name: string,
  description: string,
  isPrivate: boolean
) {
  const res = await fetch(`${GITHUB_API}/user/repos`, {
    method: "POST",
    headers: githubHeaders(token),
    body: JSON.stringify({
      name,
      description,
      private: isPrivate,
      auto_init: true,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create repository");
  }

  const data = await res.json();
  return {
    success: true,
    repoUrl: data.html_url as string,
    cloneUrl: data.clone_url as string,
  };
}

async function pushFiles(
  token: string,
  repoName: string,
  files: Record<string, string>
) {
  // Get authenticated user
  const userRes = await fetch(`${GITHUB_API}/user`, {
    headers: githubHeaders(token),
  });

  if (!userRes.ok) {
    throw new Error("Failed to authenticate with GitHub");
  }

  const user = await userRes.json();
  const owner = user.login as string;

  let lastCommitUrl = "";

  for (const [path, content] of Object.entries(files)) {
    // Base64 encode the file content
    const encodedContent = Buffer.from(content).toString("base64");

    // Check if file already exists to get its SHA (needed for updates)
    let sha: string | undefined;
    const existingRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repoName}/contents/${path}`,
      { headers: githubHeaders(token) }
    );

    if (existingRes.ok) {
      const existingData = await existingRes.json();
      sha = existingData.sha as string;
    }

    // Create or update the file
    const putRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repoName}/contents/${path}`,
      {
        method: "PUT",
        headers: githubHeaders(token),
        body: JSON.stringify({
          message: sha ? `Update ${path}` : `Add ${path}`,
          content: encodedContent,
          ...(sha ? { sha } : {}),
        }),
      }
    );

    if (!putRes.ok) {
      const error = await putRes.json();
      throw new Error(
        `Failed to push ${path}: ${error.message || "Unknown error"}`
      );
    }

    const putData = await putRes.json();
    lastCommitUrl = putData.commit?.html_url || "";
  }

  return {
    success: true,
    commitUrl: lastCommitUrl,
  };
}

type FileTree = Record<
  string,
  { file: { contents: string } } | { directory: FileTree }
>;

const MAX_IMPORT_FILES = 100;
const MAX_FILE_SIZE = 500 * 1024; // 500KB

function isTextContent(content: string): boolean {
  try {
    const decoded = Buffer.from(content, "base64").toString("utf-8");
    // Check for null bytes which indicate binary content
    return !decoded.includes("\0");
  } catch {
    return false;
  }
}

function setNestedFile(tree: FileTree, pathParts: string[], contents: string) {
  if (pathParts.length === 1) {
    tree[pathParts[0]] = { file: { contents } };
    return;
  }

  const dir = pathParts[0];
  if (!tree[dir] || !("directory" in tree[dir])) {
    tree[dir] = { directory: {} };
  }
  setNestedFile(
    (tree[dir] as { directory: FileTree }).directory,
    pathParts.slice(1),
    contents
  );
}

async function importRepo(
  token: string,
  repoFullName: string,
  branch: string = "main"
) {
  // Fetch the repo tree
  const treeRes = await fetch(
    `${GITHUB_API}/repos/${repoFullName}/git/trees/${branch}?recursive=1`,
    { headers: githubHeaders(token) }
  );

  if (!treeRes.ok) {
    const status = treeRes.status;
    if (status === 404) {
      throw new Error(
        `Repository "${repoFullName}" not found, or branch "${branch}" does not exist.`
      );
    }
    if (status === 403) {
      const errorData = await treeRes.json();
      if (
        errorData.message &&
        errorData.message.toLowerCase().includes("rate limit")
      ) {
        throw new Error(
          "GitHub API rate limit exceeded. Please wait a few minutes and try again."
        );
      }
      throw new Error(
        "Access denied. Make sure your token has the 'repo' scope for private repositories."
      );
    }
    if (status === 401) {
      throw new Error("Invalid or expired GitHub token.");
    }
    throw new Error(`Failed to fetch repository tree (HTTP ${status}).`);
  }

  const treeData = await treeRes.json();
  const blobs = (treeData.tree as Array<{ path: string; type: string; size?: number }>)
    .filter((item) => item.type === "blob")
    .filter((item) => !item.size || item.size <= MAX_FILE_SIZE)
    .slice(0, MAX_IMPORT_FILES);

  const fileTree: FileTree = {};

  // Fetch file contents in batches of 10 to avoid overwhelming the API
  const BATCH_SIZE = 10;
  for (let i = 0; i < blobs.length; i += BATCH_SIZE) {
    const batch = blobs.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (blob) => {
        const contentRes = await fetch(
          `${GITHUB_API}/repos/${repoFullName}/contents/${blob.path}?ref=${branch}`,
          { headers: githubHeaders(token) }
        );

        if (!contentRes.ok) return null;

        const contentData = await contentRes.json();
        if (!contentData.content) return null;

        // Skip binary files
        const base64Content = (contentData.content as string).replace(/\n/g, "");
        if (!isTextContent(base64Content)) return null;

        const decoded = Buffer.from(base64Content, "base64").toString("utf-8");
        const pathParts = blob.path.split("/");
        setNestedFile(fileTree, pathParts, decoded);

        return true;
      })
    );
  }

  // Extract repo name (last part of owner/repo)
  const repoName = repoFullName.split("/").pop() || repoFullName;

  return {
    success: true,
    files: fileTree,
    repoName,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GitHubRequestBody;
    const { action, token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "GitHub token is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "check-token": {
        const result = await checkToken(token);
        return NextResponse.json(result);
      }

      case "create-repo": {
        if (!body.repoName) {
          return NextResponse.json(
            { error: "Repository name is required" },
            { status: 400 }
          );
        }

        const result = await createRepo(
          token,
          body.repoName,
          body.description || "",
          body.isPrivate ?? false
        );
        return NextResponse.json(result);
      }

      case "push": {
        if (!body.repoName) {
          return NextResponse.json(
            { error: "Repository name is required" },
            { status: 400 }
          );
        }
        if (!body.files || Object.keys(body.files).length === 0) {
          return NextResponse.json(
            { error: "No files to push" },
            { status: 400 }
          );
        }

        const result = await pushFiles(token, body.repoName, body.files);
        return NextResponse.json(result);
      }

      case "import": {
        if (!body.repoFullName) {
          return NextResponse.json(
            { error: "Repository full name is required (owner/repo)" },
            { status: 400 }
          );
        }

        const importResult = await importRepo(
          token,
          body.repoFullName,
          body.branch || "main"
        );
        return NextResponse.json(importResult);
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
