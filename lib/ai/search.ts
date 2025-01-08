"use server";
import { Database } from "@/database.types";
import { supabase } from "@/lib/utils/supabase/client";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Move this to environment variable
});

export type SearchVideos = Database["public"]["Tables"]["documents"]["Row"][];

export async function search(input: string) {
  "use server";
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input,
    encoding_format: "float",
  });

  const inputEmbedding = res.data[0].embedding;

  if (!inputEmbedding || !Array.isArray(inputEmbedding)) {
    return { data: null, error: "Not able to generate embeddings" };
  }

  const { data, error } = await supabase
    .rpc("match_documents", {
      query_embedding: inputEmbedding,
      match_threshold: 0.45,
      match_count: 5,
    })
    .returns<SearchVideos>();

  return { data, error };
}
