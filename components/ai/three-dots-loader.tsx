import { motion } from "framer-motion";
import React from "react";

const LoadingDot = () => (
  <motion.span
    className="block w-4 h-4 bg-black rounded-full animate-pulse"
    variants={{
      initial: {
        y: "0%",
      },
      animate: {
        y: "29%",
      },
    }}
    transition={{
      duration: 0.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    }}
  />
);

export default function ThreeDotsWave() {
  return (
    <motion.div
      className="w-fit px-2 flex justify-around gap-2"
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.2,
          },
        },
      }}
      initial="initial"
      animate="animate"
    >
      <LoadingDot />
      <LoadingDot />
      <LoadingDot />
    </motion.div>
  );
}
