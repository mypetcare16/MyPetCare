import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const searchPatients = query({
  args: { 
    searchTerm: v.string(),
    doctorId: v.string()
  },
  handler: async (ctx, args) => {
    const searchTerm = args.searchTerm.toLowerCase();  // Normalizing for case-insensitive search
    const patients = await ctx.db.query('patients')
      .filter((q) => q.eq(q.field("doctorId"), args.doctorId))
      .collect();

    console.log('Patients Found:', patients);  // Log the patients retrieved
    return patients;
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const symptoms = await ctx.db
      .query('patients')
      
      .collect()
    return symptoms
  },
})

