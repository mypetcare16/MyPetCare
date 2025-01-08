"use client";

import {
  SkeletonLoader,
  VideoSkeletonLoader,
} from "@/components/ai/SkeletonLoader";
import { medicalResultShema } from "@/lib/ai/schema";
import { SearchVideos } from "@/lib/ai/search";
import { useEffect, useState } from "react";
import { experimental_useObject as useObject } from "ai/react";
import HeroVideoDialog from "@/components/ui/hero-video-dialog";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import Link from "next/link";

const AiGeneratedContent = ({
  videoList,
  searchQuery,
}: {
  videoList: SearchVideos | null;
  searchQuery: string;
}) => {
  const [isStreamingFinished, setIsStreamingFinished] = useState(false);
  const { object, submit, isLoading, stop, error } = useObject({
    api: "/api/use-object",
    schema: medicalResultShema,
    onFinish: (e) => {
      setIsStreamingFinished(true);
    },
  });

  const context = videoList?.map((v) => v.content).join(" ");

  useEffect(() => {
    setIsStreamingFinished(false);
    submit({ question: searchQuery, context });
  }, [searchQuery, context]);

  const getHrefLink = (question: string) => {
    const params = new URLSearchParams();
    params.set("searchQuery", question);
    return `/ai-assist/search-results?${params.toString()}`;
  };

  return (
    <div className="">
      {object?.content ? <p>{object.content}</p> : <SkeletonLoader />}
      <div>
        <h2 className="text-lg font-semibold font-sans mt-5 mb-2">
          Related Videos
        </h2>
        {!videoList ? (
          <VideoSkeletonLoader />
        ) : (
          <motion.div className="relative">
            {videoList.map((video) => (
              <HeroVideoDialog
                className="dark:hidden block h-[225px] w-[250px]"
                animationStyle="from-center"
                videoSrc={video.video_url!}
                thumbnailSrc={video.video_thumbnail!}
                thumbnailAlt="Hero Video"
                key={video.id}
              />
            ))}
          </motion.div>
        )}
      </div>
      {object?.qna && object?.qna.length > 0 && (
        <h2 className="text-lg font-semibold font-sans mt-5 mb-2">
          Suggested QnAs
        </h2>
      )}
      <Accordion type="single" collapsible className="w-full space-y-2">
        {object?.qna?.map((pair, index) => (
          <AccordionItem
            value={`item-${pair?.sequenceNumber ?? `${index}-no`}`}
            key={`${pair?.sequenceNumber ?? `${index}-no`}`}
            className="bg-gradient-to-br from-pink-50/60 to-purple-50/60 rounded-2xl px-2 border-b-0"
          >
            <AccordionTrigger>
              <Link
                className="cursor-pointer"
                href={!isStreamingFinished ? "#" : getHrefLink(pair?.question!)}
              >
                {pair?.question}
              </Link>
            </AccordionTrigger>
            <AccordionContent>{pair?.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default AiGeneratedContent;
