"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Search, ChevronLeft } from "lucide-react";

interface AnimatedContentProps {
  isScreens?: boolean;
}

const AnimatedContent: React.FC<AnimatedContentProps> = ({
  isScreens = false,
}) => {
  if (isScreens) {
    return (
      <>
        {/* First (back) screen */}
        <motion.div
          className="absolute left-[10%] top-10 w-[280px] h-[560px] bg-gradient-to-br from-blue-600/5 via-sky-400/5 to-indigo-300/5 rounded-[40px] shadow-xl overflow-hidden"
          initial={{ rotate: -12, x: -50 }}
          animate={{ rotate: -12, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="grid grid-cols-2 gap-4 p-6">
            {[
              "Basics",
              "Diagnosis",
              "Symptoms",
              "Treatment",
              "Clinical trials",
              "Life hacks",
              "Mental health",
              "Prevention",
            ].map((item, i) => (
              <motion.div
                key={i}
                className="aspect-square bg-white/80 rounded-2xl flex items-center justify-center p-4 text-sm font-medium text-blue-600 italic"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1 + i * 0.1 }}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Middle screen */}
        <motion.div
          className="absolute left-[30%] top-20 w-[300px] h-[560px] bg-blue-900 rounded-[40px] shadow-xl overflow-hidden"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <div className="p-6 bg-blue-900 text-white h-full">
            <div className="flex items-center gap-2 mb-6">
              <ChevronLeft className="h-5 w-5" />
              <span className="text-xl font-semibold italic">Diagnosis</span>
            </div>
            <p className="text-sm text-sky-200 mb-8 italic">
              When you first receive a new diagnosis, it can be hard to remember
              the conversation that follows from your doctor. Here, we'll teach
              you what the diagnosis means and what to do about it.
            </p>
            <div className="grid gap-4">
              {["Early Symptoms", "Testing", "Labs & bloodwork", "Imaging"].map(
                (item, i) => (
                  <motion.div
                    key={i}
                    className="bg-blue-800/50 p-4 rounded-xl flex items-center justify-between"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1.2 + i * 0.1 }}
                  >
                    <span>{item}</span>
                    <span className="text-xs text-sky-300 italic">12 Q&As</span>
                  </motion.div>
                )
              )}
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 bg-clip-text text-transparent">
          Top doctors answer your health questions
        </h1>
        <p className="mx-auto max-w-[600px] text-blue-600 md:text-xl italic">
          Watch expert video answers from certified medical professionals. Get
          reliable health information instantly.
        </p>
      </motion.div>
      <motion.div
        className="w-full max-w-md space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
            <Select>
              <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm pl-12 pr-6 py-6 border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-full text-xl">
                <SelectValue placeholder="I am navigating..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="symptoms">My Symptoms</SelectItem>
                <SelectItem value="conditions">Medical Conditions</SelectItem>
                <SelectItem value="medications">Medications</SelectItem>
                <SelectItem value="procedures">Medical Procedures</SelectItem>
                <SelectItem value="mental-health">Mental Health</SelectItem>
                <SelectItem value="nutrition">Diet & Nutrition</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            size="icon"
            className="bg-gradient-to-r from-blue-600 to-sky-400 text-white rounded-full h-12 w-12 flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>
    </>
  );
};

export default AnimatedContent;
