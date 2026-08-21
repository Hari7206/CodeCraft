import axios from "axios";
import { tool } from "langchain";
import * as z from "zod";

const API_URL =
  "http://6188b5b0-48ce-4514-83c7-33231bec4288.agent.localhost";

// ===============================
// LIST FILES
// ===============================

export const listFiles = tool(
  async () => {
    console.log("===============================");
    console.log("USING LIST_FILES TOOL");
    console.log("===============================");

    console.log("Request:", `GET ${API_URL}/list-files`);

    const response = await axios.get(`${API_URL}/list-files`);

    console.log("===============================");
    console.log("RESPONSE FROM LIST_FILES TOOL");
    console.log(response.data);
    console.log("===============================");

    return JSON.stringify(response.data.files);
  },
  {
    name: "list_files",
    description:
      "List all the files in the project directory. This is useful for understanding what files are available to work with.",
  }
);

// ===============================
// READ FILES
// ===============================

export const readFiles = tool(
  async ({ files }) => {
    console.log("===============================");
    console.log("USING READ_FILES TOOL");
    console.log("===============================");

    console.log("Files requested:", files);

    const url = `${API_URL}/read-files?files=${files.join(",")}`;

    console.log("Request:", `GET ${url}`);

    const response = await axios.get(url);

    console.log("===============================");
    console.log("RESPONSE FROM READ_FILES TOOL");
    console.log(response.data);
    console.log("===============================");

    return JSON.stringify(response.data);
  },
  {
    name: "read_files",
    description:
      "Read the contents of specified files. This is useful for understanding the content of files that are relevant to the task.",
    schema: z.object({
      files: z
        .array(z.string())
        .describe(
          "The list of files to read. These should be files that were listed using the list_files tool or created later."
        ),
    }),
  }
);

// ===============================
// UPDATE FILES
// ===============================

export const updateFiles = tool(
  async ({ files }) => {
    console.log("===============================");
    console.log("USING UPDATE_FILES TOOL");
    console.log("===============================");

    console.log("Files to create/update:");
    console.log(files);

    console.log("Request:", `PATCH ${API_URL}/update-files`);

    console.log("Request body:");
    console.log({
      updates: files,
    });

    const response = await axios.patch(`${API_URL}/update-files`, {
      updates: files,
    });

    console.log("===============================");
    console.log("RESPONSE FROM UPDATE_FILES TOOL");
    console.log(response.data);
    console.log("===============================");

    return JSON.stringify(response.data.results);
  },
  {
    name: "update_files",
    description:
      "Update existing files or create new files in the project. If the specified file already exists, its contents will be replaced. If the file does not exist, a new file will be created. Use this tool whenever you need to create or modify files.",
    schema: z.object({
      files: z
        .array(
          z.object({
            file: z
              .string()
              .describe("The path of the file to create or update."),
            content: z
              .string()
              .describe(
                "The complete content that should be written to the file."
              ),
          })
        )
        .describe(
          "A list of files to create or update, including their file paths and complete contents."
        ),
    }),
  }
);