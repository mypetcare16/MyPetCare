import { z } from "zod";

// define a schema for the notifications
export const medicalResultShema = z.object({
  content: z.string(),
  qna: z.array(
    z.object({
      sequenceNumber: z
        .number()
        .describe("Sequence number of the question in digit"),
      question: z.string().describe("Question related the content given"),
      answer: z.string().describe("Answer to the given question"),
    })
  ),
});
