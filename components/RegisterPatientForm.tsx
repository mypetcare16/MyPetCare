"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save, ChevronLeft, ChevronRight, Search } from "lucide-react";
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
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import SearchComponent from "./registrationdesk_comp/SearchComponent";

const formSchema = z.object({
  email: z.string().optional(),
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  phoneNumber: z.string(),
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
  petName: z.string().min(1, "Pet name is required"),
  petBreed: z.string().optional(),
  petSpecies: z.string().optional(),
  petAge: z.number().optional(),
  petGender: z.enum(["Male", "Female", "Other"]).optional(),
  petDob: z.string().min(1, "Pet date of birth is required"),
  petMicrochipNo: z.string().optional(),
});

export default function RegisterPatientForm() {
  const { user } = useUser();
  const registerPatient = useMutation(api.patients.registerPatient);
  const userId = user?.id || "";
  const hospitalId = useQuery(api.users.getHospitalIdByUserId, {
    userId,
  });
  const doctorId = userId;

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

  const [activeTab, setActiveTab] = useState("pet-details");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const petDob = form.watch("petDob");

  useEffect(() => {
    if (petDob) {
      const age = calculateAge(petDob);
      form.setValue("petAge", age);
    }
  }, [petDob, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userId || !hospitalId) {
      toast.error("User or hospital information not available");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedValues = {
        ...values,
        dateOfBirth: values.dateOfBirth
          ? new Date(values.dateOfBirth).toISOString()
          : undefined,
        petDob: new Date(values.petDob).toISOString(),
      };

      const result = await registerPatient({
        ...formattedValues,
        doctorId,
        hospitalId,
      });

      if (result) {
        setSuccessMessage("Patient has been registered successfully");
        form.reset();
        window.scrollTo(0, 0);
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        toast.error("Failed to register patient. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to register patient. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const tabs = [
    "pet-details",
    "personal",
    "address",
    "vitals",
    "medical-history",
  ];

  const handleNextTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handlePreviousTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  return (
    <div className="shadow-lg max-w-7xl mx-auto w-full py-9 relative">
      <CardHeader className="text-black flex justify-between items-center">
        <div className="text-2xl font-bold">New Pet Registration</div>
        <Button
          onClick={() => setShowSearch(true)}
          className="bg-blue-500 text-white"
        >
          <Search className="mr-2 h-4 w-4" />
          View Patients
        </Button>
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
              value={activeTab}
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

              <TabsContent value="pet-details">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="petName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pet Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Pet Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="petBreed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Breed</FormLabel>
                          <FormControl>
                            <Input placeholder="Pet Breed" {...field} />
                          </FormControl>
                          <FormMessage />
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
                          <FormLabel>Species</FormLabel>
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
                              {["Canine", "Feline", "Other"].map((species) => (
                                <SelectItem key={species} value={species}>
                                  {species}
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
                      name="petGender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="petDob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of birth</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value || ""}
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="petAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Pet Age"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
                              }
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="petMicrochipNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pet Microchip Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Microchip Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g: 7550147999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

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
                            <Input placeholder="First Name" {...field} />
                          </FormControl>
                          <FormMessage />
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
                            <Input placeholder="Last Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Email (Optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
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
                          <FormLabel>House No., Street</FormLabel>
                          <FormControl>
                            <Input placeholder="House No., Street" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gramPanchayat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Road</FormLabel>
                          <FormControl>
                            <Input placeholder="Road" {...field} />
                          </FormControl>
                          <FormMessage />
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
                          <FormLabel>Village</FormLabel>
                          <FormControl>
                            <Input placeholder="Village" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tehsil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taluk</FormLabel>
                          <FormControl>
                            <Input placeholder="Taluk" {...field} />
                          </FormControl>
                          <FormMessage />
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
                          <FormLabel>District</FormLabel>
                          <FormControl>
                            <Input placeholder="District" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vitals">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <FormField
                        control={form.control}
                        name="diastolic"
                        render={({ field }) => (
                          <FormItem className="w-full sm:w-1/2">
                            <FormLabel>Body Weight(lbs or kg)</FormLabel>
                            <FormControl>
                              <Input placeholder="Weight" {...field} />
                            </FormControl>
                            <FormMessage />
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
                        <FormLabel>Heart Rate (bpm)</FormLabel>
                        <FormControl>
                          <Input placeholder="Heart Rate" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Temperature (°F)</FormLabel>
                        <FormControl>
                          <Input placeholder="Temperature" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="oxygenSaturation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Oxygen Saturation (%)</FormLabel>
                        <FormControl>
                          <Input placeholder="Oxygen Saturation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="systolic"
                    render={({ field }) => (
                      <FormItem className="w-full sm:w-1/2">
                        <FormLabel>Systolic Blood Pressure (mmHg)</FormLabel>
                        <FormControl>
                          <Input placeholder="Systolic" {...field} />
                        </FormControl>
                        <FormMessage />
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
                        <FormLabel>Allergies</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List any known allergies"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="chronicConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chronic Conditions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List any chronic conditions"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pastSurgeries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Past Surgeries</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List any past surgeries"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex justify-between mt-6">
              {activeTab !== "pet-details" && (
                <Button
                  type="button"
                  onClick={handlePreviousTab}
                  className="bg-gray-500 text-white"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}
              {activeTab !== "medical-history" ? (
                <Button
                  type="button"
                  onClick={handleNextTab}
                  className="bg-blue-500 text-white ml-auto"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-green-500 text-white ml-auto"
                  disabled={isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
            <SearchComponent onClose={() => setShowSearch(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
