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

export default agent;