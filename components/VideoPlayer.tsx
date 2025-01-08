"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export default function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVideoError = (error: any) => {
    console.error("Video error:", error);
    setVideoError(
      "An error occurred while loading the video. Please try again later."
    );
  };

  return (
    <motion.div
      className="absolute right-[10%] top-30 w-[320px] h-[580px] bg-black rounded-[40px] shadow-xl overflow-hidden"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.2 }}
    >
      <div className="relative h-full">
        <ReactPlayer
          url="https://customer-j0sdkn6xb7js2ied.cloudflarestream.com/0b080d03800122cd55a9a28503740587/manifest/video.m3u8"
          width="100%"
          height="100%"
          playing={isPlaying}
          muted={isMuted}
          onError={handleVideoError}
          config={{
            file: {
              forceHLS: true,
              hlsOptions: {
                xhrSetup: function (xhr: any, url: string) {
                  xhr.open("GET", url, true);
                },
              },
            },
          }}
        />
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white p-4 text-center">
            {videoError}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-2 italic">
            What is the best treatment for my diagnosis?
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-sky-200" />
            <div>
              <p className="font-semibold">Dr. Sarah Johnson</p>
              <p className="text-sm text-sky-300 italic">
                Reproductive Endocrinologist
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={togglePlayPause}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={toggleMute}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
