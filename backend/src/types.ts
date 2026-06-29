export type ProjectFile = {
  path: string;
  content: string;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type ProjectSnapshot = {
  messageHistory: Message[];
  files: ProjectFile[];
  updatedAt: string;
  previewUrl: string;
};


export interface FunctionTool {
  /**
   * The name of the function to call.
   */
  name: string;

  /**
   * A JSON schema object describing the parameters of the function.
   */
  parameters: { [key: string]: unknown } | null;

  /**
   * Whether to enforce strict parameter validation. Default `true`.
   */
  strict: boolean | null;

  /**
   * The type of the function tool. Always `function`.
   */
  type: 'function';

  /**
   * Whether this function is deferred and loaded via tool search.
   */
  defer_loading?: boolean;

  /**
   * A description of the function. Used by the model to determine whether or not to
   * call the function.
   */
  description?: string | null;
}