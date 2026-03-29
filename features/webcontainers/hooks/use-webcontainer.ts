"use client";

import { useRef, useCallback, useState } from "react";
import { WebContainer } from "@webcontainer/api";
import type { Terminal as XTerminal } from "@xterm/xterm";

export function useWebContainer() {
  const webContainerRef = useRef<WebContainer | null>(null);
  const [isBooting, setIsBooting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const shellProcessRef = useRef<any>(null);

  const boot = useCallback(async () => {
    if (webContainerRef.current) return webContainerRef.current;
    setIsBooting(true);
    try {
      const instance = await WebContainer.boot();
      webContainerRef.current = instance;

      instance.on("server-ready", (_port: number, url: string) => {
        setPreviewUrl(url);
      });

      return instance;
    } catch (error) {
      console.error("Failed to boot WebContainer:", error);
      return null;
    } finally {
      setIsBooting(false);
    }
  }, []);

  const mountFiles = useCallback(async (files: Record<string, any>) => {
    const instance = webContainerRef.current;
    if (!instance) return;
    await instance.mount(files);
  }, []);

  const startShell = useCallback(async (terminal: XTerminal) => {
    const instance = webContainerRef.current;
    if (!instance) return;

    const shellProcess = await instance.spawn("jsh", {
      terminal: {
        cols: terminal.cols,
        rows: terminal.rows,
      },
    });

    shellProcessRef.current = shellProcess;

    shellProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data);
        },
      })
    );

    const input = shellProcess.input.getWriter();
    terminal.onData((data: string) => {
      input.write(data);
    });

    return shellProcess;
  }, []);

  const runCommand = useCallback(
    async (
      command: string,
      args: string[],
      terminal?: XTerminal
    ) => {
      const instance = webContainerRef.current;
      if (!instance) return null;

      const process = await instance.spawn(command, args);

      if (terminal) {
        process.output.pipeTo(
          new WritableStream({
            write(data) {
              terminal.write(data);
            },
          })
        );
      }

      return process;
    },
    []
  );

  const installAndRun = useCallback(
    async (terminal?: XTerminal) => {
      const instance = webContainerRef.current;
      if (!instance) return;

      setIsRunning(true);

      try {
        // Install dependencies
        if (terminal) {
          terminal.writeln("\x1b[1;33m Installing dependencies...\x1b[0m\r\n");
        }

        const installProcess = await instance.spawn("npm", ["install"]);

        if (terminal) {
          installProcess.output.pipeTo(
            new WritableStream({
              write(data) {
                terminal.write(data);
              },
            })
          );
        }

        const installExitCode = await installProcess.exit;

        if (installExitCode !== 0) {
          if (terminal) {
            terminal.writeln(
              "\x1b[1;31m Installation failed. Check errors above.\x1b[0m"
            );
          }
          setIsRunning(false);
          return;
        }

        if (terminal) {
          terminal.writeln(
            "\r\n\x1b[1;32m Dependencies installed!\x1b[0m\r\n"
          );
          terminal.writeln("\x1b[1;33m Starting dev server...\x1b[0m\r\n");
        }

        // Start dev server
        const devProcess = await instance.spawn("npm", ["run", "dev"]);

        if (terminal) {
          devProcess.output.pipeTo(
            new WritableStream({
              write(data) {
                terminal.write(data);
              },
            })
          );
        }
      } catch (error) {
        console.error("Error running project:", error);
        if (terminal) {
          terminal.writeln(
            `\x1b[1;31m Error: ${error}\x1b[0m`
          );
        }
      }
    },
    []
  );

  const writeFile = useCallback(async (path: string, content: string) => {
    const instance = webContainerRef.current;
    if (!instance) return;
    await instance.fs.writeFile(path, content);
  }, []);

  const readFile = useCallback(async (path: string): Promise<string | null> => {
    const instance = webContainerRef.current;
    if (!instance) return null;
    try {
      const content = await instance.fs.readFile(path, "utf-8");
      return content;
    } catch {
      return null;
    }
  }, []);

  const mkdir = useCallback(async (path: string) => {
    const instance = webContainerRef.current;
    if (!instance) return;
    await instance.fs.mkdir(path, { recursive: true });
  }, []);

  const deleteFile = useCallback(async (path: string) => {
    const instance = webContainerRef.current;
    if (!instance) return;
    try {
      await instance.fs.rm(path, { recursive: true });
    } catch {}
  }, []);

  return {
    boot,
    mountFiles,
    startShell,
    runCommand,
    installAndRun,
    writeFile,
    readFile,
    mkdir,
    deleteFile,
    previewUrl,
    isBooting,
    isRunning,
    instance: webContainerRef.current,
  };
}
