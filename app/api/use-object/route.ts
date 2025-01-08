import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { medicalResultShema } from "@/lib/ai/schema";
import { AI_SEARCH_PROMPT } from "@/lib/constants";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { question, context }: { question: string; context: string } =
    await req.json();

  const aiPrompt = AI_SEARCH_PROMPT.replace(
    "{{userQuestion}}",
    question
  ).replace("{{context}}", context);

  const result = streamObject({
    model: openai("gpt-4-turbo"),
    schema: medicalResultShema,
    prompt: aiPrompt,
  });

  return result.toTextStreamResponse();
}
