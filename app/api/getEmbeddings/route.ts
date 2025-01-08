// api/getEmbeddings/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Move this to environment variable
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { input: string };

    if (!body.input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: body.input,
      encoding_format: "float",
    });

    return NextResponse.json(embedding);
  } catch (error) {
    console.error("Embedding generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate embedding" },
      { status: 500 }
    );
  }
}
