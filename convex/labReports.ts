import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Generate upload URL for files
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Add new lab report
export const add = mutation({
  args: {
    patientId: v.optional(v.string()),
    date: v.string(),
    notes: v.string(),
    storageId: v.string(),
    fileType: v.union(v.literal("pdf"), v.literal("image")),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const newId = await ctx.db.insert("labReports", {
      ...args,
      createdAt: Date.now(),
    });
    return newId;
  },
});

// List all lab reports
export const list = query({
  handler: async (ctx) => {
    const reports = await ctx.db
      .query("labReports")
      .order("desc")
      .collect();
    
    // Generate URLs for each report
    return Promise.all(
      reports.map(async (report) => ({
        ...report,
        fileUrl: await ctx.storage.getUrl(report.storageId),
      }))
    );
  },
});

// Get a specific lab report by ID
export const getById = query({
  args: { id: v.id("labReports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.id);
    if (!report) throw new ConvexError("Lab report not found");
    
    // Generate URL for the report
    const fileUrl = await ctx.storage.getUrl(report.storageId);
    return { ...report, fileUrl };
  },
});