import "dotenv/config";

import { ChatMistralAI } from "@langchain/mistralai";
import { listFiles, readFiles, updateFiles } from "./tool.js";
import { createAgent } from "langchain";

const model = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

const agent = createAgent({
  model,
  tools: [listFiles, readFiles, updateFiles],
});

await agent.invoke({
  messages: [
    {
      role: "user",
      content: `
Change the application's theme from dark to light.

First, inspect the project structure using list_files.
Then identify the main application files responsible for the UI/theme, such as App.jsx, App.tsx, CSS files, theme configuration, or other relevant files.
Read the relevant files using read_files before making any changes.

After understanding the existing implementation, update the appropriate files using update_files.

The final result should:
- Use a clean light theme.
- Replace dark backgrounds with light backgrounds where appropriate.
- Use dark text on light backgrounds for good readability.
- Preserve the existing application functionality and layout.
- Do not remove or rewrite unrelated functionality.
- Keep the existing component structure unless a change is necessary.
- Make sure the application remains valid and runnable after the changes.
`,
    },
  ],
});