"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SlotCreationFormProps {
  doctorId: string;
  onClose: () => void;
}

export function SlotCreationForm({ doctorId, onClose }: SlotCreationFormProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dailyStartTime, setDailyStartTime] = useState("");
  const [dailyEndTime, setDailyEndTime] = useState("");
  const [slotDuration, setSlotDuration] = useState("30");
  const [breakStartTime, setBreakStartTime] = useState("");
  const [breakEndTime, setBreakEndTime] = useState("");
  const [includeWeekends, setIncludeWeekends] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const createBulkSlots = useMutation(api.slots.createBulkSlots);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await createBulkSlots({
          doctorId,
          startDate,
          endDate,
          dailyStartTime,
          dailyEndTime,
          slotDuration: parseInt(slotDuration),
          breakStartTime,
          breakEndTime,
          includeWeekends,
        });

        setIsSuccess(true);

        // Delay closing the modal to ensure the success message is seen
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2000);
      } catch (error) {
        toast.error("Failed to create slots");
        console.error("Error creating slots:", error);
      }
    },
    [
      createBulkSlots,
      doctorId,
      startDate,
      endDate,
      dailyStartTime,
      dailyEndTime,
      slotDuration,
      breakStartTime,
      breakEndTime,
      includeWeekends,
      onClose,
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ModalHeader>
        <ModalTitle>Create Appointment Slots (IST)</ModalTitle>
        <ModalDescription>
          Set up your availability for appointments in Indian Standard Time
        </ModalDescription>
      </ModalHeader>
      {isSuccess && (
        <Alert className="bg-green-100 border-green-400 text-green-800">
          <AlertDescription>Slots created successfully</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="dailyStartTime">Daily Start Time (IST)</Label>
          <Input
            id="dailyStartTime"
            type="time"
            value={dailyStartTime}
            onChange={(e) => setDailyStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="dailyEndTime">Daily End Time (IST)</Label>
          <Input
            id="dailyEndTime"
            type="time"
            value={dailyEndTime}
            onChange={(e) => setDailyEndTime(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="breakStartTime">Break Start Time (IST)</Label>
          <Input
            id="breakStartTime"
            type="time"
            value={breakStartTime}
            onChange={(e) => setBreakStartTime(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="breakEndTime">Break End Time (IST)</Label>
          <Input
            id="breakEndTime"
            type="time"
            value={breakEndTime}
            onChange={(e) => setBreakEndTime(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
        <Input
          id="slotDuration"
          type="number"
          value={slotDuration}
          onChange={(e) => setSlotDuration(e.target.value)}
          min="15"
          step="15"
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="includeWeekends"
          checked={includeWeekends}
          onCheckedChange={setIncludeWeekends}
        />
        <Label htmlFor="includeWeekends">Include Weekends</Label>
      </div>
      <ModalFooter>
        <Button type="submit" disabled={isSuccess}>
          Create Slots
        </Button>
      </ModalFooter>
    </form>
  );
}
