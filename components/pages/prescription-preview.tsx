import React, { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type SymptomItem = {
  id: string;
  name: string;
  frequency: string;
  severity: string;
  duration: string;
};

type FindingItem = {
  id: string;
  name: string;
};

type MedicineItem = {
  id: string;
  name: string;
  dosage: string;
  route: string;
  timesPerDay: string;
  durationDays: string;
  timing: string;
};

type PrescriptionData = {
  patientId: string;
  doctorId: string;
  symptoms: SymptomItem[];
  findings: FindingItem[];
  diagnoses: { id: string; name: string }[];
  medicines: MedicineItem[];
  investigations: { id: string; name: string }[];
  investigationNotes?: string;
  followUpDate?: Date;
  referTo?: string;
  medicineReminder: {
    message: boolean;
    call: boolean;
  };
  medicineInstructions?: string;
  chronicCondition: boolean;
  criticalLabValues: string;
  vitals: {
    temperature: string;
    bloodPressure: string;
    pulse: string;
    height: string;
    weight: string;
    bmi: string;
    waistHip: string;
    spo2: string;
  };
  severity?: "Mild" | "Moderate" | "Severe";
};

export default function EnhancedPrescriptionPreview({
  data,
}: {
  data: PrescriptionData;
}) {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Prescription Details
        </CardTitle>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Patient ID: {data.patientId}</span>
          <span>Doctor ID: {data.doctorId}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Temperature</TableHead>
                      <TableHead>Blood Pressure</TableHead>
                      <TableHead>Pulse</TableHead>
                      <TableHead>Height</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>BMI</TableHead>
                      <TableHead>Waist/Hip</TableHead>
                      <TableHead>SPO2</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{data.vitals.temperature}</TableCell>
                      <TableCell>{data.vitals.bloodPressure}</TableCell>
                      <TableCell>{data.vitals.pulse}</TableCell>
                      <TableCell>{data.vitals.height}</TableCell>
                      <TableCell>{data.vitals.weight}</TableCell>
                      <TableCell>{data.vitals.bmi}</TableCell>
                      <TableCell>{data.vitals.waistHip}</TableCell>
                      <TableCell>{data.vitals.spo2}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Symptoms</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.symptoms.map((symptom) => (
                      <TableRow key={symptom.id}>
                        <TableCell>{symptom.name}</TableCell>
                        <TableCell>{symptom.frequency}</TableCell>
                        <TableCell>{symptom.severity}</TableCell>
                        <TableCell>{symptom.duration}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Findings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.findings.map((finding) => (
                      <TableRow key={finding.id}>
                        <TableCell>{finding.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Diagnosis</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.diagnoses.map((diagnosis) => (
                      <TableRow key={diagnosis.id}>
                        <TableCell>{diagnosis.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <span className="font-medium">Severity: </span>
                  <span>{data.severity || "Not specified"}</span>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Chronic Condition: </span>
                  <span>{data.chronicCondition ? "Yes" : "No"}</span>
                </div>
                <div className="mt-2">
                  <span className="font-medium">critical Lab Values: </span>
                  <span>{data.criticalLabValues}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medicines</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Timing</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.medicines.map((medicine) => (
                      <TableRow key={medicine.id}>
                        <TableCell>{medicine.name}</TableCell>
                        <TableCell>{medicine.dosage}</TableCell>
                        <TableCell>{medicine.route}</TableCell>
                        <TableCell>
                          {medicine.timesPerDay} times per day
                        </TableCell>
                        <TableCell>{medicine.durationDays} days</TableCell>
                        <TableCell>{medicine.timing}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <span className="font-medium">Instructions: </span>
                  <span>{data.medicineInstructions}</span>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Reminders: </span>
                  <span>
                    {data.medicineReminder.message ? "Message, " : ""}
                    {data.medicineReminder.call ? "Call" : ""}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investigations</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.investigations.map((investigation) => (
                      <TableRow key={investigation.id}>
                        <TableCell>{investigation.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <span className="font-medium">Notes: </span>
                  <span>{data.investigationNotes}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Follow-Up</CardTitle>
              </CardHeader>
              <CardContent>
                <span>
                  {data.followUpDate
                    ? format(data.followUpDate, "PPP")
                    : "No follow-up date set"}
                </span>

                <div className="mt-4">
                  <span className="font-medium">ReferTo: </span>
                  <span>{data.referTo}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
