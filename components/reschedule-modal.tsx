import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (date: string, time: string) => void;
  doctorId: string;
}

export function RescheduleModal({
  isOpen,
  onClose,
  onReschedule,
  doctorId,
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>("");

  const formattedDate = selectedDate
    ? format(selectedDate, "yyyy-MM-dd'T'00:00:00.000'Z'")
    : undefined;

  const availableSlots = useQuery(api.slots.getAvailableSlots, {
    doctorId,
    date: formattedDate || "",
  });

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleReschedule = () => {
    if (selectedDate && selectedTime) {
      onReschedule(formattedDate!, selectedTime);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
          <Select onValueChange={setSelectedTime} value={selectedTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {availableSlots?.map((slot) => (
                <SelectItem
                  key={slot.id}
                  value={`${slot.startTime} - ${slot.endTime}`}
                >
                  {`${slot.startTime} - ${slot.endTime}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleReschedule}>Reschedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
