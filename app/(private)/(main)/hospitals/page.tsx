"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HospitalCreation from "./create/page";
import ViewHospitals from "./view/page";

export default function HospitalManagement() {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Hospital Management</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create New Hospital</TabsTrigger>
          <TabsTrigger value="view">View Hospitals</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <HospitalCreation />
        </TabsContent>
        <TabsContent value="view">
          <ViewHospitals />
        </TabsContent>
      </Tabs>
    </div>
  );
}
