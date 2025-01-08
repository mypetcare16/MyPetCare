import { v } from "convex/values";
import { mutation,query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("General"), v.literal("Specialized"), v.literal("Clinic")),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    phoneNumber: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    capacity: v.optional(v.number()),
    emergencyServices: v.boolean(),
    specialties: v.array(v.string()),
    accreditation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const hospitalId = await ctx.db.insert("hospitals", {
      ...args,
      hospitalId: Math.random().toString(36).substr(2, 9), // Generate a unique ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      specialties: args.specialties || [], // Ensure specialties is always an array
    });
    return hospitalId;
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("hospitals").collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("hospitals"),
    name: v.string(),
    type: v.union(v.literal("General"), v.literal("Specialized"), v.literal("Clinic")),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    phoneNumber: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    capacity: v.optional(v.number()),
    emergencyServices: v.boolean(),
    specialties: v.array(v.string()),
    accreditation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("hospitals") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});



export const createUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(v.literal("Doctor"), v.literal("Patient"), v.literal("Desk"), v.literal("Admin")),
    specialization: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    phone: v.optional(v.string()),
    hospitalId: v.string(), // Change this to v.string()
  },
  async handler(ctx, args) {
    const { userId, email, firstName, lastName, role, specialization, licenseNumber, phone, hospitalId } = args;
    
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const newUser = await ctx.db.insert("users", {
      userId,
      email,
      firstName,
      lastName,
      role,
      specialization,
      licenseNumber,
      phone,
      hospitalId,
    });

    return newUser;
  },
});


export const checkUserEmail = query({
  args: { email: v.string() },
  async handler(ctx, { email }) {
    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    
    // Return true if user exists, otherwise false
    return userRecord !== null;
  },
});


export const listHospitals = query({
  handler: async (ctx) => {
    const hospitals = await ctx.db.query("hospitals").collect();
    return hospitals.map(hospital => ({
      id: hospital._id,
      name: hospital.name,
      hospitalId: hospital.hospitalId // Include the hospitalId field
    }));
  },
});