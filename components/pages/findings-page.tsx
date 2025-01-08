"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FINDINGS } from "@/components/data/findingsNames";

export type FindingItem = {
  id: string;
  name: string;
};

interface FindingsComponentProps {
  findings: FindingItem[];
  setFindings: React.Dispatch<React.SetStateAction<FindingItem[]>>;
  vitals: {
    temperature: string;
    bloodPressure: string;
    pulse: string;
    height: string;
    weight: string;
    bmi: string;
    waistHip: string;
    spo2: string;
  };
  setVitals: React.Dispatch<
    React.SetStateAction<{
      temperature: string;
      bloodPressure: string;
      pulse: string;
      height: string;
      weight: string;
      bmi: string;
      waistHip: string;
      spo2: string;
    }>
  >;
}

export default function FindingsComponent({
  findings,
  setFindings,
  vitals,
  setVitals,
}: FindingsComponentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");

  // Initialize BP fields
  useEffect(() => {
    const [sys, dia] = vitals.bloodPressure.split("/").map((v) => v.trim());
    setSystolic(sys || "");
    setDiastolic(dia || "");
  }, [vitals.bloodPressure]);

  // Filter findings based on search term
  const filteredFindings = useMemo(() => {
    if (!searchTerm) return [];
    return FINDINGS.filter((finding) =>
      finding.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleAddItem = (item: string) => {
    if (!findings.some((f) => f.name === item)) {
      const newItem: FindingItem = { id: Date.now().toString(), name: item };
      setFindings((prev) => [...prev, newItem]);
    }
    setSearchTerm("");
    setIsSearching(false);
  };

  const handleRemoveItem = (id: string) => {
    setFindings((prev) => prev.filter((item) => item.id !== id));
  };

  const handleBPChange = (sys: string, dia: string) => {
    setSystolic(sys);
    setDiastolic(dia);
    const newBP = sys || dia ? `${sys}/${dia}`.replace(/^\/*|\/*$/g, "") : "";
    setVitals((prev) => ({
      ...prev,
      bloodPressure: newBP,
    }));
  };

  // Calculate BMI when height or weight changes
  useEffect(() => {
    if (vitals.height && vitals.weight) {
      const heightInMeters = parseFloat(vitals.height) / 100;
      const weightInKg = parseFloat(vitals.weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(2);
        setVitals((prev) => ({ ...prev, bmi }));
      }
    }
  }, [vitals.height, vitals.weight]);

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Findings</h3>
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-10 py-3 text-lg"
            placeholder="Search findings (e.g., Throat Congestion, Fever)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearching(true);
            }}
            onFocus={() => setIsSearching(true)}
            onBlur={() => setTimeout(() => setIsSearching(false), 200)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-10"
          onClick={() => {
            if (searchTerm.trim()) {
              handleAddItem(searchTerm.trim());
            }
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {isSearching && filteredFindings.length > 0 && (
        <ul className="mt-4 space-y-2 absolute z-10 bg-background border rounded-md shadow-lg max-h-60 overflow-auto w-full max-w-[calc(100%-5rem)]">
          {filteredFindings.map((finding) => (
            <li
              key={finding}
              className="p-2 hover:bg-gray-200 cursor-pointer transition-colors"
              onClick={() => handleAddItem(finding)}
            >
              {finding}
            </li>
          ))}
        </ul>
      )}

      <ScrollArea className="h-[150px] mt-4">
        <div className="flex flex-wrap gap-3">
          {findings.map((item) => (
            <div key={item.id} className="flex items-center">
              <Button
                variant="secondary"
                size="lg"
                className="flex items-center gap-2 text-lg"
              >
                {item.name}
              </Button>
              <X
                className="h-4 w-4 text-red-500 cursor-pointer"
                onClick={() => handleRemoveItem(item.id)}
              />
            </div>
          ))}
        </div>
      </ScrollArea>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h4 className="text-lg font-semibold mb-4">Vitals</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>BP</Label>
              <div className="flex items-center gap-2">
                <Input
                  className="w-16"
                  value={systolic}
                  onChange={(e) => handleBPChange(e.target.value, diastolic)}
                  placeholder=""
                />
                <span>/</span>
                <Input
                  className="w-16"
                  value={diastolic}
                  onChange={(e) => handleBPChange(systolic, e.target.value)}
                  placeholder=""
                />
                <span className="text-sm text-muted-foreground">mmHg</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pulse</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={vitals.pulse}
                  onChange={(e) =>
                    setVitals((prev) => ({ ...prev, pulse: e.target.value }))
                  }
                  placeholder=""
                />
                <span className="text-sm text-muted-foreground">bpm</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Height</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={vitals.height}
                  onChange={(e) =>
                    setVitals((prev) => ({ ...prev, height: e.target.value }))
                  }
                  placeholder=""
                />
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Weight</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={vitals.weight}
                  onChange={(e) =>
                    setVitals((prev) => ({ ...prev, weight: e.target.value }))
                  }
                  placeholder=""
                />
                <span className="text-sm text-muted-foreground">kg</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Temperature</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={vitals.temperature}
                  onChange={(e) =>
                    setVitals((prev) => ({
                      ...prev,
                      temperature: e.target.value,
                    }))
                  }
                  placeholder=""
                />
                <span className="text-sm text-muted-foreground">F</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>BMI</Label>
              <div className="flex items-center gap-2">
                <Input value={vitals.bmi} readOnly placeholder="" />
                <span className="text-sm text-muted-foreground">Kg/m2</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Waist/Hip</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={vitals.waistHip}
                  onChange={(e) =>
                    setVitals((prev) => ({ ...prev, waistHip: e.target.value }))
                  }
                  placeholder=""
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>SPO2</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={vitals.spo2}
                  onChange={(e) =>
                    setVitals((prev) => ({ ...prev, spo2: e.target.value }))
                  }
                  placeholder=""
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
