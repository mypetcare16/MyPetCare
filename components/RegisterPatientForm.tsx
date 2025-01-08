"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardHeader } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, { message: "Last name is required" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Gender must be 'Male', 'Female', or 'Other'",
  }),
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" }),
  houseNo: z.string().optional(),
  gramPanchayat: z.string().optional(),
  village: z.string().optional(),
  tehsil: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  systolic: z.string().optional(),
  diastolic: z.string().optional(),
  heartRate: z.string().optional(),
  temperature: z.string().optional(),
  oxygenSaturation: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  pastSurgeries: z.string().optional(),
  familyHistory: z.string().optional(),
});

export default function RegisterPatientForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      gender: undefined,
      phoneNumber: "",
      houseNo: "",
      gramPanchayat: "",
      village: "",
      tehsil: "",
      district: "",
      state: "",
      systolic: "",
      diastolic: "",
      heartRate: "",
      temperature: "",
      oxygenSaturation: "",
      allergies: "",
      chronicConditions: "",
      pastSurgeries: "",
      familyHistory: "",
    },
  });

  const registerPatient = useMutation(api.patients.registerPatient);
  const [activeTab, setActiveTab] = useState("personal");
  const { user, isSignedIn } = useUser();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { email, phoneNumber } = form.watch();
  const checkDuplicates = useQuery(api.patients.checkDuplicates, {
    email,
    phoneNumber,
  });

  const userId = user?.id || "";
  const hospitalId = useQuery(api.users.getHospitalIdByUserId, {
    userId,
  });

  useEffect(() => {
    if (checkDuplicates?.emailExists) {
      form.setError("email", {
        type: "manual",
        message: "This email is already registered.",
      });
    } else {
      form.clearErrors("email");
    }

    if (checkDuplicates?.phoneExists) {
      form.setError("phoneNumber", {
        type: "manual",
        message: "This phone number is already registered.",
      });
    } else {
      form.clearErrors("phoneNumber");
    }
  }, [checkDuplicates, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isSignedIn || !user) {
      toast.error("You must be signed in to register a patient.");
      return;
    }

    if (checkDuplicates?.emailExists || checkDuplicates?.phoneExists) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!hospitalId) {
        toast.error("Hospital ID not found for the current user.");
        return;
      }

      await registerPatient({
        ...values,
        doctorId: user.id,
        hospitalId: hospitalId,
      });

      // Clear the form immediately
      form.reset();

      // Show success message
      setSuccessMessage("Patient has been registered successfully");
      window.scrollTo(0, 0);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      toast.error("Failed to register patient. Please try again.");
      console.error("Error registering patient:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shadow-lg max-w-7xl mx-auto w-screen h-screen py-9">
      <CardHeader className="text-black">
        <div className="text-2xl font-bold align-middle">
          New Patient Registration
        </div>
      </CardHeader>
      {successMessage && (
        <Alert className="mb-4 bg-green-100 border-green-400 text-green-800">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      <div className="p-4 sm:p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs
              defaultValue="personal"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger
                  value="personal"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Personal Information
                </TabsTrigger>
                <TabsTrigger
                  value="address"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Address Information
                </TabsTrigger>
                <TabsTrigger
                  value="vitals"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Vitals
                </TabsTrigger>
                <TabsTrigger
                  value="medical-history"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Medical History
                </TabsTrigger>
              </TabsList>
              <TabsContent value="personal">
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="First Name"
                              {...field}
                              className={
                                form.formState.errors.firstName
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Middle Name" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Last Name"
                              {...field}
                              className={
                                form.formState.errors.lastName
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={
                                  form.formState.errors.gender
                                    ? "border-red-500"
                                    : ""
                                }
                              >
                                <SelectValue placeholder="Select Gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["select gender", "Male", "Female", "Other"].map(
                                (gender) => (
                                  <SelectItem value={gender} key={gender}>
                                    {gender}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of birth</FormLabel>
                          <div className="flex gap-2">
                            <Select
                              onValueChange={(day) => {
                                const currentValue = field.value
                                  ? new Date(field.value)
                                  : new Date();
                                const newDate = new Date(currentValue);
                                newDate.setDate(parseInt(day));
                                if (!isNaN(newDate.getTime())) {
                                  field.onChange(newDate.toISOString());
                                }
                              }}
                              value={
                                field.value
                                  ? new Date(field.value).getDate().toString()
                                  : undefined
                              }
                            >
                              <FormControl>
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue placeholder="Day" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from(
                                  { length: 31 },
                                  (_, i) => i + 1
                                ).map((day) => (
                                  <SelectItem key={day} value={day.toString()}>
                                    {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Select
                              onValueChange={(month) => {
                                const currentValue = field.value
                                  ? new Date(field.value)
                                  : new Date();
                                const newDate = new Date(currentValue);
                                newDate.setMonth(parseInt(month));
                                // Adjust for invalid dates (e.g., Feb 31 -> Feb 28/29)
                                if (newDate.getMonth() !== parseInt(month)) {
                                  newDate.setDate(0);
                                }
                                if (!isNaN(newDate.getTime())) {
                                  field.onChange(newDate.toISOString());
                                }
                              }}
                              value={
                                field.value
                                  ? new Date(field.value).getMonth().toString()
                                  : undefined
                              }
                            >
                              <FormControl>
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[
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
                                ].map((month, index) => (
                                  <SelectItem
                                    key={month}
                                    value={index.toString()}
                                  >
                                    {month}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Select
                              onValueChange={(year) => {
                                const currentValue = field.value
                                  ? new Date(field.value)
                                  : new Date();
                                const newDate = new Date(currentValue);
                                newDate.setFullYear(parseInt(year));
                                // Adjust for invalid dates (e.g., Feb 29 on non-leap years)
                                if (newDate.getFullYear() !== parseInt(year)) {
                                  newDate.setDate(0);
                                }
                                if (!isNaN(newDate.getTime())) {
                                  field.onChange(newDate.toISOString());
                                }
                              }}
                              value={
                                field.value
                                  ? new Date(field.value)
                                      .getFullYear()
                                      .toString()
                                  : undefined
                              }
                            >
                              <FormControl>
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from(
                                  {
                                    length: new Date().getFullYear() - 1900 + 1,
                                  },
                                  (_, i) => new Date().getFullYear() - i
                                ).map((year) => (
                                  <SelectItem
                                    key={year}
                                    value={year.toString()}
                                  >
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Email"
                              {...field}
                              className={
                                form.formState.errors.email
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g: 7550147999"
                            {...field}
                            className={
                              form.formState.errors.phoneNumber
                                ? "border-red-500"
                                : ""
                            }
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              <TabsContent value="address">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                    <FormField
                      control={form.control}
                      name="houseNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>House No., Street (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="House No., Street" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gramPanchayat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Road(Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Road" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="village"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Village (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Village" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tehsil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taluk (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Taluk" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="District" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="vitals">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <FormLabel>Blood Pressure (mmHg)</FormLabel>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <FormField
                        control={form.control}
                        name="systolic"
                        render={({ field }) => (
                          <FormItem className="w-full sm:w-1/2">
                            <FormLabel>Systolic (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Systolic" {...field} />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="diastolic"
                        render={({ field }) => (
                          <FormItem className="w-full sm:w-1/2">
                            <FormLabel>Diastolic (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Diastolic" {...field} />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="heartRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heart Rate (bpm) (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Heart Rate" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature (°C) (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Temperature" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="oxygenSaturation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Oxygen Saturation (%) (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Oxygen Saturation" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              <TabsContent value="medical-history">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergies (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List any known allergies"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="chronicConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chronic Conditions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List any chronic conditions"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pastSurgeries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Past Surgeries (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List any past surgeries"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="familyHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family Medical History (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe any relevant family medical history"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
