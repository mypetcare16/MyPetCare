import { mutation,query} from "./_generated/server";
import { v } from "convex/values";

interface PatientData {
  id: number;
  name: string;
  age: number;
  lastVisit: string | null;
  nextAppointment: string | null;
  condition: string | null;
  lastFollowUpCall: string | null;
  followUpStatus: string | null;
  followUpNotes: string | null;
  appointmentType: string | null;
  criticality: string | null;
}
export const getAppoitmentsByDoctor =  query({
  // Define the arguments for the query
  args: {
    limit: v.optional(v.number()),
    doctorId: v.optional(v.string()),
  },
  // Define the handler function for the query
  handler: async (ctx, args) => {
    const { limit = 10, doctorId } = args;

    // Fetch patients
    const patients = await ctx.db
      .query("patients")
      .take(limit);

    // Process each patient to fetch related data
    const patientData: PatientData[] = await Promise.all(
      patients.map(async (patient) => {
        // Fetch the most recent appointment for this patient
        const appointment = await ctx.db
          .query("appointments")
          .withIndex("by_patient_id", (q) => q.eq("patientId", patient._id.toString()))
          .order("desc")
          .first();

        // Fetch the most recent prescription for this patient
        const prescription = await ctx.db
          .query("prescriptions")
          .withIndex("by_patient_id", (q) => q.eq("patientId", patient._id.toString()))
          .order("desc")
          .first();

        // Calculate age from date of birth
        const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

        return {
          id: patient.patientId,
          name: `${patient.firstName} ${patient.lastName}`,
          age,
          lastVisit: appointment?.appointmentDate ?? null,
          nextAppointment: appointment?.status === "Scheduled" ? appointment.appointmentDate : null,
          condition: prescription?.diagnoses[0]?.name ?? null,
          lastFollowUpCall: null, // This information is not available in the current schema
          followUpStatus: appointment?.status ?? null,
          followUpNotes: prescription?.investigationNotes ?? null,
          appointmentType: appointment?.appointmentType ?? null,
          criticality: prescription?.severity ?? null,
        };
      })
    );

    // If doctorId is provided, filter patients by doctor
    const filteredPatientData = doctorId
      ? patientData.filter((patient) => {
          const appointment = ctx.db
            .query("appointments")
            .withIndex("by_patient_id", (q) => q.eq("patientId", patient.id.toString()))
            .filter((q) => q.eq(q.field("doctorId"), doctorId))
            .first();
          return appointment !== null;
        })
      : patientData;

    return filteredPatientData;
  },
});

export const registerPatient = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    middleName: v.optional(v.string()),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("Male"), v.literal("Female"), v.literal("Other")),
    phoneNumber: v.string(),
    houseNo: v.optional(v.string()),
    gramPanchayat: v.optional(v.string()),
    village: v.optional(v.string()),
    tehsil: v.optional(v.string()),
    district: v.optional(v.string()),
    state: v.optional(v.string()),
    systolic: v.optional(v.string()),
    diastolic: v.optional(v.string()),
    heartRate: v.optional(v.string()),
    temperature: v.optional(v.string()),
    oxygenSaturation: v.optional(v.string()),
    doctorId:v.optional(v.string()), // New field to store the ID of the doctor who registered the patient
    allergies: v.optional(v.string()),
    chronicConditions: v.optional(v.string()),
    pastSurgeries: v.optional(v.string()),
    familyHistory: v.optional(v.string()),
    hospitalId: v.optional(v.string()),
    petName: v.optional(v.string()),
    petBreed: v.optional(v.string()),
    petSpecies: v.optional(v.string()),
    petAge: v.optional(v.number()),
    petGender: v.optional(v.union(v.literal("Male"), v.literal("Female"), v.literal("Other"))),
    petDob: v.optional(v.string()),
    petMicrochipNo: v.optional(v.string()),
  },
  async handler(ctx, args) {
    // Generate a unique ID for the patient
    const patientId = Date.now();

    // Check if a patient with the given phone number already exists
    const existingPatient = await ctx.db
      .query("patients")
      .withIndex("by_phoneNumber", (q) => q.eq("phoneNumber", args.phoneNumber))
      .unique();

    if (existingPatient) {
      throw new Error("A patient with this phone number already exists.");
    }

    // Insert new patient record into the database
    await ctx.db.insert("patients", {
      patientId,
      ...args,
    });

    return { success: true, patientId };
  },
  
});

export const getPatientsByDoctor = query({
  args: { doctorId: v.string() },
  handler: async (ctx, args) => {
    // Query the patients by the doctorId
    const patients = await ctx.db
      .query("patients") // Assuming your collection is called "patients"
      .filter((q) => q.eq(q.field("doctorId"), args.doctorId)) // Filter based on doctorId
      .collect();
    return patients;
  },
});


export const getTodaysAppointmentsByDoctor = query({
  args: { doctorId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString(); // Start of today as ISO string
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString(); // End of today as ISO string

    const appointments = await ctx.db
      .query("appointments")
      .filter((q) =>
        q.and(
          q.eq(q.field("doctorId"), args.doctorId),
          q.gte(q.field("appointmentDate"), startOfDay),
          q.lte(q.field("appointmentDate"), endOfDay)
        )
      )
      .collect();

    return appointments;
  },
});



export const updateAppointmentStatus = mutation({
  args: {
    appointmentId: v.string(),
    status: v.union(
      v.literal("Scheduled"),
      v.literal("waitlist"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("attending")
    ),
  },
  handler: async (ctx, args) => {
    const { appointmentId, status } = args;

    // Check if the appointment exists
    const existingAppointment = await ctx.db
      .query("appointments")
      .filter((q) => q.eq(q.field("_id"), appointmentId))
      .first();

    if (!existingAppointment) {
      throw new Error(`Appointment with ID ${appointmentId} not found`);
    }

    // Update the appointment status
    const updatedAppointment = await ctx.db.patch(existingAppointment._id, {
      status: status,
      updatedAt: new Date().toISOString(),
    });

    return updatedAppointment;
  },
});

export const getPatientById = query({
  args: {
    patientId: v.number(),
    userId: v.string(),
    hospitalId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const patient = await ctx.db
        .query("patients")
        .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
        .filter((q) => 
          q.and(
            q.eq(q.field("doctorId"), args.userId),
            q.eq(q.field("hospitalId"), args.hospitalId)
          )
        )
        .unique();

      if (!patient) {
        return { error: "Patient not found" };
      }

      return {
        id: patient._id,
        patientId: patient.patientId,
        email: patient.email,
        firstName: patient.firstName,
        middleName: patient.middleName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phoneNumber: patient.phoneNumber,
        houseNo: patient.houseNo,
        gramPanchayat: patient.gramPanchayat,
        village: patient.village,
        tehsil: patient.tehsil,
        district: patient.district,
        state: patient.state,
        systolic: patient.systolic,
        diastolic: patient.diastolic,
        heartRate: patient.heartRate,
        temperature: patient.temperature,
        oxygenSaturation: patient.oxygenSaturation,
      };
    } catch (error) {
      console.error("Error fetching patient:", error);
      return { error: "An error occurred while fetching the patient data." };
    }
  },
});

export const getPatientByName = query({
  args: {
    firstName: v.string(),
    userId: v.string(),
    hospitalId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const patients = await ctx.db
        .query("patients")
        .filter((q) => 
          q.and(
            q.eq(q.field("doctorId"), args.userId),
            q.eq(q.field("hospitalId"), args.hospitalId),
            q.eq(q.field("firstName"), args.firstName)
          )
        )
        .collect();

      return patients.map((patient) => ({
        id: patient._id,
        patientId: patient.patientId,
        firstName: patient.firstName,
        middleName: patient.middleName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phoneNumber: patient.phoneNumber,
        houseNo: patient.houseNo,
        gramPanchayat: patient.gramPanchayat,
        village: patient.village,
        tehsil: patient.tehsil,
        district: patient.district,
        state: patient.state,
        systolic: patient.systolic,
        diastolic: patient.diastolic,
        heartRate: patient.heartRate,
        temperature: patient.temperature,
        oxygenSaturation: patient.oxygenSaturation,
      }));
    } catch (error) {
      console.error("Error fetching patient by name:", error);
      return { error: "An error occurred while fetching patient data by name." };
    }
  },
});

export const getPatientByPhone = query({
  args: {
    phoneNumber: v.string(),
    userId: v.string(),
    hospitalId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const patient = await ctx.db
        .query("patients")
        .withIndex("by_phoneNumber", (q) => q.eq("phoneNumber", args.phoneNumber))
        .filter((q) => 
          q.and(
            q.eq(q.field("doctorId"), args.userId),
            q.eq(q.field("hospitalId"), args.hospitalId)
          )
        )
        .unique();

      if (!patient) {
        return { error: "Patient not found." };
      }

      return {
        id: patient._id,
        patientId: patient.patientId,
        firstName: patient.firstName,
        middleName: patient.middleName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phoneNumber: patient.phoneNumber,
        houseNo: patient.houseNo,
        gramPanchayat: patient.gramPanchayat,
        village: patient.village,
        tehsil: patient.tehsil,
        district: patient.district,
        state: patient.state,
        systolic: patient.systolic,
        diastolic: patient.diastolic,
        heartRate: patient.heartRate,
        temperature: patient.temperature,
        oxygenSaturation: patient.oxygenSaturation,
      };
    } catch (error) {
      console.error("Error fetching patient by phone number:", error);
      return { error: "An error occurred while fetching the patient data by phone number." };
    }
  },
});
export const getAllPatients = query(async (ctx) => {
  return await ctx.db.query('patients').collect()
})
export const getAllPatientsinfo = query({
  handler: async (ctx) => {
    const patients = await ctx.db.query("patients").collect()
    return patients.map(patient => ({
      ...patient,
      patientId: patient._id.toString(),
    }))
  },
})

export const getPatientPhone = query({
  args: { patientId: v.string() },
  handler: async (ctx, { patientId }) => {
    const patient = await ctx.db
      .query('patients')
      .filter((q) => q.eq(q.field('patientId'), Number(patientId))) // Convert to number here
      .first();

    return patient?.phoneNumber;
  },
});
export const checkDuplicates = query({
  args: { email: v.string(), phoneNumber: v.string() },
  handler: async (ctx, args) => {
    const emailMatches = await ctx.db
      .query("patients")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    const phoneMatches = await ctx.db
      .query("patients")
      .filter((q) => q.eq(q.field("phoneNumber"), args.phoneNumber))
      .collect();

    return {
      emailExists: emailMatches.length > 0,
      phoneExists: phoneMatches.length > 0,
    };
  },
});

export const getPatientRetentionData = query({
  args: { doctorId: v.string() },
  handler: async (ctx, args) => {
    const { doctorId } = args
    const allPatients = await ctx.db
      .query("patients")
      .filter((q) => q.eq(q.field("doctorId"), doctorId))
      .collect()

    const totalPatients = allPatients.length
    const returningPatients = allPatients.filter(patient => patient.patientId > 1).length
    const newPatients = totalPatients - returningPatients

    return [
      { name: "New", value: (newPatients / totalPatients) * 100 },
      { name: "Returning", value: (returningPatients / totalPatients) * 100 },
    ]
  },
})


export const getAllPatientsByUserAndHospital = query({
  args: { userId: v.string(), hospitalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patients")
      .filter((q) => 
        q.and(
          q.eq(q.field("doctorId"), args.userId), 
          q.eq(q.field("hospitalId"), args.hospitalId)
        )
      )
      .collect();
  },
});

export const updatePatient = mutation({
  args: {
    id: v.id("patients"),
    firstName: v.string(),
    middleName: v.optional(v.string()),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("Male"), v.literal("Female"), v.literal("Other")),
    phoneNumber: v.string(),
    houseNo: v.optional(v.string()),
    gramPanchayat: v.optional(v.string()),
    village: v.optional(v.string()),
    tehsil: v.optional(v.string()),
    district: v.optional(v.string()),
    state: v.optional(v.string()),
    systolic: v.optional(v.string()),
    diastolic: v.optional(v.string()),
    heartRate: v.optional(v.string()),
    temperature: v.optional(v.string()),
    oxygenSaturation: v.optional(v.string()),
    allergies: v.optional(v.string()),
    chronicConditions: v.optional(v.string()),
    pastSurgeries: v.optional(v.string()),
    familyHistory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    await ctx.db.patch(id, updateData);
    return { success: true };
  },
});
export const getPatientDetails = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }
    return patient;
  },
});







export const getPatientId = query({
  args: {
    patientId: v.number(),
  },
  handler: async (ctx, { patientId }) => {
    try {
      const patient = await ctx.db
        .query("patients")
        .withIndex("by_patient_id", (q) => q.eq("patientId", patientId))
        .unique();

      if (!patient) {
        return { error: " " };  // Return a custom error object
      }

    return {
      id: patient._id,
      email: patient.email,
      firstName: patient.firstName,
      middleName: patient.middleName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      phoneNumber: patient.phoneNumber,
      houseNo: patient.houseNo,
      gramPanchayat: patient.gramPanchayat,
      village: patient.village,
      tehsil: patient.tehsil,
      district: patient.district,
      state: patient.state,
      systolic: patient.systolic,
      diastolic: patient.diastolic,
      heartRate: patient.heartRate,
      temperature: patient.temperature,
      oxygenSaturation: patient.oxygenSaturation,
      allergies:  patient.allergies,
      chronicConditions:  patient.chronicConditions,
      pastSurgeries:  patient.pastSurgeries,
      familyHistory: patient.familyHistory,
    };
  } catch (error) {
    console.error("Error fetching patient:", error);
    return { error: "An error occurred while fetching the patient data." };  // Generic error response
  }
  },
});




export const getAllPatientsByhospitalid = query({
  args: { hospitalId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.hospitalId) return [];

    const patients = await ctx.db
      .query("patients")
      .filter((q) => q.eq(q.field("hospitalId"), args.hospitalId))
      .collect();

    // Return all fields for each patient
    return patients;
  },
});


