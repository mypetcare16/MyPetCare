import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addContact = mutation({
  args: {
    phoneNumber: v.string(),
    name: v.string(),
    scheduledDate: v.string(),
    scheduledTime: v.string(),
  },
  handler: async (ctx, args) => {
    const contactId = await ctx.db.insert("contacts", args);
    return contactId;
  },
});

export const getContacts = query({
  handler: async (ctx) => {
    return await ctx.db.query("contacts").collect();
  },
});