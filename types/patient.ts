import { Id } from "@/convex/_generated/dataModel";

export interface Patient {

  id: Id<"patients">; // This will be mapped from _id
  _creationTime: number;
  patientId: string | number;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  phoneNumber: string;
  houseNo?: string;
  gramPanchayat?: string;
  village?: string;
  tehsil?: string;
  district?: string;
  state?: string;
  systolic?: string;
  diastolic?: string;
  heartRate?: string;
  temperature?: string;
  oxygenSaturation?: string;
  hospitalId?: string;
  allergies?: string;
  chronicConditions?: string;
  pastSurgeries?: string;
  familyHistory?: string;
}

