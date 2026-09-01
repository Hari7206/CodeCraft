import axios from "axios";
import { tool } from "langchain";
import * as z from "zod";

const AXIOS_TIMEOUT = 10000; // don't let a hung sandbox service hang the whole agent

export const listFiles = tool(
  async ({}, config) => {
    const writer = config.writer;
    if (!config || !config.context || !config.context.projectId) {
      throw new Error("Project ID is missing. Please provide a valid projectId in the context.");
    }

    const projectId = config.context.projectId;
    const API_URL = `http://sandbox-service-${projectId}:3000`;

    writer?.write("Listing files in project directory\n");
    console.log("Request:", `GET ${API_URL}/list-files`);

    try {
      const response = await axios.get(`${API_URL}/list-files`, { timeout: AXIOS_TIMEOUT });
      writer?.write("Files listed successfully\n");
      return JSON.stringify(response.data.files);
    } catch (err) {
      writer?.write(`Failed to list files: ${err.message}\n`);
      throw new Error(`list_files failed: ${err.message}`);
    }
  },
  {
    name: "list_files",
    description:
      "List all the files in the project directory. This is useful for understanding what files are available to work with.",
  }
);

export const readFiles = tool(
  async ({ files }, config) => {
    const writer = config.writer;
    if (!config || !config.context || !config.context.projectId) {
      throw new Error("Project ID is missing. Please provide a valid projectId in the context.");
    }
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error("No files specified. Please provide an array of file paths to read.");
    }

    const projectId = config.context.projectId;
    const API_URL = `http://sandbox-service-${projectId}:3000`;
    const url = `${API_URL}/read-files?files=${files.join(",")}`;

    writer?.write("Reading files in project directory\n");

    try {
      const response = await axios.get(url, { timeout: AXIOS_TIMEOUT });
      writer?.write("Files read successfully\n");
      return JSON.stringify(response.data);
    } catch (err) {
      writer?.write(`Failed to read files: ${err.message}\n`);
      throw new Error(`read_files failed: ${err.message}`);
    }
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

export const updateFiles = tool(
  async ({ files }, config) => {
    const writer = config.writer;
    if (!config || !config.context || !config.context.projectId) {
      throw new Error("Project ID is missing. Please provide a valid projectId in the context.");
    }
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error("No files specified. Please provide an array of files to create or update.");
    }

    const projectId = config.context.projectId;
    const API_URL = `http://sandbox-service-${projectId}:3000`;

    writer?.write("Updating files in project directory\n"); // fixed: was `write` (undefined ref)

    try {
      const response = await axios.patch(
        `${API_URL}/update-files`,
        { updates: files },
        { timeout: AXIOS_TIMEOUT }
      );
      writer?.write("Files updated successfully\n");
      return JSON.stringify(response.data.results);
    } catch (err) {
      writer?.write(`Failed to update files: ${err.message}\n`);
      throw new Error(`update_files failed: ${err.message}`);
    }
  },
  {
    name: "update_files",
    description:
      "Update existing files or create new files in the project. If the specified file already exists, its contents will be replaced. If the file does not exist, a new file will be created. Use this tool whenever you need to create or modify files.",
    schema: z.object({
      files: z
        .array(
          z.object({
            file: z.string().describe("The path of the file to create or update."),
            content: z
              .string()
              .describe("The complete content that should be written to the file."),
          })
        )
        .describe(
          "A list of files to create or update, including their file paths and complete contents."
        ),
    }),
  }
);