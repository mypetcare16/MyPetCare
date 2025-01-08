import { internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createMessage = internalMutation({
  args: {
    phoneNumber: v.string(),
    content: v.string(),
    direction: v.string(),
    timestamp: v.string(),
    messageId: v.string(),
    conversationId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", args);
  },
});

export const getConversationMessages = internalQuery({
  args: { 
    conversationId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("conversationId"), args.conversationId))
      .order("asc");

    
    return await query.collect();
  },
});

export const getConversations = internalQuery({
  handler: async (ctx) => {
    return await ctx.db
      .query("messages")
      .collect();
  },
});