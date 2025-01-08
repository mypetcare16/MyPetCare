import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

// Define styles for a modern, structured PDF layout
const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { marginBottom: 20 },
  title: {
    fontSize: 28,
    marginBottom: 8,
    fontWeight: "bold",
    color: "#2E86AB",
  },
  subtitle: { fontSize: 16, marginBottom: 5, color: "#3E3E3E" },
  section: { marginVertical: 15 },
  text: { fontSize: 12, marginBottom: 4, color: "#4A4A4A" },
  table: {
    display: "flex",
    width: "auto",
    borderWidth: 1,
    borderColor: "#E1E1E1",
    marginBottom: 8,
  },
  tableRow: { flexDirection: "row" },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#E1E1E1",
    padding: 5,
  },
  tableCell: { fontSize: 10, color: "#4A4A4A" },
  note: { fontSize: 10, marginTop: 4, fontStyle: "italic" },
});

// Define the type for the prescription data
type PrescriptionData = {
  patientId: string;
  doctorId: string;
  symptoms: {
    name: string;
    frequency: string;
    severity: string;
    duration: string;
  }[];
  findings: { name: string }[];
  diagnoses: { name: string }[];
  medicines: {
    name: string;
    dosage: string;
    route: string;
    timesPerDay: string;
    durationDays: string;
    timing: string;
  }[];
  investigations: { name: string }[];
  investigationNotes?: string;
  followUpDate?: Date;
  medicineReminder: { message: boolean; call: boolean };
  medicineInstructions?: string;
  chronicCondition: boolean;
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

// Create the PrescriptionPDF component
const PrescriptionPDF: React.FC<{ data: PrescriptionData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Prescription Report</Text>
        <Text style={styles.text}>Patient ID: {data.patientId}</Text>
        <Text style={styles.text}>Doctor ID: {data.doctorId}</Text>
      </View>

      {/* Vitals Table */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Vitals</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Temperature</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Blood Pressure</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Pulse</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Height</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Weight</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>BMI</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Waist/Hip</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>SPO2</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{data.vitals.temperature}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{data.vitals.bloodPressure}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{data.vitals.pulse}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{data.vitals.height}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{data.vitals.weight}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{data.vitals.bmi}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{data.vitals.waistHip}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{data.vitals.spo2}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Symptoms Section */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Symptoms</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Name</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Frequency</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Severity</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Duration</Text>
            </View>
          </View>
          {data.symptoms.map((symptom, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{symptom.name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{symptom.frequency}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{symptom.severity}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{symptom.duration}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Medicines Section */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Medicines</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Name</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Dosage</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Route</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Frequency</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Duration</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Timing</Text>
            </View>
          </View>
          {data.medicines.map((medicine, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{medicine.name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{medicine.dosage}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{medicine.route}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{medicine.timesPerDay}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{medicine.durationDays}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{medicine.timing}</Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.note}>
          Instructions: {data.medicineInstructions}
        </Text>
        <Text style={styles.note}>
          Reminders: {data.medicineReminder.message ? "Message" : ""}{" "}
          {data.medicineReminder.call ? "Call" : ""}
        </Text>
      </View>

      {/* Follow-Up Section */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Follow-Up</Text>
        <Text style={styles.text}>
          Date:{" "}
          {data.followUpDate ? format(data.followUpDate, "PPP") : "Not set"}
        </Text>
      </View>
    </Page>
  </Document>
);

// Export the function to generate the PDF
export function generatePrescriptionPDF(data: PrescriptionData) {
  return <PrescriptionPDF data={data} />;
}
