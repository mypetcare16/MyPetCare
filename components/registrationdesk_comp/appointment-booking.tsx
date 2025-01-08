import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

const formSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  speciality: z.string().optional(),
  service: z.string().optional(),
  referredBy: z.string().optional(),
  location: z.string().optional(),
  appointmentType: z.enum(["regular", "recurring"]),
  isTeleconsultation: z.boolean().optional(),
  status: z.enum(["Scheduled", "waitlist", "completed", "cancelled"]),
  appointmentDate: z.date(),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  notes: z.string().optional(),
  reasonForVisit: z.string().optional(),
  insuranceDetails: z.string().optional(),
  slotId: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;
type AppointmentBookingProps = {
  onClose: () => void;
};

export default function AppointmentBooking({
  onClose,
}: AppointmentBookingProps) {
  const formatDate = (date: Date): string => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString();
  };

  const { toast } = useToast();
  const { user } = useUser();
  const userId = user?.id || "";
  const hospitalId = useQuery(api.users.getHospitalIdByUserId, { userId });
  const addAppointment = useMutation(api.appointment.addAppointment);
  const updateSlotStatus = useMutation(api.slots.updateSlotStatus);
  const patients = useQuery(api.patients.getAllPatientsByhospitalid, {
    hospitalId: hospitalId ?? undefined,
  });
  const doctors = useQuery(api.users.getDoctorsByHospitalId, {
    hospitalId: hospitalId ?? undefined,
  });
  const router = useRouter();

  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<
    { id: Id<"slots">; startTime: string; endTime: string }[]
  >([]);
  const [isFormVisible, setIsFormVisible] = useState(true);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appointmentType: "regular",
      isTeleconsultation: false,
      status: "Scheduled",
    },
  });

  const getAvailableSlots = useQuery(
    api.slots.getAvailableSlots,
    selectedDoctor && selectedDate
      ? {
          doctorId: selectedDoctor,
          date: formatDate(selectedDate),
        }
      : "skip"
  );

  useEffect(() => {
    if (getAvailableSlots) {
      setAvailableSlots(getAvailableSlots);
    }
  }, [getAvailableSlots]);

  useEffect(() => {
    if (doctors && doctors.length === 1) {
      const singleDoctor = doctors[0];
      form.setValue("doctorId", singleDoctor.userId);
      setSelectedDoctor(singleDoctor.userId);
    }
  }, [doctors, form]);

  const onSubmit = async (values: FormSchema) => {
    try {
      const appointmentId = `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const formattedDate = formatDate(values.appointmentDate);
      await addAppointment({
        ...values,
        appointmentId,
        appointmentDate: formattedDate,
        hospitalId: hospitalId ?? "",
      });
      // Update the slot status to booked
      if (values.slotId) {
        await updateSlotStatus({
          slotId: values.slotId as Id<"slots">,
          isBooked: true,
        });
      }
      toast({
        title: "Success",
        description: "Appointment booked successfully",
        variant: "default",
      });
      form.reset();
      setSelectedDoctor(null);
      setSelectedDate(null);
      setAvailableSlots([]);
      onClose();
      setIsFormVisible(false);
      router.push("/appointmment");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isFormVisible) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">New Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name or ID*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients?.map((patient) => (
                            <SelectItem
                              key={patient.patientId}
                              value={patient.patientId.toString()}
                            >
                              {patient.firstName} {patient.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor*</FormLabel>
                      {doctors && doctors.length > 1 ? (
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedDoctor(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {doctors?.map((doctor) => (
                              <SelectItem
                                key={doctor.userId}
                                value={doctor.userId}
                              >
                                {doctor.firstName} {doctor.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={
                            doctors?.[0]?.firstName +
                            " " +
                            doctors?.[0]?.lastName
                          }
                          disabled
                          className="bg-white"
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="speciality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speciality</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select speciality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="dermatology">
                            Dermatology
                          </SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                          <SelectItem value="orthopedics">
                            Orthopedics
                          </SelectItem>
                          <SelectItem value="general-surgery">
                            General Surgery
                          </SelectItem>
                          <SelectItem value="urology">Urology</SelectItem>
                          <SelectItem value="nephrology">Nephrology</SelectItem>
                          <SelectItem value="endocrinology">
                            Endocrinology
                          </SelectItem>
                          <SelectItem value="transplant-medicine">
                            Transplant Medicine
                          </SelectItem>
                          <SelectItem value="neurosurgery">
                            Neurosurgery
                          </SelectItem>
                          <SelectItem value="internal-medicine">
                            Internal Medicine
                          </SelectItem>
                          <SelectItem value="psychiatry">Psychiatry</SelectItem>
                          <SelectItem value="pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="ogyn">OB/GYN</SelectItem>
                          <SelectItem value="oncology">Oncology</SelectItem>
                          <SelectItem value="gastroenterology">
                            Gastroenterology
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="consultation">
                            Consultation
                          </SelectItem>
                          <SelectItem value="followup">Follow-up</SelectItem>
                          <SelectItem value="procedure">Procedure</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referredBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referred By</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white"
                          placeholder="Enter referrer's name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="main-clinic">
                            Main Clinic
                          </SelectItem>
                          <SelectItem value="north-branch">
                            North Branch
                          </SelectItem>
                          <SelectItem value="south-branch">
                            South Branch
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Appointment Date*</FormLabel>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full bg-white pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            const calendar =
                              document.getElementById("date-calendar");
                            if (calendar) {
                              calendar.style.display =
                                calendar.style.display === "none"
                                  ? "block"
                                  : "none";
                            }
                          }}
                        >
                          {field.value
                            ? new Date(field.value).toLocaleDateString() // Format the date to display only date part
                            : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                      <div
                        id="date-calendar"
                        className="absolute mt-2 bg-white p-2 rounded-md shadow-md z-50"
                        style={{ display: "none" }}
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date);
                              setSelectedDate(date);
                              form.setValue("appointmentDate", date);
                              const calendar =
                                document.getElementById("date-calendar");
                              if (calendar) {
                                calendar.style.display = "none";
                              }
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment Time*</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const selectedSlot = availableSlots.find(
                            (slot) => slot.id === value
                          );
                          if (selectedSlot) {
                            field.onChange(
                              `${selectedSlot.startTime} - ${selectedSlot.endTime}`
                            );
                            form.setValue("slotId", selectedSlot.id);
                          }
                        }}
                        defaultValue={field.value}
                        disabled={!selectedDoctor || !selectedDate}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableSlots.length > 0 ? (
                            availableSlots.map((slot) => (
                              <SelectItem key={slot.id} value={slot.id}>
                                {slot.startTime} - {slot.endTime}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-slots" disabled>
                              {selectedDoctor && selectedDate
                                ? "No available slots"
                                : "Please select a doctor and date first"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="appointmentType"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Appointment Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="regular" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Regular Appointment
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="recurring" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Recurring Appointment
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isTeleconsultation"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Teleconsultation
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Appointment Status*</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="Scheduled" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Scheduled
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="waitlist" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Waitlist
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reasonForVisit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Visit</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insuranceDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Details</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white w-full md:w-auto"
                >
                  Book Appointment
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
