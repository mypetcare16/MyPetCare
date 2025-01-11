import { Id } from "@/convex/_generated/dataModel";

export interface Patient {

  id: Id<"patients">;
  patientId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
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
  allergies?: string;
  chronicConditions?: string;
  pastSurgeries?: string;
  familyHistory?: string;
  petName: string;
  petBreed?: string;
  petSpecies?: string;
  petAge?: number;
  petGender?: string;
  petDob: string;
  petMicrochipNo?: string;
};

