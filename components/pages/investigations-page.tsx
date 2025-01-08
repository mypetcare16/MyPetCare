"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { TEST_CATEGORIES } from "@/components/data/investigations";

type InvestigationItem = {
  id: string;
  name: string;
  //category: string;
};

interface InvestigationsPageProps {
  investigations: InvestigationItem[];
  setInvestigations: React.Dispatch<React.SetStateAction<InvestigationItem[]>>;
  investigationNotes: string;
  setInvestigationNotes: React.Dispatch<React.SetStateAction<string>>;
}

// Utility function to merge predefined and custom data
const mergeInvestigationData = (
  customData: { name: string; category: string }[]
) => {
  const mergedData: Record<string, string[]> = { ...TEST_CATEGORIES };

  customData.forEach((item) => {
    if (!mergedData[item.category]) {
      mergedData[item.category] = [];
    }
    if (!mergedData[item.category].includes(item.name)) {
      mergedData[item.category].push(item.name);
    }
  });

  return mergedData;
};

export default function InvestigationsPage({
  investigations,
  setInvestigations,
  investigationNotes,
  setInvestigationNotes,
}: InvestigationsPageProps) {
  const [categorySearch, setCategorySearch] = useState("");
  const [testSearch, setTestSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [customTest, setCustomTest] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const { user } = useUser();
  const userId = user?.id || "";

  const allInvestigations =
    useQuery(api.investigations.listInvestigations, { userId }) || [];
  const addInvestigation = useMutation(api.investigations.addInvestigation);

  const mergedInvestigationData = useMemo(
    () => mergeInvestigationData(allInvestigations),
    [allInvestigations]
  );

  const filteredCategories = useMemo(() => {
    if (!categorySearch) return [];
    const categories = Object.keys(mergedInvestigationData);
    return categories.filter((category) =>
      category.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [mergedInvestigationData, categorySearch]);

  const filteredTests = useMemo(() => {
    if (!selectedCategory || !testSearch) return [];
    return (
      mergedInvestigationData[selectedCategory]?.filter((test) =>
        test.toLowerCase().includes(testSearch.toLowerCase())
      ) || []
    );
  }, [mergedInvestigationData, selectedCategory, testSearch]);

  const addInvestigationItem = useCallback(
    (name: string, category: string) => {
      const newItem: InvestigationItem = {
        id: Date.now().toString(),
        name: name,
        // category: category,
      };
      setInvestigations((prev) => [...prev, newItem]);
      setTestSearch("");
    },
    [setInvestigations]
  );

  const handleCategorySearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCategorySearch(e.target.value);
      setIsCategoryDropdownOpen(true);
    },
    []
  );

  const handleTestSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTestSearch(e.target.value);
    },
    []
  );

  const handleCategorySelect = useCallback(
    (category: string) => {
      if (selectedCategory === category) {
        // If the same category is clicked again, deselect it
        setSelectedCategory(null);
        setCategorySearch("");
      } else {
        setSelectedCategory(category);
        setCategorySearch(category);
      }
      setTestSearch("");
      setIsCategoryDropdownOpen(false);
    },
    [selectedCategory]
  );

  const handleTestSelect = useCallback(
    (test: string) => {
      if (selectedCategory) {
        const combinedName = `${selectedCategory} - ${test}`;
        addInvestigationItem(combinedName, selectedCategory);
        setSelectedCategory(null);
        setCategorySearch("");
        setTestSearch("");
      }
    },
    [selectedCategory, addInvestigationItem]
  );

  const handleAddCustom = useCallback(async () => {
    if (customCategory && customTest && userId) {
      const combinedName = `${customCategory} - ${customTest}`;
      await addInvestigation({
        name: customTest,
        category: customCategory,
        userId,
      });
      addInvestigationItem(combinedName, customCategory);
      setCustomCategory("");
      setCustomTest("");
    }
  }, [
    customCategory,
    customTest,
    userId,
    addInvestigation,
    addInvestigationItem,
  ]);

  const handleRemoveItem = useCallback(
    (id: string) => {
      setInvestigations((prev) => prev.filter((item) => item.id !== id));
    },
    [setInvestigations]
  );

  const selectedInvestigations = useMemo(
    () => (
      <div className="flex flex-wrap gap-3">
        {investigations.map((item) => (
          <div key={item.id} className="flex items-center">
            <Button
              variant="secondary"
              size="lg"
              className="flex items-center gap-2 text-lg"
            >
              {item.name}
            </Button>
            <X
              className="h-4 w-4 cursor-pointer text-red-500 ml-2"
              onClick={() => handleRemoveItem(item.id)}
            />
          </div>
        ))}
      </div>
    ),
    [investigations, handleRemoveItem]
  );

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Investigations</h3>
      <div className="mb-4 flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-10 pr-10 py-3 text-lg"
            placeholder="Search categories (e.g., Haematology)"
            value={selectedCategory || categorySearch}
            onChange={handleCategorySearch}
            onBlur={() =>
              setTimeout(() => setIsCategoryDropdownOpen(false), 200)
            }
          />
          {(selectedCategory || categorySearch) && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2"
              onClick={() => {
                setSelectedCategory(null);
                setCategorySearch("");
                setTestSearch("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {isCategoryDropdownOpen && filteredCategories.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredCategories.map((category, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-200 cursor-pointer transition-colors"
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-10 py-3 text-lg"
            placeholder={
              selectedCategory
                ? `Search tests in ${selectedCategory}`
                : "Select a category first"
            }
            value={testSearch}
            onChange={handleTestSearch}
            disabled={!selectedCategory}
          />
          {filteredTests.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredTests.map((test, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-200 cursor-pointer transition-colors"
                  onClick={() => handleTestSelect(test)}
                >
                  {test}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="mb-4 flex space-x-4">
        <Input
          placeholder="Custom Category"
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value)}
        />
        <Input
          placeholder="Custom Test"
          value={customTest}
          onChange={(e) => setCustomTest(e.target.value)}
        />
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-10"
          onClick={handleAddCustom}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      <ScrollArea className="h-[150px] mt-4 border rounded-md">
        <div className="p-3">
          <h4 className="text-lg font-semibold mb-2">
            Selected Investigations
          </h4>
          {selectedInvestigations}
        </div>
      </ScrollArea>
      <Textarea
        placeholder="Investigation Notes"
        value={investigationNotes}
        onChange={(e) => setInvestigationNotes(e.target.value)}
        className="mt-4"
      />
    </div>
  );
}
