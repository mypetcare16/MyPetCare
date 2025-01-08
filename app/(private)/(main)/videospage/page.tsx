"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Hls from "hls.js";

const CLOUDFLARE_ACCOUNT_ID = "6a67adb13c88fbe6f0617915edb45120";
const CLOUDFLARE_API_TOKEN = "2Miq3pRFI1VEu3IkwLX4RGYqbDO7FPlJ4FHNluX4";

interface Video {
  _id: Id<"videos">;
  userId: string;
  url: string;
  cloudflareId: string;
  status: string;
  metadata: any;
  createdAt: string;
}

const VideoPlayer: React.FC<{ src: string }> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      controls
      playsInline
    />
  );
};

export default function VideoUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const { user } = useUser();

  const userId = user?.id || "";

  const videos = useQuery(api.videos.list, { userId }) || [];
  const addVideo = useMutation(api.videos.add);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const uploadToCloudflare = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload to Cloudflare");
    }

    const result = await response.json();
    return result.result;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const cloudflareResult = await uploadToCloudflare(file);

      await addVideo({
        userId,
        url: cloudflareResult.playback.hls,
        cloudflareId: cloudflareResult.uid,
        status: "uploaded",
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
        createdAt: new Date().toISOString(),
      });

      setFile(null);
      setUploadProgress(100);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (uploadProgress === 100) {
      const timer = setTimeout(() => setUploadProgress(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadProgress]);

  return (
    <div className="w-full min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
          Video Upload
        </h1>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-10 h-10 mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  MP4, WebM, or OGG (MAX. 2GB)
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept="video/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {file && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Selected file: {file.name}
              </p>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {uploading ? "Uploading..." : "Upload Video"}
              </button>
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      Upload Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {uploadProgress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div
                    style={{ width: `${uploadProgress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Uploaded Videos</h2>
          {videos.length === 0 ? (
            <p className="text-gray-500">No videos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video: Video) => (
                <div
                  key={video._id}
                  className="bg-gray-50 rounded-lg overflow-hidden shadow-md"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <VideoPlayer src={video.url} />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                      {video.metadata.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Uploaded on{" "}
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
