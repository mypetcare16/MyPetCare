"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
  form: any;
  name: string;
  label: string;
}

export function ModernDatePicker({ form, name, label }: DatePickerProps) {
  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) =>
    (currentYear - i).toString()
  );

  const [selectedDay, setSelectedDay] = React.useState<string>("");
  const [selectedMonth, setSelectedMonth] = React.useState<string>("");
  const [selectedYear, setSelectedYear] = React.useState<string>("");

  React.useEffect(() => {
    const currentValue = form.getValues(name);
    if (currentValue) {
      const date = new Date(currentValue);
      if (!isNaN(date.getTime())) {
        setSelectedDay(date.getDate().toString().padStart(2, "0"));
        setSelectedMonth(months[date.getMonth()]);
        setSelectedYear(date.getFullYear().toString());
      }
    }
  }, [form, name]);

  const updateFormValue = () => {
    if (selectedYear && selectedMonth && selectedDay) {
      const monthIndex = months.indexOf(selectedMonth);
      const date = new Date(
        parseInt(selectedYear),
        monthIndex,
        parseInt(selectedDay)
      );

      if (
        date.getFullYear() === parseInt(selectedYear) &&
        date.getMonth() === monthIndex &&
        date.getDate() === parseInt(selectedDay)
      ) {
        form.setValue(name, date.toISOString(), { shouldValidate: true });
      } else {
        form.setValue(name, "", { shouldValidate: true });
      }
    } else {
      form.setValue(name, "", { shouldValidate: true });
    }
  };

  const handleDateChange = (type: "day" | "month" | "year", value: string) => {
    if (type === "day") setSelectedDay(value);
    else if (type === "month") setSelectedMonth(value);
    else if (type === "year") setSelectedYear(value);

    updateFormValue();
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>{label}</FormLabel>
          <div className="flex gap-2">
            <Select
              value={selectedYear}
              onValueChange={(value) => handleDateChange("year", value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedMonth}
              onValueChange={(value) => handleDateChange("month", value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedDay}
              onValueChange={(value) => handleDateChange("day", value)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {days.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
