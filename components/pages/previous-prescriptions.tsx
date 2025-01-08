"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";

interface EnhancedPreviousPrescriptionsProps {
  patientId: string;
  userId: string;
}

interface Prescription {
  _id: Id<"prescriptions">;
  doctorId: string;
  patientId: string;
  storageId?: string;
  diagnoses: { id: string; name: string }[];
  _creationTime: number;
}

interface User {
  _id: Id<"users">;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: "Doctor" | "Patient" | "Desk" | "Admin";
}

export default function EnhancedPreviousPrescriptions({
  patientId,
  userId,
}: EnhancedPreviousPrescriptionsProps) {
  const prescriptions = useQuery(
    api.prescriptions.getAllPrescriptionsForPatient,
    { patientId }
  );
  const users = useQuery(api.users.getDoctors);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const generateFileUrl = useMutation(api.prescriptions.generateFileUrl);

  const handleViewPrescription = async (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    if (!prescription.storageId) {
      console.error("No storageId available for this prescription.");
      setPdfUrl(null);
      return;
    }
    try {
      const url = await generateFileUrl({ storageId: prescription.storageId });
      setPdfUrl(url);
    } catch (error) {
      console.error("Error generating PDF URL:", error);
      setPdfUrl(null);
    }
  };

  const getDoctorName = (userId: string): string => {
    const user = users?.find((u: User) => u.userId === userId);
    return user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "Unknown Doctor";
  };

  if (!prescriptions || !users) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Previous Prescriptions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Doctor Name</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptions.map((prescription: Prescription) => (
              <TableRow key={prescription._id}>
                <TableCell>
                  {format(new Date(prescription._creationTime), "PPP")}
                </TableCell>
                <TableCell>{getDoctorName(prescription.doctorId)}</TableCell>
                <TableCell>
                  <PatientName patientId={prescription.patientId} />
                </TableCell>
                <TableCell>
                  {prescription.diagnoses.map((d) => d.name).join(", ")}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleViewPrescription(prescription)}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Eye className="mr-2 h-4 w-4" /> View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog
        open={!!selectedPrescription}
        onOpenChange={() => setSelectedPrescription(null)}
      >
        <DialogContent className="max-w-4xl w-[90vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-full">
            {pdfUrl && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Prescription PDF</h3>
                <iframe
                  src={pdfUrl}
                  className="w-full h-[calc(100vh-200px)]"
                  title="Prescription PDF"
                />
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function PatientName({ patientId }: { patientId: string }) {
  const patient = useQuery(api.patients.getPatientId, {
    patientId: parseInt(patientId),
  });

  if (patient === undefined) return <span>Loading...</span>;
  if ("error" in patient) return <span>Error: {patient.error}</span>;

  return <span>{`${patient.firstName} ${patient.lastName}`}</span>;
}
