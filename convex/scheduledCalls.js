import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const scheduleCall = mutation({
  args: {
    contactId: v.id("contacts"),
    scheduledAt: v.string(),
  },
  handler: async (ctx, args) => {
    const scheduledCallId = await ctx.db.insert("scheduledCalls", {
      contactId: args.contactId,
      status: "scheduled",
      scheduledAt: args.scheduledAt,
    });

    // Schedule the call
    await ctx.scheduler.runAfter(0, api.scheduledCalls.processScheduledCall, {
      scheduledCallId,
    });

    return scheduledCallId;
  },
});

export const processScheduledCall = action({
  args: { scheduledCallId: v.id("scheduledCalls") },
  handler: async (ctx, args) => {
    const scheduledCall = await ctx.runQuery(api.scheduledCalls.getScheduledCall, {
      scheduledCallId: args.scheduledCallId,
    });

    if (!scheduledCall) {
      console.error("Scheduled call not found");
      return;
    }

    const contact = await ctx.runQuery(api.contacts.getContact, {
      contactId: scheduledCall.contactId,
    });

    if (!contact) {
      console.error("Contact not found");
      return;
    }

    // Initiate the call using Bolna API
    const callResult = await initiateCall(contact.phoneNumber);

    // Update the scheduled call status
    await ctx.runMutation(api.scheduledCalls.updateCallStatus, {
      scheduledCallId: args.scheduledCallId,
      status: callResult.status,
      callId: callResult.call_id,
    });
  },
});

export const getScheduledCall = query({
  args: { scheduledCallId: v.id("scheduledCalls") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.scheduledCallId);
  },
});

export const updateCallStatus = mutation({
  args: {
    scheduledCallId: v.id("scheduledCalls"),
    status: v.string(),
    callId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.scheduledCallId, {
      status: args.status,
      callId: args.callId,
    });
  },
});

// Helper function to initiate a call using the Bolna API
async function initiateCall(recipientPhoneNumber) {
  const BOLNA_API_KEY = "bn-c6ad696548d646409cca9664e7bfafb2";
  const BOLNA_API_URL = "https://api.bolna.dev/call";
  const AGENT_ID = "d41f4c32-478e-406c-afad-fc3e412b5af9";

  const headers = {
    Authorization: `Bearer ${BOLNA_API_KEY}`,
    "Content-Type": "application/json",
  };

  const payload = {
    agent_id: AGENT_ID,
    recipient_phone_number: recipientPhoneNumber,
    user_data: { variable2: "Jagadeesh", variable1: "Sunil" },
  };

  try {
    const response = await fetch(BOLNA_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to initiate call for ${recipientPhoneNumber}: ${error}`);
    return { status: "Failed", error: String(error) };
  }
}