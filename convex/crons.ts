import { cronJobs } from "convex/server";
import { mutation, query, action, internalQuery, internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
const cron = cronJobs();

// Bolna API configuration
const BOLNA_API_KEY = "bn-c6ad696548d646409cca9664e7bfafb2";
const BOLNA_API_URL = "https://api.bolna.dev/call";
const AGENT_ID = "d41f4c32-478e-406c-afad-fc3e412b5af9";

// Define types for our data models
type Contact = {
  _id: Id<"contacts">;
  phoneNumber: string;
  scheduledTime: string;
};

type ScheduledCall = {
  _id: Id<"scheduledCalls">;
  contactId: Id<"contacts">;
  status: string;
  scheduledAt: string;
  callId?: string;
};

// Query to get a single contact
export const getContact = internalQuery({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args): Promise<Contact | null> => {
    return await ctx.db.get(args.contactId);
  },
});

// Query to get all contacts
export const getAllContacts = query({
  handler: async (ctx): Promise<Contact[]> => {
    return await ctx.db.query("contacts").collect();
  },
});

// Query to get a single scheduled call
export const getScheduledCall = internalQuery({
  args: { scheduledCallId: v.id("scheduledCalls") },
  handler: async (ctx, args): Promise<ScheduledCall | null> => {
    return await ctx.db.get(args.scheduledCallId);
  },
});

// Mutation to schedule a call
export const scheduleCall = internalMutation({
  args: {
    contactId: v.id("contacts"),
    scheduledAt: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"scheduledCalls">> => {
    const scheduledCallId = await ctx.db.insert("scheduledCalls", {
      contactId: args.contactId,
      status: "scheduled",
      scheduledAt: args.scheduledAt,
    });

    // Schedule the call processing
    const scheduledAt = new Date(args.scheduledAt);
    const now = new Date();
    const delay = Math.max(0, scheduledAt.getTime() - now.getTime());

    await ctx.scheduler.runAfter(delay, internal.crons.processScheduledCall, {
      scheduledCallId,
    });

    return scheduledCallId;
  },
});

// Mutation to update call status
export const updateCallStatus = internalMutation({
  args: {
    scheduledCallId: v.id("scheduledCalls"),
    status: v.string(),
    callId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.scheduledCallId, {
      status: args.status,
      callId: args.callId,
    });
  },
});

// Action to process a scheduled call
export const processScheduledCall = internalAction({
  args: { scheduledCallId: v.id("scheduledCalls") },
  handler: async (ctx, args): Promise<void> => {
    const scheduledCall = await ctx.runQuery(internal.crons.getScheduledCall, {
      scheduledCallId: args.scheduledCallId,
    });

    if (!scheduledCall) {
      console.error("Scheduled call not found");
      return;
    }

    const contact = await ctx.runQuery(internal.crons.getContact, {
      contactId: scheduledCall.contactId,
    });

    if (!contact) {
      console.error("Contact not found");
      return;
    }

    // Initiate the call using Bolna API
    const callResult = await initiateCall(contact.phoneNumber);

    // Update the scheduled call status
    await ctx.runMutation(internal.crons.updateCallStatus, {
      scheduledCallId: args.scheduledCallId,
      status: callResult.status,
      callId: callResult.call_id,
    });
  },
});

// Helper function to initiate a call using the Bolna API
async function initiateCall(recipientPhoneNumber: string): Promise<{ status: string; call_id?: string; error?: string }> {
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

// Cron job to schedule calls for the next day
export const scheduleDailyCalls = internalMutation({
  handler: async (ctx): Promise<void> => {
    const contacts = await ctx.db.query("contacts").collect();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    for (const contact of contacts) {
      const scheduledAt = new Date(tomorrow);
      const [hours, minutes] = contact.scheduledTime.split(":").map(Number);
      scheduledAt.setHours(hours, minutes, 0, 0);

      await ctx.runMutation(internal.crons.scheduleCall, {
        contactId: contact._id,
        scheduledAt: scheduledAt.toISOString(),
      });
    }
  },
});

// Function to schedule a call immediately
export const scheduleCallNow = internalMutation({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args): Promise<Id<"scheduledCalls">> => {
    const contact = await ctx.db.get(args.contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }

    const now = new Date();
    const scheduledCallId = await ctx.db.insert("scheduledCalls", {
      contactId: args.contactId,
      status: "scheduled",
      scheduledAt: now.toISOString(),
    });

    // Process the scheduled call immediately
    await ctx.scheduler.runAfter(0, internal.crons.processScheduledCall, {
      scheduledCallId,
    });

    return scheduledCallId;
  },
});

// New cron job to schedule immediate calls
export const scheduleImmediateCalls = internalMutation({
  handler: async (ctx): Promise<void> => {
    const contacts = await ctx.db.query("contacts").collect();

    for (const contact of contacts) {
      await ctx.runMutation(internal.crons.scheduleCallNow, {
        contactId: contact._id,
      });
    }
  },
});

// Set up the cron jobs
const scheduler = cronJobs();

// Daily job to schedule calls for the next day
scheduler.daily(
  "Schedule calls for the next day",
  { hourUTC: 10, minuteUTC: 38 },
  internal.crons.scheduleDailyCalls
);

// Job to schedule immediate calls (runs every 5 minutes)
//  scheduler.interval(
//   "Schedule immediate calls",
//   { seconds: 60 }, // 5 minutes
//   internal.crons.scheduleImmediateCalls
//  );

export default scheduler;