"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Shield, Check, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface VaccinationPageProps {
  patientId: number | string;
}

const vaccineCategories = {
  "Cancer Preventing Vaccines": [
    "Hepatitis B Vaccine",
    "Human Papilloma Virus Vaccine",
  ],
  "Infection Preventing Vaccines": [
    "MMR Vaccine",
    "Measles Vaccine",
    "Polio Vaccine",
    "Japanese Encephalitis Vaccine",
    "Rota Virus Vaccine",
    "Hepatitis A Vaccine",
    "COVID-19 Vaccine",
    "Influenza Vaccine",
    "Varicella Vaccine",
    "Pneumococcal Vaccine",
    "BCG Vaccine",
    "DPT Vaccine",
    "Typhoid Vaccine",
    "Meningococcal Vaccine",
    "Hemophilus Influenza Type B Vaccine",
    "Cholera Vaccine",
    "Malaria Vaccine",
  ],
  "International Travel Vaccines": [
    "Yellow Fever Vaccine",
    "Rabies Vaccine",
    "Cholera Vaccine",
    "Tick Borne Encephalitis Vaccine",
    "Typhoid Vaccine",
    "JE Virus Vaccine",
    "Malaria Vaccine",
    "Meningococcal Vaccine",
  ],
};

const VaccinationPage: React.FC<VaccinationPageProps> = ({ patientId }) => {
  const { user } = useUser();
  const userId = user?.id ?? "";
  const [selectedVaccines, setSelectedVaccines] = useState<{
    [key: string]: boolean;
  }>({});

  const patientIdString = String(patientId);

  const addVaccinations = useMutation(api.vaccinations.addVaccinations);
  const getVaccinations = useQuery(api.vaccinations.getVaccinations, {
    patientId: patientIdString,
    userId,
  });

  useEffect(() => {
    if (getVaccinations) {
      const existingVaccines = getVaccinations.reduce(
        (acc, v) => {
          acc[v.vaccineName] = v.status === "Yes";
          return acc;
        },
        {} as { [key: string]: boolean }
      );
      setSelectedVaccines(existingVaccines);
    }
  }, [getVaccinations]);

  const handleVaccineToggle = (vaccine: string) => {
    setSelectedVaccines((prev) => ({ ...prev, [vaccine]: !prev[vaccine] }));
  };

  const handleSubmit = async () => {
    await addVaccinations({
      patientId: patientIdString,
      userId,
      vaccinations: Object.entries(selectedVaccines).map(
        ([vaccineName, status]) => ({
          vaccineName,
          status: status ? "Yes" : "No",
        })
      ),
    });
    alert("Vaccination records updated successfully!");
  };

  if (!patientId) {
    return <div className="text-center p-4">Please select a patient</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader className=" text-black">
        <CardTitle className="text-3xl font-bold text-center flex items-center justify-center">
          <Shield className="mr-2 h-8 w-8" />
          Vaccination
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            Patient ID: {patientIdString}
          </Badge>
        </div>
        <Tabs defaultValue="cancer" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="cancer">Cancer</TabsTrigger>
            <TabsTrigger value="infections">Infections</TabsTrigger>
            <TabsTrigger value="travel">Travel</TabsTrigger>
          </TabsList>
          {Object.entries(vaccineCategories).map(
            ([category, vaccines], index) => (
              <TabsContent
                key={category}
                value={["cancer", "infections", "travel"][index]}
                className="mt-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-blue-600">
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {vaccines.map((vaccine) => (
                          <motion.div
                            key={vaccine}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="font-medium">{vaccine}</span>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={selectedVaccines[vaccine] || false}
                                onCheckedChange={() =>
                                  handleVaccineToggle(vaccine)
                                }
                              />
                              {selectedVaccines[vaccine] ? (
                                <Check className="h-5 w-5 text-green-500" />
                              ) : (
                                <X className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            )
          )}
        </Tabs>
        <Button
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleSubmit}
        >
          Update Vaccination Records
        </Button>
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">
            Current Vaccination Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {getVaccinations
              ?.filter((v) => v.status === "Yes")
              .map((vaccination, index) => (
                <Badge key={index} variant="outline" className="justify-start">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  {vaccination.vaccineName}
                </Badge>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VaccinationPage;
