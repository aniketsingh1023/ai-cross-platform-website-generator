export function canFormat(language: string): boolean {
  return ["javascript", "typescript", "json", "html", "css"].includes(language);
}

export async function formatCode(
  code: string,
  language: string
): Promise<string> {
  switch (language) {
    case "json":
      return formatJSON(code);
    case "html":
      return formatHTML(code);
    case "css":
      return formatCSS(code);
    case "javascript":
    case "typescript":
      return formatJS(code);
    default:
      return code;
  }
}

function formatJSON(code: string): string {
  try {
    return JSON.stringify(JSON.parse(code), null, 2);
  } catch {
    return code;
  }
}

function formatJS(code: string): string {
  const lines = code.split("\n");
  const result: string[] = [];
  let indent = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      result.push("");
      continue;
    }

    if (/^[}\])]/.test(line)) {
      indent = Math.max(0, indent - 1);
    }

    result.push("  ".repeat(indent) + line);

    const opens = (line.match(/[{[(]/g) || []).length;
    const closes = (line.match(/[}\])]/g) || []).length;
    indent = Math.max(0, indent + opens - closes);
  }

  return result.join("\n");
}

function formatHTML(code: string): string {
  const lines = code.split("\n");
  const result: string[] = [];
  let indent = 0;
  const voidElements = new Set([
    "area", "base", "br", "col", "embed", "hr", "img",
    "input", "link", "meta", "source", "track", "wbr",
  ]);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      result.push("");
      continue;
    }

    const closingTag = line.match(/^<\/(\w+)/);
    if (closingTag) {
      indent = Math.max(0, indent - 1);
    }

    result.push("  ".repeat(indent) + line);

    const openingTag = line.match(/^<(\w+)/);
    if (
      openingTag &&
      !voidElements.has(openingTag[1]) &&
      !line.includes("</") &&
      !line.endsWith("/>")
    ) {
      indent++;
    }
  }

  return result.join("\n");
}

function formatCSS(code: string): string {
  const lines = code.split("\n");
  const result: string[] = [];
  let indent = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      result.push("");
      continue;
    }

    if (line.startsWith("}")) {
      indent = Math.max(0, indent - 1);
    }

    result.push("  ".repeat(indent) + line);

    if (line.endsWith("{")) {
      indent++;
    }
  }

  return result.join("\n");
}
