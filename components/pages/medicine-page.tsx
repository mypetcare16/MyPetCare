"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { MEDICINE_NAMES } from "@/components/data/medicineNames";

type MedicineItem = {
  id: string;
  name: string;
  dosage: string;
  route: string;
  timesPerDay: string;
  durationDays: string;
  timing: string;
};

interface MedicinePageProps {
  medicines: MedicineItem[];
  setMedicines: React.Dispatch<React.SetStateAction<MedicineItem[]>>;
  medicineInstructions: string;
  setMedicineInstructions: React.Dispatch<React.SetStateAction<string>>;
  medicineReminder: { message: boolean; call: boolean };
  setMedicineReminder: React.Dispatch<
    React.SetStateAction<{ message: boolean; call: boolean }>
  >;
}

export default function MedicinePage({
  medicines,
  setMedicines,
  medicineInstructions,
  setMedicineInstructions,
}: MedicinePageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [newMedicine, setNewMedicine] = useState<Partial<MedicineItem>>({
    name: "",
    dosage: "",
    route: "",
    timesPerDay: "",
    durationDays: "",
    timing: "",
  });

  const filteredSuggestions = MEDICINE_NAMES.filter((medicineName) =>
    medicineName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddMedicine = () => {
    if (
      newMedicine.name &&
      newMedicine.dosage &&
      newMedicine.route &&
      newMedicine.timesPerDay &&
      newMedicine.durationDays &&
      newMedicine.timing
    ) {
      const newMedicineItem: MedicineItem = {
        ...(newMedicine as MedicineItem),
        id: Date.now().toString(),
      };

      setMedicines((prev) => [...prev, newMedicineItem]);

      setNewMedicine({
        name: "",
        dosage: "",
        route: "",
        timesPerDay: "",
        durationDays: "",
        timing: "",
      });
      setSearchTerm("");
      setShowSuggestions(false);
    }
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((medicine) => medicine.id !== id));
  };

  const handleSuggestionClick = (medicineName: string) => {
    setNewMedicine((prev) => ({ ...prev, name: medicineName }));
    setSearchTerm(medicineName);
    setShowSuggestions(false);
  };

  return (
    <div className="mb-8 w-full overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4">Medicine</h3>
      <div className="flex items-center space-x-2 mb-4">
        <div ref={searchRef} className="relative flex-grow min-w-[150px]">
          <Search
            className={`absolute left-2 top-2.5 h-4 w-4 text-muted-foreground ${
              searchTerm && filteredSuggestions.length === 0 ? "invisible" : ""
            }`}
          />
          <Input
            className="pl-8 py-2 text-sm"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setNewMedicine((prev) => ({ ...prev, name: e.target.value }));
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-md mt-1 w-full max-h-60 overflow-y-auto">
              {filteredSuggestions.map((medicineName) => (
                <li
                  key={medicineName}
                  className="p-2 hover:bg-gray-200 cursor-pointer transition-colors text-sm"
                  onClick={() => handleSuggestionClick(medicineName)}
                >
                  {medicineName}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Input
          placeholder="Dosage"
          value={newMedicine.dosage}
          onChange={(e) =>
            setNewMedicine((prev) => ({ ...prev, dosage: e.target.value }))
          }
          className="w-24 text-sm"
        />
        <Select
          value={newMedicine.route || ""}
          onValueChange={(value) =>
            setNewMedicine((prev) => ({ ...prev, route: value }))
          }
        >
          <SelectTrigger className="w-32 text-sm">
            <SelectValue placeholder="Route" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Oral">Oral</SelectItem>
            <SelectItem value="Intravenous">Intravenous</SelectItem>
            <SelectItem value="Intramuscular">Intramuscular</SelectItem>
            <SelectItem value="subcutaneous">subcutaneous</SelectItem>
            <SelectItem value="intra articular">intra articular</SelectItem>
            <SelectItem value="local application">local application</SelectItem>
            <SelectItem value="per rectal">per rectal</SelectItem>
            <SelectItem value="in the eyes">in the eyes</SelectItem>
            <SelectItem value="in the ears">in the ears</SelectItem>
            <SelectItem value="sub lingual">sub lingual</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={newMedicine.timesPerDay || ""}
          onValueChange={(value) =>
            setNewMedicine((prev) => ({ ...prev, timesPerDay: value }))
          }
        >
          <SelectTrigger className="w-32 text-sm">
            <SelectValue placeholder="Frequency" />
          </SelectTrigger>
          <SelectContent>
            {[
              "QAM (6 HRS)",
              "QDAILY (10 HRS)",
              "Q24H (14 HRS)",
              "QHS (22 HRS)",
              "bd (8 & 20 HRS)",
              "bd (10 & 22 HRS)",
              "bd (06 & 18 HRS)",
              "tds (6 AM - 2PM - 10 PM)",
              "Q8H (6 AM - 2PM - 10 PM)",
              "qid (6 AM - 12 PM , 6 PM , 12 AM)",
              "every 4 hrs",
              "Q6H (6 AM - 12 PM , 6 PM , 12 AM)",
              "Q5M (EVERY 5MIN)",
              "QAC (7, 12 & 18 HRS)",
              "QOD (ALTERNATE DAY)",
              "QPC (09, 14 & 21 HRS)",
            ].map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={newMedicine.durationDays || ""}
          onValueChange={(value) =>
            setNewMedicine((prev) => ({ ...prev, durationDays: value }))
          }
        >
          <SelectTrigger className="w-32 text-sm">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            {["1", "3", "5", "7", "10", "14", "30"].map((value) => (
              <SelectItem key={value} value={value}>
                {value} days
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={newMedicine.timing || ""}
          onValueChange={(value) =>
            setNewMedicine((prev) => ({ ...prev, timing: value }))
          }
        >
          <SelectTrigger className="w-32 text-sm">
            <SelectValue placeholder="Timing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Before Food">Before Food</SelectItem>
            <SelectItem value="After Food">After Food</SelectItem>
            <SelectItem value="Bedtime">Bedtime</SelectItem>
            <SelectItem value="1 hour before food">
              1 hour before food
            </SelectItem>
            <SelectItem value="Evening 5 pm">Evening 5 pm</SelectItem>
            <SelectItem value="Early morning">Early morning</SelectItem>
            <SelectItem value="With food">With food</SelectItem>
            <SelectItem value="30 minutes">30 minutes before food</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          onClick={handleAddMedicine}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[300px] border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Medicine Name</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Timing</TableHead>
              <TableHead className="w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicines.map((medicine) => (
              <TableRow key={medicine.id}>
                <TableCell className="font-medium">{medicine.name}</TableCell>
                <TableCell>{medicine.dosage}</TableCell>
                <TableCell>{medicine.route}</TableCell>
                <TableCell>{medicine.timesPerDay}</TableCell>
                <TableCell>{medicine.durationDays} days</TableCell>
                <TableCell>{medicine.timing}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMedicine(medicine.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <Textarea
        placeholder="Instructions for all medicines"
        value={medicineInstructions}
        onChange={(e) => setMedicineInstructions(e.target.value)}
        className="mt-4 w-full"
      />
    </div>
  );
}
