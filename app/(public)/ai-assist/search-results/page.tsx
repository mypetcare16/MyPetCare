import AiGeneratedContent from "@/components/ai/ai-generated-content";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { search } from "@/lib/ai/search";
import { AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SearchResults({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const searchQuery = searchParams?.searchQuery;
  if (!searchQuery) redirect("/ai-assist/search-ai");

  const { data: videoList, error } = await search(searchQuery);

  return (
    <section
      className="flex justify-center items-center flex-1
                  bg-gradient-to-br from-pink-50/60 to-purple-50 min-h-[calc(100vh-4.5rem)] p-8"
    >
      <div
        className="w-full h-full 
                rounded-2xl bg-white
                p-5 flex flex-col"
      >
        <h1
          className="border-b-2 border-black/10
               font-semibold tracking-wide 
               text-xl mb-5 flex justify-start items-center"
        >
          <Sparkles className="mr-2" />
          <span>{searchQuery}</span>
        </h1>
        {error ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>
              Oops! Something went wrong while processing your request. Please
              try again later or contact support if the issue persists
            </AlertDescription>
          </Alert>
        ) : videoList && videoList?.length > 0 ? (
          <AiGeneratedContent videoList={videoList} searchQuery={searchQuery} />
        ) : (
          <div className="flex flex-col gap-2 justify-center">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Found!</AlertTitle>
              <AlertDescription>
                No relevant answers were found for your query. Please refine
                your question and try again, or explore related topics for more
                information.
              </AlertDescription>
            </Alert>
            <Link
              className="w-fit px-2 py-1 bg-blue-300 hover:bg-blue-500 rounded-md hover:scale-105 transition-all duration-300 text-white"
              href={"/ai-assist/search-ai"}
            >
              Search Again
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
