import { bash, listProjectFiles, projectRoot, toProjectPath, walkProject, writeFileFn } from "./projectfiles";
import type { FunctionTool } from "./types";

export const TOOLS: FunctionTool[] = [
  {
    name: "bash",
    description: `
      Execute a bash command in the project's WSL environment.

      Use this tool when you need to:
      - Inspect the project structure (ls, find, tree)
      - Read files (cat, head, tail)
      - Search code (grep, rg)
      - Check the current directory (pwd)
      - Run build, test, or lint commands
      - Install dependencies
      - Execute scripts or any other shell command

      Input:
      - command: The bash command to execute.

      Returns:
      {
        stdout: "Command standard output",
        stderr: "Command error output"
      }

      If the command fails unexpectedly, the tool may return null.
    `,
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The bash command to execute inside WSL.",
        },
      },
      required: ["command"],
      additionalProperties: false,
    },
    strict: true,
    type: "function",
  },

  // {
  //   name: "listProjectFiles",
  //   description: `
  //     Get all project files along with their content.

  //     Returns:
  //     [
  //       {
  //         path: "src/index.ts",
  //         content: "..."
  //       }
  //     ]
  //   `,
  //   parameters: {
  //     type: "object",
  //     properties: {},
  //     additionalProperties: false,
  //   },
  //   strict: true,
  //   type: "function",
  // },

  // {
  //   name: "walkProject",
  //   description: `
  //     Get all files recursively from the given directory.

  //     Example output:
  //     [
  //       "src/index.ts",
  //       "src/components/Button.tsx"
  //     ]
  //   `,
  //   parameters: {
  //     type: "object",
  //     properties: {
  //       directory: {
  //         type: "string",
  //         description: "Directory to walk",
  //       },
  //     },
  //     required: ["directory"],
  //     additionalProperties: false,
  //   },
  //   strict: true,
  //   type: "function",
  // },

  // {
  //   name: "toProjectPath",
  //   description: `
  //     Convert an absolute path into a project-relative path.

  //     Example:
  //     "C:\\project\\src\\index.ts"
  //     =>
  //     "src/index.ts"
  //   `,
  //   parameters: {
  //     type: "object",
  //     properties: {
  //       filePath: {
  //         type: "string",
  //         description: "Absolute file path",
  //       },
  //     },
  //     required: ["filePath"],
  //     additionalProperties: false,
  //   },
  //   strict: true,
  //   type: "function",
  // },

  // {
  //   name: "writeFileFn",
  //   description: `
  //     Create or update a file.

  //     Before calling:
  //     1. Use walkProject to discover files.
  //     2. Use listProjectFiles to inspect file contents.
  //     3. Use writeFileFn to create/update files.

  //     Content must always be passed as a string.
  //   `,
  //   parameters: {
  //     type: "object",
  //     properties: {
  //       path: {
  //         type: "string",
  //         description: "Relative file path",
  //       },
  //       content: {
  //         type: "string",
  //         description: "File content as a string",
  //       },
  //     },
  //     required: ["path", "content"],
  //     additionalProperties: false,
  //   },
  //   strict: true,
  //   type: "function",
  // },
];

export const TOOL_IMPLEMENTATIONS = {
  bash,
  
  // listProjectFiles,

  // walkProject: ({ directory }: { directory: string }) =>
  //   walkProject(directory),

  // toProjectPath: ({ filePath }: { filePath: string }) =>
  //   toProjectPath(filePath),

  // writeFileFn: ({
  //   path,
  //   content,
  // }: {
  //   path: string;
  //   content: string;
  // }) => writeFileFn(path, content),
};