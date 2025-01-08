import {
  internalMutation,
  internalQuery,
  mutation,
  MutationCtx,
  query,
  QueryCtx,
} from "./_generated/server";

import { ConvexError, v } from "convex/values";
import { Doc } from "./_generated/dataModel";

/** Get user by Clerk use id (AKA "subject" on auth)  */
export const getUser = internalQuery({
  args: { subject: v.string() },
  async handler(ctx, args) {
    return await userQuery(ctx, args.subject);
  },
});

/** Create a new Clerk user or update existing Clerk user data. */
export const createUser = internalMutation({
  args: {
    userId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
  },
  async handler(ctx, { userId, email, firstName, lastName, profileImageUrl }) {
    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (userRecord === null) {
      await ctx.db.insert("users", {
        userId,
        email,
        firstName,
        lastName,
        profileImageUrl,
      });
    }
  },
});

export const updateUserRole = mutation({
  args: {
    role: v.optional(v.union(v.literal("Doctor"), v.literal("Patient"),v.literal("Desk"), v.literal("Admin"))),
  },
  async handler(ctx, { role }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not Authenticated to perform role updation");
    }

    const userRecord = await userQuery(ctx, identity.subject);
    if (userRecord != null) {
      if (!userRecord.role) {
        await ctx.db.patch(userRecord._id, { role });
      }
    } else {
      console.log("user Not found while updating role");
    }
  },
});

export const updateDisplayName = mutation({
  args: { firstName: v.string(), lastName: v.string() },
  async handler(ctx, { firstName, lastName }) {
    if (!firstName) throw new ConvexError("First Name is mandatory!");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not Authrized to update display name");
    }

    const userRecord = await userQuery(ctx, identity.subject);

    if (!userRecord) throw new ConvexError("No User found to update display name");
    console.log({ firstName, lastName });
    await ctx.db.patch(userRecord?._id, { firstName, lastName });
  },
});

// Helpers
export async function userQuery(ctx: QueryCtx, clerkUserId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("userId", clerkUserId))
    .unique();
}

/** The current user, containing user preferences and Clerk user info. */
export const currentUser = query((ctx: QueryCtx) => getCurrentUser(ctx));

async function getCurrentUser(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userQuery(ctx, identity.subject);
}

export const checkUserEmail = query({
  args: { email: v.string() },
  async handler(ctx, { email }) {
    // Query the "users" table to check if the email exists
    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
      
    // Return true if a user is found, otherwise false
    return userRecord;
  },
});
export const getDoctors = query(async (ctx) => {
  return await ctx.db.query('users').collect()
})

export const getDoctorsByHospitalId = query({
  args: { hospitalId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.hospitalId) return [];

    return await ctx.db
      .query("users")
      .filter((q) => 
        q.and(
          q.eq(q.field("hospitalId"), args.hospitalId),
          q.eq(q.field("role"), "Doctor")
        )
      )
      .collect();
  },
});





export const getUserDetails = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      profileImageUrl: user.profileImageUrl ?? undefined,
      role: user.role ?? undefined,
      phone: user.phone ?? undefined,
      specialization: user.specialization ?? undefined,
      licenseNumber: user.licenseNumber ?? undefined,
      yearsOfPractice: user.yearsOfPractice ?? undefined,
      practiceType: user.practiceType ?? undefined,
      bio: user.bio ?? undefined,
      clinicName: user.clinicName ?? undefined,
      logo: user.logo ?? undefined,
      address: user.address ?? undefined,
      city: user.city ?? undefined,
      state: user.state ?? undefined,
      zipCode: user.zipCode ?? undefined,
      website: user.website ?? undefined,
      signatureStorageId: user.signatureStorageId ?? undefined,

    };
  },
});


// export const getCurrentUsers = query({
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       throw new ConvexError("Not authenticated");
//     }
//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("userId", identity.subject))
//       .unique();
//     if (!user) {
//       throw new ConvexError("User not found");
//     }
//     return user;
//   },
// });

export const updateUser = mutation({
  args: {
    userId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    specialization: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    yearsOfPractice: v.optional(v.number()),
    practiceType: v.optional(v.union(v.literal("Private"), v.literal("Hospital"), v.literal("Clinic"))),
    bio: v.optional(v.string()),
    clinicName: v.optional(v.string()),
    logo: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    website: v.optional(v.string()),
    // New fields
    stateRegistrationNumber: v.optional(v.string()),
    nmcRegistrationId: v.optional(v.string()),
    licenseExpiryDate: v.optional(v.string()),
    certificateStorageId: v.optional(v.string()),
    signatureStorageId: v.optional(v.string()),
    hospitalId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    const { userId, ...updateData } = args;
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("userId", userId))
      .unique();

    if (!existingUser) {
      throw new ConvexError("User not found");
    }

    // Ensure the authenticated user is updating their own profile
    if (existingUser.userId !== identity.subject) {
      throw new ConvexError("Not authorized to update this profile");
    }

    // Remove any fields that are undefined
    const cleanedUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(existingUser._id, cleanedUpdateData);
    return "User updated successfully";
  },
});



export const getAllDoctors = query({
  handler: async (ctx) => {
    const doctors = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "Doctor"))
      .collect();

    return doctors.map(doctor => ({
      userId: doctor.userId,
      email: doctor.email,
      firstName: doctor.firstName ?? undefined,
      lastName: doctor.lastName ?? undefined,
      profileImageUrl: doctor.profileImageUrl ?? undefined,
      role: doctor.role,
      phone: doctor.phone ?? undefined,
      specialization: doctor.specialization ?? undefined,
      licenseNumber: doctor.licenseNumber ?? undefined,
      yearsOfPractice: doctor.yearsOfPractice ?? undefined,
      practiceType: doctor.practiceType ?? undefined,
      bio: doctor.bio ?? undefined,
      clinicName: doctor.clinicName ?? undefined,
      logo: doctor.logo ?? undefined,
      address: doctor.address ?? undefined,
      city: doctor.city ?? undefined,
      state: doctor.state ?? undefined,
      zipCode: doctor.zipCode ?? undefined,
      website: doctor.website ?? undefined,
      signatureStorageId: doctor.signatureStorageId ?? undefined,
    }));
  },
});

export const getHospitalIdByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    return user?.hospitalId;
  },
});