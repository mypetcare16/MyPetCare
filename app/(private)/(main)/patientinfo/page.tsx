"use client";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MedicalDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <main className="flex-1 container mx-auto p-4 md:p-8 lg:p-10">
        <Card className="mb-6 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-16 w-16 border-4 border-blue-200 dark:border-blue-800">
                <AvatarImage src="/placeholder-avatar.jpg" alt="Patient" />
                <AvatarFallback>TH</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
                  Test Hyperthyroidism
                </h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                  GAN203006 | Male | 42 Years 5 months 16 days
                </p>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                  National ID: NAT2804 | Class: General
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="flex flex-wrap justify-center bg-blue-50 dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 rounded-md transition-all duration-200"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="diagnosis"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 rounded-md transition-all duration-200"
            >
              Diagnosis
            </TabsTrigger>
            <TabsTrigger
              value="treatments"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 rounded-md transition-all duration-200"
            >
              Treatments
            </TabsTrigger>
            <TabsTrigger
              value="lab-results"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 rounded-md transition-all duration-200"
            >
              Lab Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-blue-600 dark:text-blue-400">
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="dob"
                      className="text-gray-600 dark:text-gray-400"
                    >
                      Date of Birth
                    </Label>
                    <Input
                      id="dob"
                      value="05 May 82"
                      readOnly
                      className="bg-gray-50 dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="relationships"
                      className="text-gray-600 dark:text-gray-400"
                    >
                      Relationships
                    </Label>
                    <Input
                      id="relationships"
                      value=""
                      readOnly
                      className="bg-gray-50 dark:bg-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="child"
                    className="text-gray-600 dark:text-gray-400"
                  >
                    Child
                  </Label>
                  <Input
                    id="child"
                    value="Test TB"
                    readOnly
                    className="bg-gray-50 dark:bg-gray-700"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagnosis">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-blue-600 dark:text-blue-400">
                  Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  Hyperthyroidism, NOS
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  CONFIRMED PRIMARY - 05 May 17
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="treatments">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-blue-600 dark:text-blue-400">
                  Treatments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Nifedipine 5mg (Capsule)
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    1 Capsule(s), Immediately, SOS, Sub Lingual - 2 Day(s)
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Methimazole (Tablet)
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    2 Tablet(s), Every 8 hours, Oral - 2 Week(s)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lab-results">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-blue-600 dark:text-blue-400">
                  Lab Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  Accession at 05 May 17 3:57 pm
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
                    <Label className="text-gray-600 dark:text-gray-400">
                      T3
                    </Label>
                    <Input
                      value="220.0"
                      readOnly
                      className="bg-white dark:bg-gray-700 mt-1"
                    />
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
                    <Label className="text-gray-600 dark:text-gray-400">
                      T4
                    </Label>
                    <Input
                      value="18.0"
                      readOnly
                      className="bg-white dark:bg-gray-700 mt-1"
                    />
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
                    <Label className="text-gray-600 dark:text-gray-400">
                      TSH
                    </Label>
                    <Input
                      value="1.0"
                      readOnly
                      className="bg-white dark:bg-gray-700 mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                Patient Files
              </CardTitle>
              <Button variant="outline" className="flex-shrink-0">
                Upload
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between p-2 bg-blue-50 dark:bg-gray-800 rounded-md">
                  <span>Report.pdf</span>
                  <Button
                    variant="link"
                    className="text-blue-600 dark:text-blue-400"
                  >
                    Download
                  </Button>
                </li>
                <li className="flex justify-between p-2 bg-blue-50 dark:bg-gray-800 rounded-md">
                  <span>Prescription.jpg</span>
                  <Button
                    variant="link"
                    className="text-blue-600 dark:text-blue-400"
                  >
                    Download
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Button className="w-full">New Appointment</Button>
                <Button className="w-full">Send Notification</Button>
                <Button className="w-full">View History</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
