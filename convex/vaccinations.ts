import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addVaccinations = mutation({
  args: {
    patientId: v.string(),
    userId: v.string(),
    vaccinations: v.array(
      v.object({
        vaccineName: v.string(),
        status: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { patientId, userId, vaccinations } = args;
    
    for (const vaccination of vaccinations) {
      const { vaccineName, status } = vaccination;
      
      // Check if a record already exists
      const existingRecord = await ctx.db
        .query("vaccinations")
        .withIndex("by_patient_and_user", (q) => 
          q.eq("patientId", patientId).eq("userId", userId)
        )
        .filter((q) => q.eq("vaccineName", vaccineName))
        .first();

      if (existingRecord) {
        // Update existing record
        await ctx.db.patch(existingRecord._id, { status });
      } else {
        // Insert new record
        await ctx.db.insert("vaccinations", { patientId, userId, vaccineName, status });
      }
    }
  },
});

export const getVaccinations = query({
  args: { patientId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const { patientId, userId } = args;
    return await ctx.db
      .query("vaccinations")
      .withIndex("by_patient_and_user", (q) => 
        q.eq("patientId", patientId).eq("userId", userId)
      )
      .collect();
  },
});

