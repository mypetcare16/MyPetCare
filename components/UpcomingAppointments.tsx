"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { useRouter } from "next/navigation";
import { RescheduleModal } from "./reschedule-modal";
import { Id } from "@/convex/_generated/dataModel";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function UpcomingAppointments() {
  const { user } = useUser();
  const doctorId = user?.id || "";
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Id<"appointments"> | null>(null);
  const router = useRouter();
  const appointments = useQuery(
    api.appointment.getAppointmentsByDoctorAndDate,
    {
      doctorId,
      date: format(selectedDate, "yyyy-MM-dd"),
    }
  );

  const patientRetentionData =
    useQuery(api.patients.getPatientRetentionData, { doctorId }) || [];

  const rescheduleAppointment = useMutation(
    api.appointment.rescheduleAppointment
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleRescheduleClick = (appointmentId: Id<"appointments">) => {
    setSelectedAppointment(appointmentId);
    setIsRescheduleModalOpen(true);
  };

  const handleReschedule = async (date: string, time: string) => {
    if (selectedAppointment) {
      try {
        await rescheduleAppointment({
          appointmentId: selectedAppointment,
          appointmentDate: date,
          appointmentTime: time,
        });
        setIsRescheduleModalOpen(false);
        setSelectedAppointment(null);
        // Refetch appointments or update the local state
      } catch (error) {
        console.error("Error rescheduling appointment:", error);
        // Handle error (e.g., show an error message to the user)
      }
    }
  };

  useEffect(() => {
    console.log("Doctor ID:", doctorId);
    console.log("Selected Date:", format(selectedDate, "yyyy-MM-dd"));
  }, [appointments]);

  if (!appointments) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-gray-800">Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-[280px] justify-start text-left font-normal ${
                    !selectedDate && "text-muted-foreground"
                  }`}
                >
                  <span>{format(selectedDate, "PPP")}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-600">Patient ID</TableHead>
                <TableHead className="text-gray-600">Time</TableHead>
                <TableHead className="text-gray-600">Service</TableHead>
                <TableHead className="text-gray-600">Status</TableHead>
                <TableHead className="text-gray-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments && appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <TableRow key={appointment._id}>
                    <TableCell className="font-medium text-gray-800">
                      {appointment.patientId}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {appointment.appointmentTime}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {appointment.service || "General Consultation"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {appointment.status}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                        onClick={() => handleNavigation(`/consultation`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
                        onClick={() => handleRescheduleClick(appointment._id)}
                      >
                        Reschedule
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No appointments for this date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-800">Patient Retention</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={patientRetentionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {patientRetentionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <h4 className="font-semibold text-gray-700 mb-2">Key Insights</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                • {patientRetentionData[1]?.value.toFixed(0) || 0}% of your
                patients are returning, indicating high satisfaction
              </li>
              <li>
                • New patient acquisition rate is{" "}
                {patientRetentionData[0]?.value.toFixed(0) || 0}%, suggesting
                room for growth
              </li>
              <li>
                • Consider implementing a referral program to boost new patient
                numbers
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        onReschedule={handleReschedule}
        doctorId={doctorId}
      />
    </div>
  );
}
