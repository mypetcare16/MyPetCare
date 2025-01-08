"use client";

import { supabase } from "@/lib/utils/supabase/client";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SearchVideos } from "@/lib/ai/search";

export default function VideoTranscriptForm() {
  const [transcript, setTranscript] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [savedEmbedding, setSavedEmbedding] = useState<SearchVideos>([]);

  const [error, setError] = useState<string | null>(null);

  const getEmbeddings = async (input: string) => {
    try {
      const response = await fetch("/api/getEmbeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // OpenAI embeddings are nested under data[0].embedding
      return data.data[0].embedding;
    } catch (error) {
      console.error("Error getting embeddings:", error);
      setError("Failed to get embeddings");
      return null;
    }
  };

  const saveEmbeddings = async (
    embeddings: number[],
    input: string,
    video_url: string,
    video_thumbnail: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .insert([
          {
            embedding: embeddings,
            content: input,
            video_url,
            video_thumbnail,
          },
        ])
        .select()
        .returns<SearchVideos>();

      if (error) throw error;
      setSavedEmbedding(data);
      return data;
    } catch (error) {
      console.error("Error saving embeddings:", error);
      setError("Failed to save embeddings");
      return null;
    }
  };

  const searchContent = async (searchQuery: string) => {
    try {
      const embedding = await getEmbeddings(searchQuery);

      if (!embedding || !Array.isArray(embedding)) {
        throw new Error("Invalid embedding format");
      }

      console.log(embedding);

      const { data, error } = await supabase
        .rpc("match_documents", {
          query_embedding: embedding,
          match_threshold: 0.45,
          match_count: 5,
        })
        .returns<SearchVideos>();

      setSearchResults(data || []);
      console.log({ data, error });
      return data;
    } catch (error) {
      console.error("Error searching content:", error);
      setError("Failed to search content");
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Generate embeddings using OpenAI
      const embeddings = await getEmbeddings(transcript);

      // TODO: Save data to Supabase
      // await saveToSupabase({ transcript, videoUrl, thumbnailUrl, embeddings })
      await saveEmbeddings(embeddings, transcript, videoUrl, thumbnailUrl);

      // For demonstration purposes, we'll just log the data
      console.log("Form submitted:", { transcript, videoUrl, thumbnailUrl });

      // Reset form
      setTranscript("");
      setVideoUrl("");
      setThumbnailUrl("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <Card className="w-full max-w-2xl mx-auto overflow-x-hidden">
        <CardHeader>
          <CardTitle>Video Transcript Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transcript">Transcript</Label>
              <Textarea
                id="transcript"
                placeholder="Enter video transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://example.com/video.mp4"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Video Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                type="url"
                placeholder="https://img.youtube.com/vi/{videoId}/hqdefault.jpg"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>

            {/* <div className="text-wrap ">{JSON.stringify(savedEmbedding)}</div> */}
          </form>
        </CardContent>
      </Card>
      <VideoSearch searchContent={searchContent} />
    </div>
  );
}

export function VideoSearch({
  searchContent,
}: {
  searchContent: (searchQuery: string) => Promise<SearchVideos | null>;
}) {
  const [question, setQuestion] = useState("");
  const [results, setResults] = useState<SearchVideos | null>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    try {
      const searchResults = await searchContent(question);
      setResults(searchResults);
      console.log({ searchResults });
    } catch (error) {
      console.error("Error searching videos:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="w-3/4 mx-auto mt-8">
      <CardHeader>
        <CardTitle>Search Videos</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              placeholder="Enter your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>
        {results && results.length && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Search Results:</h3>
            <ul className="list-disc pl-5">
              {results.map((video) => (
                <li key={video.id}>
                  <a
                    href={video.video_url!}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {video.video_url!}
                  </a>
                  <p>{video.content}</p>
                  <p>{JSON.stringify(video.embedding)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
