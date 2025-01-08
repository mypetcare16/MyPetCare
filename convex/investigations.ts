import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addInvestigation = mutation({
  args: { name: v.string(), category: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("investigations", {
      name: args.name,
      category: args.category,
      userId: args.userId,
    });
  },
});

export const listInvestigations = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("investigations")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});
