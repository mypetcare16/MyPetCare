import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const createBill = mutation({
  args: {
    userId: v.string(),
    patientId: v.string(),
    items: v.array(v.object({
      name: v.string(),
      cost: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const { userId, patientId, items } = args;
    const total = items.reduce((sum, item) => sum + item.cost, 0);

    // Get the count of existing bills to generate a bill number
    const bills = await ctx.db.query("bills").collect();
    const billNumber = `BILL${(bills.length + 1).toString().padStart(7, "0")}`;

    const billId = await ctx.db.insert("bills", {
      userId,
      patientId,
      billNumber,
      date: new Date().toISOString(),
      items,
      total,
    });

    return billId;
  },
});

export const getBillsForPatient = query({
  args: { patientId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bills")
      .filter((q) => q.eq(q.field("patientId"), args.patientId))
      .order("desc")
      .collect();
  },
});

export const getBillById = query({
  args: { billId: v.id("bills") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.billId);
  },
});

export const updateBillPdf = mutation({
  args: { 
    billId: v.id("bills"),
    pdfStorageId: v.string(),
  },
  handler: async (ctx, args) => {
    const { billId, pdfStorageId } = args;
    await ctx.db.patch(billId, { pdfStorageId });
    return true;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    const { storageId } = args;
    return await ctx.storage.getUrl(storageId);
  },
});

