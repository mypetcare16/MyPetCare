"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

interface MedicalHistoryPageProps {
  patientId: number;
}

const MedicalHistoryPage: React.FC<MedicalHistoryPageProps> = ({
  patientId,
}) => {
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser();
  const userId = user?.id;

  const lastAppointment = useQuery(
    api.appointment.getLastAppointmentForPatient,
    patientId && userId
      ? {
          doctorId: userId,
          patientId: String(patientId), // Convert to string
        }
      : "skip" // Skip the query if patientId or userId is not available
  );
  const getPatientById = useQuery(api.patients.getPatientId, { patientId });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (patientId === null) {
    return <div>Please select a patient</div>;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-base font-medium">Medical History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Patient ID</p>
            <p>{patientId}</p>
          </div>

          {[
            {
              label: "Appointment Date",
              value: lastAppointment?.appointmentDate
                ? new Date(lastAppointment.appointmentDate).toLocaleDateString()
                : "No data",
            },
            {
              label: " Allergies",
              value: getPatientById?.allergies || "No data",
            },
            {
              label: "Past Surgeries",
              value: getPatientById?.pastSurgeries || "No data",
            },
            {
              label: "Medical problems",
              value: lastAppointment?.reasonForVisit || "No data",
            },
            {
              label: "Refered By",
              value: lastAppointment?.referredBy || "No data",
            },
            {
              label: "Insurance Details",
              value: lastAppointment?.insuranceDetails || "No data",
            },
            { label: "Notes", value: lastAppointment?.notes || "No data" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p>{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalHistoryPage;
