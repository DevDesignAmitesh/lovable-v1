import { bash } from "./projectfiles";
import type { FunctionTool } from "./types";

export const TOOLS: FunctionTool[] = [
  {
    name: "bash_tool",
    description: `
      Execute a bash command in the project's WSL environment.

      Use this tool when you need to:
      - Inspect the project structure (ls, find, tree)
      - Read files (cat, head, tail)
      - Search code (grep, rg)
      - Check the current directory (pwd)

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
          description:
            "A bash command strictly limited to file/folder CRUD operations (cat, ls, touch, mkdir, cp, mv, rm, sed, find, tree, etc.). No install, build, test, or server commands.",
        },
      },
      required: ["command"],
      additionalProperties: false,
    },
    strict: true,
    type: "function",
  },
  {
    name: "broadcast_questions_to_user_tool",
    description: `
      Ask the user clarifying questions before implementing anything.

      Use this tool when you have doubts or need more information about:
      - The user's prompt or requirements
      - Ambiguities in the codebase
      - Multiple valid approaches and you need the user to decide
      - Missing context that would affect how the task is implemented

      IMPORTANT: Always use this tool BEFORE starting any implementation if there
      are unresolved questions. Never assume — ask first.

      Input:
      - questions: An array of specific questions to present to the user.

      Returns: void (the user's response will come in the next message)
    `,
    parameters: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "A list of specific questions to ask the user before proceeding with implementation.",
        },
      },
      required: ["questions"],
      additionalProperties: false,
    },
    strict: true,
    type: "function",
  },
  {
    name: "broadcast_plan_to_user_tool",
    description: `
      Share the implementation plan with the user before making any changes.

      Use this tool BEFORE implementing any changes or creating any files to
      let the user know exactly what steps you are going to take. This gives
      the user a chance to review and correct the approach before execution.

      Input:
      - plan: A structured list of steps describing what you intend to do.
      - summary: A brief one-line description of the overall goal.

      Returns: void
    `,
    parameters: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description:
            "A brief one-line description of the overall goal or task.",
        },
        plan: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "An ordered list of steps describing what actions will be taken to complete the task.",
        },
      },
      required: ["summary", "plan"],
      additionalProperties: false,
    },
    strict: true,
    type: "function",
  },
  {
    name: "broadcast_tool_to_user_tool",
    description: `
      Notify the user which tool you are about to use before using it.

      Use this tool BEFORE every other tool call to keep the user informed
      about what action is being taken and why. This improves transparency
      and lets the user follow along with the process in real time.

      Input:
      - tool_name: The name of the tool you are about to invoke.
      - reason: A short explanation of why you are using this tool.

      Returns: void
    `,
    parameters: {
      type: "object",
      properties: {
        tool_name: {
          type: "string",
          description: "The exact name of the tool that will be called next.",
        },
        reason: {
          type: "string",
          description:
            "A brief explanation of why this tool is being used at this step.",
        },
      },
      required: ["tool_name", "reason"],
      additionalProperties: false,
    },
    strict: true,
    type: "function",
  },
  {
    name: "broadcast_summary_to_user_tool",
    description: `
      Send a final summary to the user after all tasks have been completed.

      Use this tool at the END of every task to inform the user about:
      - What was accomplished
      - All files created, modified, or deleted
      - Any important decisions made during the process
      - Any follow-up actions the user may want to take

      Input:
      - summary: A concise overview of what was done.
      - actions_taken: An ordered list of all actions performed during the task.

      Returns: void
    `,
    parameters: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description:
            "A concise overview of everything that was accomplished in this task.",
        },
        actions_taken: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "An ordered list of all actions performed, such as files created/modified/deleted and commands run.",
        },
      },
      required: ["summary", "actions_taken"],
      additionalProperties: false,
    },
    strict: true,
    type: "function",
  },
];

export const TOOL_IMPLEMENTATIONS = {
  bash_tool: bash,
  broadcast_questions_to_user_tool: async ({
    questions,
  }: {
    questions: string[];
  }) => {
    console.log("\n❓ Questions for you:\n");
    questions.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));
    return questions;
  },
  broadcast_plan_to_user_tool: async ({
    summary,
    plan,
  }: {
    summary: string;
    plan: string[];
  }) => {
    console.log(`\n📋 Plan: ${summary}\n`);
    plan.forEach((step, i) => console.log(`  ${i + 1}. ${step}`));
    return { plan, summary }
  },
  broadcast_tool_to_user_tool: async ({
    tool_name,
    reason,
  }: {
    tool_name: string;
    reason: string;
  }) => {
    console.log(`\n🔧 Using tool: ${tool_name}\n   Reason: ${reason}`);
    return { tool_name, reason }
  },
  broadcast_summary_to_user_tool: async ({
    summary,
    actions_taken,
  }: {
    summary: string;
    actions_taken: string[];
  }) => {
    console.log(`\n✅ Done! ${summary}\n`);
    console.log("Actions taken:");
    actions_taken.forEach((a, i) => console.log(`  ${i + 1}. ${a}`));
    return { summary, actions_taken  }
  },
};