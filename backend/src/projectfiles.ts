import { readdir, readFile } from "node:fs/promises";
import { writeFileSync } from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ProjectFile } from "./types";
import { exec } from "child_process";
import { promisify } from "util";
import { spawn } from "node:child_process";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
export const projectRoot = path.resolve(currentDirectory, "../../template");

const editableExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".json",
  ".ts",
  ".tsx",
]);
const ignoredDirectories = new Set(["node_modules", "dist", ".vite"]);

// get the path and content of the project
export async function listProjectFiles(): Promise<ProjectFile[]> {
  const paths = await walkProject(projectRoot);
  const files = await Promise.all(
    paths.map(async (filePath) => ({
      path: toProjectPath(filePath),
      content: await readFile(filePath, "utf8"),
    })),
  );

  return files.sort((left, right) => left.path.localeCompare(right.path));
}

// getting all the files from a directory
export async function walkProject(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...(await walkProject(fullPath)));
      }
      continue;
    }

    if (entry.isFile() && editableExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

// coverting ONE to TWO
// ONE = "E:\\S-30-3.0\\contest-3\\project\\index.html"
// TWO = index.html

export function toProjectPath(filePath: string) {
  return path.relative(projectRoot, filePath).split(path.sep).join("/");
}

export function writeFileFn(
  path: string,
  content: string
) {
  try {
    process.chdir(projectRoot);
    // writeFileSync(path, Buffer.from(content, "base64").toString("utf8"));
    writeFileSync(path, content);
    return true;
  } catch {
    return false;
  }
}

export async function bash({ command }: { command: string }) {
  return new Promise<{ stdout: string; stderr: string }>((resolve) => {
    const child = spawn("wsl", ["bash", "-lc", command]);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));

    child.on("close", () => resolve({ stdout, stderr }));
  });
}

// console.log(await bash({
//   command: `
// cd /mnt/e/S-30-3.0/lovable-v1/template &&
// find . -maxdepth 2 -type f |
// sed 's#^./##' |
// sort |
// head -100 &&
// echo '--- package.json ---' &&
// cat package.json &&
// echo '--- README.md ---' &&
// head -120 README.md
// `
// }))
