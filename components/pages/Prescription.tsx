"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@clerk/nextjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Eye,
  X,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import SymptomPage from "./symptom-page";
import FindingsPage from "./findings-page";
import DiagnosisPage from "./diagnosis-page";
import MedicinePage from "./medicine-page";
import InvestigationsPage from "./investigations-page";
import { Id } from "@/convex/_generated/dataModel";
import EnhancedPreviousPrescriptions from "./previous-prescriptions";
import EnhancedPrescriptionPreview from "./prescription-preview";
import { sendPrescriptionToWhatsApp } from "./wati-sender";
import { jsPDF } from "jspdf";
import { UnsavedChangesModal } from "./UnsavedChangesModal";
import { useRouter, usePathname } from "next/navigation";

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

type Prescription = {
  prescriptionId: string;
  symptoms: SymptomItem[];
  findings: FindingItem[];
  diagnoses: { id: string; name: string }[];
  medicines: MedicineItem[];
  investigations: { id: string; name: string }[];
  investigationNotes?: string;
  followUpDate?: string;
  referTo?: string;
  medicineReminder: {
    message: boolean;
    call: boolean;
  };
  medicineInstructions?: string;
  chronicCondition: boolean;
  criticalLabValues?: string;
  vitals: {
    temperature: string;
    bloodPressure: string;
    pulse: string;
  };
  severity?: "Mild" | "Moderate" | "Severe";
};

interface MultiStepPrescriptionProps {
  patientId: number;
}

const steps = [
  "Symptoms",
  "Findings",
  "Diagnosis",
  "Medicine",
  "Investigations",
  "Follow-Up",
];

export default function MultiStepPrescription({
  patientId,
}: MultiStepPrescriptionProps) {
  const [isLeavingPage, setIsLeavingPage] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sendToWhatsApp, setSendToWhatsApp] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [symptoms, setSymptoms] = useState<SymptomItem[]>([]);
  const [findings, setFindings] = useState<FindingItem[]>([]);
  const [diagnoses, setDiagnoses] = useState<{ id: string; name: string }[]>(
    []
  );
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [investigations, setInvestigations] = useState<
    { id: string; name: string }[]
  >([]);
  const [investigationNotes, setInvestigationNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined);
  const [referTo, setReferTo] = useState("");
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [medicineReminder, setMedicineReminder] = useState({
    message: false,
    call: false,
  });
  const [medicineInstructions, setMedicineInstructions] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previousPrescriptions, setPreviousPrescriptions] = useState<
    Prescription[]
  >([]);
  const [activeTab, setActiveTab] = useState("new");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [chronicCondition, setChronicCondition] = useState(false);
  const [criticalLabValues, setCriticalLabValues] = useState("");
  const [vitals, setVitals] = useState({
    temperature: "",
    bloodPressure: "",
    pulse: "",
    height: "",
    weight: "",
    bmi: "",
    waistHip: "",
    spo2: "",
  });
  const [severity, setSeverity] = useState<"Mild" | "Moderate" | "Severe">(
    "Mild"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  const { user } = useUser();
  const getPatientPhone = useQuery(api.patients.getPatientPhone, {
    patientId: patientId.toString(),
  });
  const generateFileUrl = useMutation(api.prescriptions.generateFileUrl);
  const savePrescription = useMutation(api.prescriptions.savePrescription);
  const generateUploadUrl = useMutation(api.labReports.generateUploadUrl);
  const getLastPrescriptionForPatient = useQuery(
    api.prescriptions.getLastPrescriptionForPatient,
    {
      patientId: patientId.toString(),
    }
  );
  const userDetails = useQuery(api.users.getUserDetails, {
    userId: user?.id ?? "",
  });

  const checkUnsavedChanges = useCallback(() => {
    return (
      symptoms.length > 0 ||
      findings.length > 0 ||
      diagnoses.length > 0 ||
      medicines.length > 0 ||
      investigations.length > 0 ||
      investigationNotes !== "" ||
      followUpDate !== undefined ||
      medicineReminder.message ||
      medicineReminder.call ||
      medicineInstructions !== "" ||
      chronicCondition ||
      criticalLabValues !== "" ||
      vitals.temperature !== "" ||
      vitals.bloodPressure !== "" ||
      vitals.pulse !== "" ||
      severity !== "Mild"
    );
  }, [
    symptoms,
    findings,
    diagnoses,
    medicines,
    investigations,
    investigationNotes,
    followUpDate,
    medicineReminder,
    medicineInstructions,
    chronicCondition,
    criticalLabValues,
    vitals,
    severity,
  ]);

  useEffect(() => {
    setHasUnsavedChanges(checkUnsavedChanges());
  }, [checkUnsavedChanges]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (pathname !== prevPathname.current && hasUnsavedChanges) {
      const userWantsToLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (userWantsToLeave) {
        setHasUnsavedChanges(false);
      } else {
        router.push(prevPathname.current);
      }
    }
    prevPathname.current = pathname;
  }, [pathname, hasUnsavedChanges, router]);

  useEffect(() => {
    if (getLastPrescriptionForPatient) {
      const apiPrescription = getLastPrescriptionForPatient as any;
      setPreviousPrescriptions([
        {
          prescriptionId: apiPrescription._id,
          symptoms: apiPrescription.symptoms,
          findings: apiPrescription.findings.map((f: any) => ({
            id: f.id,
            name: f.description,
          })),
          diagnoses: apiPrescription.diagnoses,
          medicines: apiPrescription.medicines,
          investigations: apiPrescription.investigations,
          investigationNotes: apiPrescription.investigationNotes,
          followUpDate: apiPrescription.followUpDate,
          referTo: apiPrescription.referTo,
          medicineReminder: apiPrescription.medicineReminder,
          medicineInstructions: apiPrescription.medicineInstructions,
          chronicCondition: apiPrescription.chronicCondition,
          vitals: apiPrescription.vitals,
          severity: apiPrescription.severity || undefined,
        },
      ]);
    }
  }, [getLastPrescriptionForPatient]);

  const generatePDF = async (prescriptionData: any) => {
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const lineHeight = 7;
    let yPos = 30;

    const clinicName = userDetails?.clinicName || "HealthCare Clinic";
    const clinicAddress =
      userDetails?.address || "123 Medical Street, Healthville, HC 12345";
    const clinicPhone = userDetails?.phone || "+1 (555) 123-4567";
    const clinicEmail = userDetails?.email || "info@healthcareclinic.com";

    const doctorName = userDetails
      ? `Dr. ${userDetails.firstName} ${userDetails.lastName}`
      : "Dr. Jane Smith";
    const doctorSpecialty =
      userDetails?.specialization || "General Practitioner";
    const doctorLicense = userDetails?.licenseNumber
      ? `License No: ${userDetails.licenseNumber}`
      : "License No: MD12345";
    const addHeader = async () => {
      // Add light gray background
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 0, pageWidth, 25, "F");

      let logoWidth = 0;
      let logoHeight = 0;
      let textStartX = margin;

      // Add logo if available
      if (userDetails?.logo) {
        try {
          const logoUrl = await generateFileUrl({
            storageId: userDetails.logo,
          });
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = logoUrl;
          });

          // Calculate logo dimensions (keeping aspect ratio)
          const aspectRatio = img.width / img.height;
          logoHeight = 20; // Fixed height
          logoWidth = logoHeight * aspectRatio;

          // Position logo in top left corner with some padding
          doc.addImage(img, "PNG", margin, 2.5, logoWidth, logoHeight);

          // Adjust text position to accommodate logo
          textStartX = margin + logoWidth + 5;
        } catch (error) {
          console.error("Error loading logo:", error);
          // If logo fails to load, text will start from the left margin
        }
      }

      // Calculate available width for text
      const availableWidth = pageWidth - textStartX - margin;

      // Add clinic details
      doc.setTextColor(0, 0, 0);

      // Clinic name
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(clinicName, textStartX + availableWidth / 2, 8, {
        align: "center",
      });

      // Address
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(clinicAddress, textStartX + availableWidth / 2, 14, {
        align: "center",
      });

      // Contact details
      doc.setFontSize(8);
      doc.text(
        `Phone: ${clinicPhone} | Email: ${clinicEmail}`,
        textStartX + availableWidth / 2,
        20,
        { align: "center" }
      );

      // Add separator line
      doc.setDrawColor(0);
      doc.line(margin, 25, pageWidth - margin, 25);
      yPos = 35;
    };

    // Start PDF generation
    await addHeader();

    const addText = (text: string, indent = 0, bold = false, fontSize = 12) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2 - indent);
      lines.forEach((line: string | string[]) => {
        if (yPos > pageHeight - margin * 2 - 30) addNewPage();
        doc.text(line, margin + indent, yPos);
        yPos += lineHeight;
      });
    };

    const addSection = (title: string, content: string) => {
      if (yPos + lineHeight * 3 > pageHeight - margin * 2 - 30) addNewPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(33, 150, 243); // Highlighted color
      doc.text(`• ${title}`, margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Default color
      addText(content, 10);
      yPos += 5;
    };

    const addFooter = (pageNo: number, totalPages: number) => {
      const footerY = pageHeight - margin - 20;
      doc.setFillColor(240, 240, 240);
      doc.rect(0, footerY - 5, pageWidth, 25, "F");
      doc.setFontSize(9);
      doc.text(doctorName, margin, footerY);
      doc.text(doctorSpecialty, margin, footerY + 5);
      doc.text(doctorLicense, margin, footerY + 10);
      doc.text(
        `Page ${pageNo} of ${totalPages}`,
        pageWidth - margin,
        footerY + 10,
        { align: "right" }
      );
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    };

    const addNewPage = () => {
      doc.addPage();
      yPos = 30;
      addHeader();
    };

    const addTable = (headers: string[], rows: string[][], startY: number) => {
      const cellPadding = 2;
      const cellWidths = headers.map((_, index) =>
        index === 0 ? 40 : (pageWidth - margin * 2 - 40) / (headers.length - 1)
      );
      let cellHeight = 10;

      const drawTableHeader = (yPos: number) => {
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos, pageWidth - margin * 2, cellHeight, "F");
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        headers.forEach((header, i) => {
          doc.text(
            header,
            margin +
              cellWidths.slice(0, i).reduce((a, b) => a + b, 0) +
              cellWidths[i] / 2,
            yPos + cellHeight / 2,
            {
              align: "center",
              baseline: "middle",
            }
          );
        });
      };

      let currentY = startY;

      // Draw the initial table header on the first page
      drawTableHeader(currentY);
      currentY += cellHeight;

      doc.setFont("helvetica", "normal");

      rows.forEach((row, rowIndex) => {
        let maxHeight = cellHeight;

        // Calculate the height of the current row
        row.forEach((cell, cellIndex) => {
          const cellLines = doc.splitTextToSize(
            cell,
            cellWidths[cellIndex] - cellPadding * 2
          );
          const cellHeight = Math.max(
            10,
            cellLines.length * 5 + cellPadding * 2
          );
          maxHeight = Math.max(maxHeight, cellHeight);
        });

        // Check if the row fits in the current page
        if (currentY + maxHeight > pageHeight - margin * 2 - 30) {
          // If not, create a new page
          addNewPage();

          // Draw the table header again on the new page
          drawTableHeader(yPos);
          currentY = yPos + cellHeight; // Update currentY to account for the header
        }

        // Draw the current row
        row.forEach((cell, cellIndex) => {
          const xPos =
            margin + cellWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0);
          doc.rect(xPos, currentY, cellWidths[cellIndex], maxHeight);
          const cellLines = doc.splitTextToSize(
            cell,
            cellWidths[cellIndex] - cellPadding * 2
          );
          cellLines.forEach((line: string, lineIndex: number) => {
            doc.text(
              line,
              xPos + cellWidths[cellIndex] / 2,
              currentY + cellPadding + lineIndex * 5 + 2.5,
              {
                align: "center",
                baseline: "middle",
              }
            );
          });
        });

        currentY += maxHeight;
      });

      yPos = currentY + 5; // Update the global Y position for the next content
    };

    // Add prescription title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Rx  Prescription ", pageWidth / 2, yPos, { align: "center" });
    yPos += lineHeight * 2;

    // Add patient details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Patient ID: ${prescriptionData.patientId}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Doctor: ${doctorName}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Date: ${format(new Date(), "PPP")}`, margin, yPos);
    yPos += lineHeight * 2;

    addSection(
      "Vitals",
      `Temperature: ${prescriptionData.vitals.temperature}, Blood Pressure: ${prescriptionData.vitals.bloodPressure}, ` +
        `Pulse: ${prescriptionData.vitals.pulse}, Height: ${prescriptionData.vitals.height}, Weight: ${prescriptionData.vitals.weight}, ` +
        `BMI: ${prescriptionData.vitals.bmi}, Waist/Hip: ${prescriptionData.vitals.waistHip}, SPO2: ${prescriptionData.vitals.spo2}`
    );

    // Symptoms Table
    const symptomHeaders = ["Symptom", "Frequency", "Severity", "Duration"];
    const symptomRows = prescriptionData.symptoms.map((s: SymptomItem) => [
      s.name,
      s.frequency,
      s.severity,
      s.duration,
    ]);
    addTable(symptomHeaders, symptomRows, yPos);

    addSection(
      "Findings",
      prescriptionData.findings
        .map((f: { description: string }) => f.description)
        .join(", ") || "No findings"
    );

    addSection(
      "Diagnosis",
      prescriptionData.diagnoses
        .map((d: { name: string }) => d.name)
        .join(", ") || "No diagnosis"
    );
    addText(`Severity: ${prescriptionData.severity || "Not specified"}`);
    addText(
      `Chronic Condition: ${prescriptionData.chronicCondition ? "Yes" : "No"}`
    );
    addText(
      `Critical Lab Values: ${prescriptionData.criticalLabValues || "None"}`
    );

    // Medicines Table
    const medicineHeaders = [
      "Medicine",
      "Dosage",
      "Route",
      "Frequency",
      "Duration",
      "Timing",
    ];
    const medicineRows = prescriptionData.medicines.map((m: MedicineItem) => [
      m.name,
      m.dosage,
      m.route,
      `${m.timesPerDay} times per day`,
      `${m.durationDays} days`,
      m.timing,
    ]);
    addTable(medicineHeaders, medicineRows, yPos);

    addText(`Instructions: ${prescriptionData.medicineInstructions || "None"}`);

    addSection(
      "Investigations",
      prescriptionData.investigations
        .map((i: { name: string }) => i.name)
        .join(", ") || "No investigations"
    );
    if (prescriptionData.investigationNotes) {
      addText(`Notes: ${prescriptionData.investigationNotes}`);
    }

    addSection(
      "Follow-up",
      prescriptionData.followUpDate
        ? format(new Date(prescriptionData.followUpDate), "PPP")
        : "No follow-up date set"
    );
    addText(
      `Reminders: ${prescriptionData.medicineReminder.message ? "Message" : ""}${prescriptionData.medicineReminder.message && prescriptionData.medicineReminder.call ? ", " : ""}${prescriptionData.medicineReminder.call ? "Call" : ""}` ||
        "No reminders set"
    );
    addText(`ReferTo: ${prescriptionData.referTo || "None"}`);

    const addSignature = async () => {
      if (userDetails?.signatureStorageId) {
        try {
          const signatureUrl = await generateFileUrl({
            storageId: userDetails.signatureStorageId,
          });
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = signatureUrl;
          });

          const signatureWidth = 50;
          const signatureHeight = 25;
          const signatureX = pageWidth - margin - signatureWidth;
          const signatureY = pageHeight - margin - 600; // Position above the footer

          doc.addImage(
            img,
            "PNG",
            signatureX,
            signatureY,
            signatureWidth,
            signatureHeight
          );
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(
            "Doctor's Signature",
            signatureX + signatureWidth / 2,
            signatureY + signatureHeight + 5,
            { align: "center" }
          );
        } catch (error) {
          console.error("Error loading signature:", error);
        }
      }
    };

    // Finalize and add footers for all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      if (i === totalPages) {
        await addSignature(); // Add signature to the last page
      }
      addFooter(i, totalPages);
    }

    return doc.output("blob");
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error("User not signed in");
      return;
    }
    if (!vitals.temperature || !vitals.bloodPressure || !vitals.pulse) {
      alert("Vitals are mandatory fields. Please fill them before submitting.");
      return;
    }
    setIsSubmitting(true);

    const doctorId = user.id;
    const patientIdString = patientId.toString();

    const newPrescription = {
      doctorId,
      patientId: patientIdString,
      medicines,
      symptoms,
      findings: findings.map((f) => ({ id: f.id, description: f.name })),
      diagnoses,
      investigations,
      investigationNotes,
      followUpDate: followUpDate ? followUpDate.toISOString() : undefined,
      referTo,
      medicineReminder,
      medicineInstructions,
      chronicCondition,
      criticalLabValues,
      vitals,
      severity,
    };

    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const pdfBlob = await generatePDF(newPrescription);
        setPdfBlob(pdfBlob);

        const uploadUrl = await generateUploadUrl();

        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/pdf",
          },
          body: pdfBlob,
        });

        if (!result.ok) {
          throw new Error(`Failed to upload file: ${result.statusText}`);
        }

        const { storageId } = await result.json();

        const savedPrescription = await savePrescription({
          ...newPrescription,
          storageId,
        });

        if (sendToWhatsApp && getPatientPhone) {
          try {
            const pdfUrl = await generateFileUrl({ storageId: storageId });
            await sendPrescriptionToWhatsApp(
              getPatientPhone,
              userDetails?.firstName + " " + userDetails?.lastName || "Doctor",
              pdfUrl,
              "Patient"
            );
            console.log("Prescription sent to WhatsApp successfully");
          } catch (error) {
            console.error("Error sending prescription to WhatsApp:", error);
          }
        }

        setSaveSuccess(true);
        resetForm();
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveSuccess(false), 3000);

        break;
      } catch (error) {
        console.error(
          `Error saving prescription (attempt ${retries + 1}):`,
          error
        );
        retries++;
        if (retries >= maxRetries) {
          alert(
            `Failed to save prescription after ${maxRetries} attempts. Please try again later.`
          );
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
        }
      }
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setSymptoms([]);
    setFindings([]);
    setDiagnoses([]);
    setMedicines([]);
    setInvestigations([]);
    setInvestigationNotes("");
    setFollowUpDate(undefined);
    setReferTo("");
    setMedicineReminder({ message: false, call: false });
    setMedicineInstructions("");
    setChronicCondition(false);
    setVitals({
      temperature: "",
      bloodPressure: "",
      pulse: "",
      height: "",
      weight: "",
      bmi: "",
      waistHip: "",
      spo2: "",
    });
    setSeverity("Mild");
    setActiveStep(0);
    setShowPreview(false);
  };

  const renderPreviousPrescriptions = () => (
    <EnhancedPreviousPrescriptions
      patientId={patientId.toString()}
      userId={user?.id || ""}
    />
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <SymptomPage symptoms={symptoms} setSymptoms={setSymptoms} />;
      case 1:
        return (
          <FindingsPage
            findings={findings}
            setFindings={setFindings}
            vitals={vitals}
            setVitals={setVitals}
          />
        );
      case 2:
        return (
          <DiagnosisPage
            diagnoses={diagnoses}
            setDiagnoses={setDiagnoses}
            severity={severity}
            setSeverity={setSeverity}
            chronicCondition={chronicCondition}
            setChronicCondition={setChronicCondition}
            criticalLabValues={criticalLabValues}
            setCriticalLabValues={setCriticalLabValues}
          />
        );
      case 3:
        return (
          <MedicinePage
            medicines={medicines}
            setMedicines={setMedicines}
            medicineInstructions={medicineInstructions}
            setMedicineInstructions={setMedicineInstructions}
            medicineReminder={medicineReminder}
            setMedicineReminder={setMedicineReminder}
          />
        );
      case 4:
        return (
          <InvestigationsPage
            investigations={investigations}
            setInvestigations={setInvestigations}
            investigationNotes={investigationNotes}
            setInvestigationNotes={setInvestigationNotes}
          />
        );
      case 5:
        return (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Follow-Up</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 justify-between">
              <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full sm:w-[280px] justify-start text-left font-normal ${
                      !followUpDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {followUpDate ? (
                      format(followUpDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={followUpDate}
                    onSelect={(date) => {
                      setFollowUpDate(date);
                      setPopoverOpen(false);
                    }}
                    initialFocus
                    className="p-5"
                  />
                </PopoverContent>
              </Popover>
              <Button
                onClick={() => setShowPreview(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto px-4 py-2 flex items-center rounded-md shadow-md justify-center sm:justify-end"
              >
                <Eye className="mr-2" /> Preview Prescription
              </Button>
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="medicineReminderMessage"
                  checked={medicineReminder.message}
                  onCheckedChange={(checked) =>
                    setMedicineReminder((prev) => ({
                      ...prev,
                      message: checked as boolean,
                    }))
                  }
                />
                <label
                  htmlFor="medicineReminderMessage"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Message Reminder
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="medicineReminderCall"
                  checked={medicineReminder.call}
                  onCheckedChange={(checked) =>
                    setMedicineReminder((prev) => ({
                      ...prev,
                      call: checked as boolean,
                    }))
                  }
                />
                <label
                  htmlFor="medicineReminderCall"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Call Reminder
                </label>
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="referTo"
                className="text-sm font-medium leading-none block mb-2"
              >
                Refer To
              </label>
              <input
                type="text"
                id="referTo"
                value={referTo}
                onChange={(e) => setReferTo(e.target.value)}
                placeholder="Enter referral details"
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPreview = () => (
    <EnhancedPrescriptionPreview
      data={{
        patientId: patientId.toString(),
        doctorId: user?.id || "",
        symptoms,
        findings,
        diagnoses,
        medicines,
        investigations,
        investigationNotes,
        followUpDate,
        referTo,
        medicineReminder,
        medicineInstructions,
        chronicCondition,
        criticalLabValues,
        vitals,
        severity,
      }}
    />
  );

  return (
    <Card className="w-full max-w-6xl mx-auto min-h-screen sm:min-h-[600px] relative">
      <CardHeader>
        <CardTitle className="text-1xl">
          Prescription Management for Patient ID: {patientId}
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-[calc(100vh-200px)] sm:min-h-[400px]">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <Button
              onClick={() => setActiveTab("previous")}
              variant={activeTab === "previous" ? "default" : "outline"}
              className={`w-full sm:w-auto ${
                activeTab === "previous"
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Previous Prescriptions
            </Button>
            <Button
              onClick={() => setActiveTab("new")}
              variant={activeTab === "new" ? "default" : "outline"}
              className={`w-full sm:w-auto ${
                activeTab === "new"
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              New Prescription
            </Button>
          </div>
          {activeTab === "new" && (
            <div className="flex items-center justify-between w-full">
              <Button
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              >
                <ChevronLeft className="mr-2" />
              </Button>
              <div className="flex-grow flex justify-center space-x-1 mx-5">
                {steps.map((step, index) => (
                  <Button
                    key={step}
                    onClick={() => setActiveStep(index)}
                    variant={activeStep === index ? "default" : "outline"}
                    className={`w-full text-center text-sm py-2 ${
                      activeStep === index
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    {step}
                  </Button>
                ))}
              </div>
              <Button
                onClick={() =>
                  setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))
                }
                disabled={activeStep === steps.length - 1}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              >
                <ChevronRight className="ml-2" />
              </Button>
            </div>
          )}
        </div>
        <ScrollArea className="h-[calc(100vh-400px)] sm:h-[400px] pr-4">
          {activeTab === "new"
            ? renderStepContent(activeStep)
            : renderPreviousPrescriptions()}
        </ScrollArea>
      </CardContent>
      {saveSuccess && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg animate-fade-in-out">
          Prescription Saved Successfully!
        </div>
      )}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>Prescription Preview</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[calc(90vh-200px)]">
            {renderPreview()}
          </ScrollArea>
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="sendToWhatsApp"
              checked={sendToWhatsApp}
              onCheckedChange={(checked) =>
                setSendToWhatsApp(checked as boolean)
              }
            />
            <label
              htmlFor="sendToWhatsApp"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Send prescription to WhatsApp
            </label>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              onClick={() => setShowPreview(false)}
              variant="outline"
              className="w-full sm:w-auto mt-2 sm:mt-0"
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" /> Close
            </Button>
            <Button
              onClick={handleSubmit}
              className="w-full sm:w-auto mt-2 sm:mt-0 bg-blue-500 text-white hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Prescription"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <UnsavedChangesModal
        isOpen={isLeavingPage}
        onClose={() => setIsLeavingPage(false)}
        onConfirm={() => {
          setHasUnsavedChanges(false);
          setIsLeavingPage(false);
        }}
      />
    </Card>
  );
}
