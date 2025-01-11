"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ChevronDown,
  ChevronUp,
  UserCheck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "@/hooks/use-toast";
import MedicalHistoryPage from "@/components/pages/MedicalHistoryPage";
import LabReportPage from "@/components/pages/lab-report-page";
import BillingPage from "@/components/pages/billing-page";
import VaccinationPage from "@/components/pages/VaccinationPage";
import PrescriptionPage from "@/components/pages/Prescription";

type AppointmentStatus =
  | "Scheduled"
  | "waitlist"
  | "completed"
  | "cancelled"
  | "attending";

interface PatientCardProps {
  patientId: number;
  isSelected: boolean;
  onClick: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentStatus: AppointmentStatus;
  onStatusChange: (newStatus: AppointmentStatus) => void;
  isAttendingDisabled: boolean;
}

const PatientCard: React.FC<PatientCardProps> = ({
  patientId,
  isSelected,
  onClick,
  isOpen,
  onOpenChange,
  appointmentStatus,
  onStatusChange,
  isAttendingDisabled,
}) => {
  const patientInfo = useQuery(api.patients.getPatientId, { patientId });

  if (patientInfo === undefined) {
    return (
      <div className="text-sm text-gray-500">
        Loading patient information...
      </div>
    );
  }

  if (patientInfo === null || "error" in patientInfo) {
    return (
      <div className="text-sm text-red-500">
        {patientInfo?.error || "Patient not found"}
      </div>
    );
  }

  const { firstName, lastName, gender, petDob, phoneNumber } = patientInfo;

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
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

  const age = calculateAge(petDob);

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Card
          className={`mb-2 p-2 cursor-pointer ${
            isSelected
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "hover:bg-blue-100"
          }`}
          onClick={onClick}
        >
          <CardContent className="p-2">
            <div className="flex justify-between items-center">
              <p
                className={`font-medium text-sm ${isSelected ? "text-white" : ""}`}
              >
                {firstName} {lastName}
              </p>
              <div className="flex items-center">
                <p
                  className={`text-xs mr-2 ${isSelected ? "text-white" : "text-muted-foreground"}`}
                >
                  {gender}, {age} years
                </p>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-2">
        <div
          className={`p-2 rounded-b-md ${isSelected ? "bg-blue-100" : "bg-muted"}`}
        >
          <p className="text-sm">
            <strong>Name:</strong> {firstName} {lastName}
          </p>
          <p className="text-sm">
            <strong>Phone:</strong> {phoneNumber}
          </p>
          <p className="text-sm">
            <strong>Date of Birth:</strong>{" "}
            {new Date(petDob).toLocaleDateString()}
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <p className="text-sm">
                <strong>Status:</strong>{" "}
                <span
                  className={
                    appointmentStatus === "attending"
                      ? "text-blue-500"
                      : appointmentStatus === "completed"
                        ? "text-green-500"
                        : "text-yellow-500"
                  }
                >
                  {appointmentStatus}
                </span>
              </p>
              <div className="flex gap-2">
                {appointmentStatus === "Scheduled" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={() => onStatusChange("attending")}
                    disabled={isAttendingDisabled}
                  >
                    <UserCheck className="w-4 h-4 mr-1" />
                    Attending
                  </Button>
                )}
                {appointmentStatus === "attending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => onStatusChange("completed")}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                )}
              </div>
            </div>
            {isAttendingDisabled && appointmentStatus === "Scheduled" && (
              <div className="flex items-center text-sm text-yellow-600 bg-yellow-100 p-2 rounded">
                <AlertCircle className="w-4 h-4 mr-2" />
                Please complete the current appointment before attending to
                another patient.
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const Sidebar: React.FC<{
  onPatientSelect: (patientId: number) => void;
  selectedPatientId: number | null;
  openPatientId: number | null;
  setOpenPatientId: (patientId: number | null) => void;
}> = ({
  onPatientSelect,
  selectedPatientId,
  openPatientId,
  setOpenPatientId,
}) => {
  const { user } = useUser();
  const doctorId = user?.id;

  const appointments = useQuery(
    api.patients.getTodaysAppointmentsByDoctor,
    doctorId ? { doctorId } : "skip"
  );
  const updateAppointmentStatus = useMutation(
    api.patients.updateAppointmentStatus
  );

  const [attendingPatientId, setAttendingPatientId] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (appointments && appointments.length > 0 && !selectedPatientId) {
      const scheduledAppointments = appointments.filter(
        (appointment) => appointment.status === "Scheduled"
      );
      if (scheduledAppointments.length > 0) {
        onPatientSelect(Number(scheduledAppointments[0].patientId));
      }
    }

    const attendingAppointment = appointments?.find(
      (appointment) => appointment.status === "attending"
    );
    if (attendingAppointment) {
      setAttendingPatientId(Number(attendingAppointment.patientId));
    } else {
      setAttendingPatientId(null);
    }
  }, [appointments, selectedPatientId, onPatientSelect]);

  if (!doctorId) {
    return (
      <p className="text-center mt-4">Doctor information not available.</p>
    );
  }

  if (appointments === undefined) {
    return <p className="text-center mt-4">Loading appointments...</p>;
  }

  if (appointments === null) {
    return (
      <p className="text-center mt-4">
        Error loading appointments. Please try again.
      </p>
    );
  }

  const onQueuePatients = appointments.filter(
    (appointment) => appointment.status === "Scheduled"
  );
  const attendingPatients = appointments.filter(
    (appointment) => appointment.status === "attending"
  );
  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed"
  );

  const totalPatients =
    onQueuePatients.length +
    attendingPatients.length +
    completedAppointments.length;

  const handlePatientClick = (patientId: number) => {
    onPatientSelect(patientId);
    setOpenPatientId(patientId === openPatientId ? null : patientId);
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: AppointmentStatus,
    patientId: number
  ) => {
    try {
      if (newStatus === "attending") {
        if (attendingPatientId !== null) {
          toast({
            title: "Cannot attend to multiple patients",
            description:
              "Please complete the current patient's appointment first.",
            variant: "destructive",
          });
          return;
        }
        setAttendingPatientId(patientId);
      } else if (newStatus === "completed") {
        setAttendingPatientId(null);
      }

      await updateAppointmentStatus({ appointmentId, status: newStatus });
      toast({
        title: "Appointment status updated",
        description: `Patient status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Failed to update appointment status:", error);
      toast({
        title: "Error",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <aside className="w-full md:w-64 overflow-y-auto border-r p-4 flex flex-col h-full">
      <h2 className="mb-4 font-semibold">Today's Patients ({totalPatients})</h2>

      <div className="mb-6 flex-grow">
        <h3 className="text-sm font-semibold mb-2 bg-blue-100 p-2 rounded-t-md">
          On Queue ({onQueuePatients.length})
        </h3>
        <div>
          {onQueuePatients.length > 0 ? (
            onQueuePatients.map((appointment) => (
              <PatientCard
                key={appointment._id}
                patientId={Number(appointment.patientId)}
                isSelected={selectedPatientId === Number(appointment.patientId)}
                onClick={() =>
                  handlePatientClick(Number(appointment.patientId))
                }
                isOpen={openPatientId === Number(appointment.patientId)}
                onOpenChange={(open) =>
                  setOpenPatientId(open ? Number(appointment.patientId) : null)
                }
                appointmentStatus={appointment.status as AppointmentStatus}
                onStatusChange={(newStatus) =>
                  handleStatusChange(
                    appointment._id,
                    newStatus,
                    Number(appointment.patientId)
                  )
                }
                isAttendingDisabled={attendingPatientId !== null}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No patients in queue.
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 flex-grow">
        <h3 className="text-sm font-semibold mb-2 bg-blue-100 p-2 rounded-t-md">
          Attending ({attendingPatients.length})
        </h3>
        <div>
          {attendingPatients.length > 0 ? (
            attendingPatients.map((appointment) => (
              <PatientCard
                key={appointment._id}
                patientId={Number(appointment.patientId)}
                isSelected={selectedPatientId === Number(appointment.patientId)}
                onClick={() =>
                  handlePatientClick(Number(appointment.patientId))
                }
                isOpen={openPatientId === Number(appointment.patientId)}
                onOpenChange={(open) =>
                  setOpenPatientId(open ? Number(appointment.patientId) : null)
                }
                appointmentStatus={appointment.status as AppointmentStatus}
                onStatusChange={(newStatus) =>
                  handleStatusChange(
                    appointment._id,
                    newStatus,
                    Number(appointment.patientId)
                  )
                }
                isAttendingDisabled={false}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No patients currently being attended.
            </p>
          )}
        </div>
      </div>

      <div className="flex-grow">
        <h3 className="text-sm font-semibold mb-2 bg-blue-100 p-2 rounded-t-md">
          Appointment Completed ({completedAppointments.length})
        </h3>
        <div>
          {completedAppointments.length > 0 ? (
            completedAppointments.map((appointment) => (
              <PatientCard
                key={appointment._id}
                patientId={Number(appointment.patientId)}
                isSelected={selectedPatientId === Number(appointment.patientId)}
                onClick={() =>
                  handlePatientClick(Number(appointment.patientId))
                }
                isOpen={openPatientId === Number(appointment.patientId)}
                onOpenChange={(open) =>
                  setOpenPatientId(open ? Number(appointment.patientId) : null)
                }
                appointmentStatus={appointment.status as AppointmentStatus}
                onStatusChange={(newStatus) =>
                  handleStatusChange(
                    appointment._id,
                    newStatus,
                    Number(appointment.patientId)
                  )
                }
                isAttendingDisabled={true}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No completed appointments yet.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

const ActionButtons: React.FC<{
  setSelectedSection: (section: string) => void;
  selectedSection: string;
}> = ({ setSelectedSection, selectedSection }) => {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {["overview", "prescription", "vaccination", "labReports", "billing"].map(
        (section) => (
          <Button
            key={section}
            variant={selectedSection === section ? "default" : "outline"}
            className={
              selectedSection === section
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "hover:bg-blue-100"
            }
            onClick={() => setSelectedSection(section)}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </Button>
        )
      )}
    </div>
  );
};
export default function DoctorDashboard() {
  const [selectedSection, setSelectedSection] = useState("overview");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [openPatientId, setOpenPatientId] = useState<number | null>(null);

  const handlePatientSelect = (patientId: number) => {
    setSelectedPatientId(patientId);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row">
      <Sidebar
        onPatientSelect={handlePatientSelect}
        selectedPatientId={selectedPatientId}
        openPatientId={openPatientId}
        setOpenPatientId={setOpenPatientId}
      />
      <main className="flex-1 overflow-y-auto p-4">
        <ActionButtons
          setSelectedSection={setSelectedSection}
          selectedSection={selectedSection}
        />
        {selectedPatientId !== null ? (
          <>
            {selectedSection === "overview" && (
              <MedicalHistoryPage patientId={selectedPatientId} />
            )}
            {selectedSection === "prescription" && (
              <PrescriptionPage patientId={selectedPatientId} />
            )}
            {selectedSection === "vaccination" && (
              <VaccinationPage patientId={selectedPatientId} />
            )}
            {selectedSection === "labReports" && (
              <LabReportPage patientId={selectedPatientId} />
            )}
            {selectedSection === "billing" && (
              <BillingPage patientId={selectedPatientId} />
            )}
          </>
        ) : (
          <p className="text-center mt-4">
            Please select a patient to view their information.
          </p>
        )}
      </main>
    </div>
  );
}
