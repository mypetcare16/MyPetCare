"use client";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import { cn } from "@/lib/utils";
import { ChevronRight, Search, Sparkles } from "lucide-react";
import { ChangeEvent, MouseEvent, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AutosizeTextarea,
  AutosizeTextAreaRef,
} from "@/components/ui/auto-size-textarea";
import { SUGGESTIONS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import ThreeDotsWave from "@/components/ai/three-dots-loader";

export default function SearchAI() {
  const router = useRouter();
  const [showSuggestions, setShowSuggestion] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<AutosizeTextAreaRef>(null);
  const [isLaoding, setIsLoading] = useState(false);

  const handleContainerClick = () => {
    if (!showSuggestions) {
      setShowSuggestion(true);
      inputRef.current?.textArea.focus();
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 100) setSearchValue(value);
  };

  const searchValueLength = searchValue.length;
  const isMaxSearchLimit = searchValueLength >= 100;

  const handleSearchClick = (
    e: MouseEvent<HTMLButtonElement>,
    searchText: string
  ) => {
    e.stopPropagation();
    if (!searchText || !searchText.length) return;
    navigateWithSearchQuery(searchText);
  };

  const navigateWithSearchQuery = (searchQuery: string) => {
    const params = new URLSearchParams();
    params.set("searchQuery", searchQuery);
    setIsLoading(true);
    router.push(`search-results?${params.toString()}`);
  };

  const handleClickSuggestion = (suggestion: string) => {
    setSearchValue(suggestion);
    navigateWithSearchQuery(suggestion);
  };

  return (
    <section
      className="flex justify-center items-center flex-1
                  bg-gradient-to-br from-pink-50/60 to-purple-50 h-[calc(100vh-4.5rem)] p-8"
    >
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
        }}
        className="w-fit flex flex-col justify-center items-center gap-2 h-full"
      >
        <AnimatePresence>
          <motion.div
            key="top-content"
            className="flex flex-col gap-2 justify-center items-center"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.2, type: "bounce", bounce: 1 }}
          >
            <AnimatedGradientText>
              🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />{" "}
              <span
                className={cn(
                  `inline animate-gradient 
          bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40]
         bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent text-sm font-light track`
                )}
              >
                Introducing VetVault AI
              </span>
              <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
            </AnimatedGradientText>
            <h1 className="font-bold text-2xl">
              Discover Better Health with VetVault
            </h1>
            <p className="text-sm text-gray-500">
              Explore reliable medical information at your fingertips.
            </p>
            <div
              className={cn(
                "w-full rounded-xl mt-5 font-sans  shadow-blue-50",
                "transition-all ease-in-out duration-300",
                "bg-white flex justify-start items-center p-1.5",
                "hover:drop-shadow-md has-[:focus]:ring-1 has-[:focus]:ring-ring overflow-hidden",
                {
                  "shadow-md flex-col": showSuggestions,
                  "shadow-xl": !showSuggestions,
                }
              )}
              onClick={handleContainerClick}
            >
              <AutosizeTextarea
                ref={inputRef}
                minHeight={30}
                className="rounded-xl"
                placeholder="Find answers to your medical questions..."
                onChange={handleSearch}
                value={searchValue}
                onBlur={() => setShowSuggestion(false)}
                disabled={isLaoding}
              />
              <div
                className={cn({
                  "flex justify-between items-end gap-5 w-full":
                    showSuggestions,
                })}
              >
                {showSuggestions && (
                  <span
                    className={cn("text-gray-500 px-3 text-sm", {
                      "text-red-400": isMaxSearchLimit,
                    })}
                  >
                    {searchValue.length}/100
                  </span>
                )}
                <Button
                  className={cn(
                    "bg-none rounded-xl flex justify-center items-center",
                    {
                      "self-end": showSuggestions,
                      "animate-pulse": isLaoding,
                    }
                  )}
                  variant={"outline"}
                  onClick={(e) => handleSearchClick(e, searchValue)}
                  disabled={!searchValueLength || isLaoding}
                >
                  {isLaoding ? (
                    <ThreeDotsWave />
                  ) : (
                    <>
                      <Sparkles className="text-blue-500" />
                      <span>Search</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {showSuggestions && !searchValueLength && (
            <motion.div
              key="suggestion"
              layout
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.5,
                transition: { duration: 0.5, ease: "easeInOut" },
              }}
              className="bg-white/50 shadow-md rounded-2xl w-full p-2"
            >
              <ul className="flex flex-col gap-3 text-sm font-light ">
                {SUGGESTIONS.map((suggestion, index) => (
                  <li
                    key={suggestion.id}
                    className={cn(
                      `text-xs font-normal flex gap-1 items-center 
              text-gray-500 font-sans hover:bg-stone-200/50 p-1 hover:rounded-lg 
              cursor-pointer hover:text-black hover:font-semibold  pb-2 transition-all duration-300`,
                      {
                        "border-b-2 border-border":
                          index !== SUGGESTIONS.length - 1,
                      }
                    )}
                    onClick={() =>
                      handleClickSuggestion(suggestion.displayText)
                    }
                  >
                    <Search className="h-3 w-3 " />
                    <span>{suggestion.displayText}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
