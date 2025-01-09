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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, { message: "Last name is required" }),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
    invalid_type_error: "That's not a date!",
  }),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Please select a gender",
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
  petName: z.string().optional(),
  petBreed: z.string().optional(),
  petSpecies: z.string().optional(),
  petAge: z.number().positive().int().optional(),
  petGender: z.enum(["Male", "Female", "Other"]).optional(),
  petDob: z.date().optional(),
  petMicrochipNo: z.string().optional(),
});

export default function RegisterPatientForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: undefined,
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
      petName: "",
      petBreed: "",
      petSpecies: undefined,
      petAge: undefined,
      petGender: undefined,
      petDob: undefined,
      petMicrochipNo: "",
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
      const formattedValues = {
        ...values,
        dateOfBirth: values.dateOfBirth.toISOString(),
        petDob: values.petDob ? values.petDob.toISOString() : undefined,
      };

      if (!hospitalId) {
        toast.error("Hospital ID not found for the current user.");
        return;
      }

      await registerPatient({
        ...formattedValues,
        doctorId: user.id,
        hospitalId: hospitalId,
      });

      form.reset();
      setSuccessMessage("Patient has been registered successfully");
      window.scrollTo(0, 0);

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
    <div className="shadow-lg max-w-7xl mx-auto w-full py-9">
      <CardHeader className="text-black">
        <div className="text-2xl font-bold align-middle">
          New Pet Registration
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
              defaultValue="pet-details"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger
                  value="pet-details"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Pet Details
                </TabsTrigger>
                <TabsTrigger
                  value="personal"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Pet Parents Information
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
                              {["Male", "Female", "Other"].map((gender) => (
                                <SelectItem value={gender} key={gender}>
                                  {gender}
                                </SelectItem>
                              ))}
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
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Birth</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-[240px] pl-3 text-left font-normal ${
                                    !field.value && "text-muted-foreground"
                                  }`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
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
                          <FormLabel>Road (Optional)</FormLabel>
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
                  {/* <FormField
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
                  /> */}
                </div>
              </TabsContent>
              <TabsContent value="pet-details">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="petName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pet Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Pet Name" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="petBreed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pet Breed (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Pet Breed" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="petSpecies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pet Species (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Species" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[
                                "Dog",
                                "Cat",
                                "Bird",
                                "Fish",
                                "Reptile",
                                "Other",
                              ].map((species) => (
                                <SelectItem key={species} value={species}>
                                  {species}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="petAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pet Age (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Pet Age"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="petGender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pet Gender (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["Male", "Female", "Other"].map((gender) => (
                                <SelectItem key={gender} value={gender}>
                                  {gender}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="petDob"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Pet Date of Birth (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-[240px] pl-3 text-left font-normal ${
                                    !field.value && "text-muted-foreground"
                                  }`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="petMicrochipNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pet Microchip Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Microchip Number" {...field} />
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
