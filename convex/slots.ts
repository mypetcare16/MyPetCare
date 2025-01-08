import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper function to convert IST to UTC
function istToUtc(date: string, time: string): number {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const istDate = new Date(year, month - 1, day, hours, minutes);
  return istDate.getTime() - (5.5 * 60 * 60 * 1000); // Subtract 5 hours and 30 minutes
}

// Helper function to convert UTC to IST string
function utcToIstString(utcTimestamp: number): string {
  const istDate = new Date(utcTimestamp + (5.5 * 60 * 60 * 1000));
  return istDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

export const createSlot = mutation({
  args: {
    doctorId: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const startTime = istToUtc(args.date, args.startTime);
    const endTime = istToUtc(args.date, args.endTime);

    const slotId = await ctx.db.insert("slots", {
      doctorId: args.doctorId,
      startTime,
      endTime,
      isBooked: false,
    });
    return slotId;
  },
});

export const createBulkSlots = mutation({
  args: {
    doctorId: v.string(),
    startDate: v.string(), // Format: "YYYY-MM-DD"
    endDate: v.string(), // Format: "YYYY-MM-DD"
    dailyStartTime: v.string(), // Format: "HH:mm"
    dailyEndTime: v.string(), // Format: "HH:mm"
    slotDuration: v.number(), // Duration in minutes
    breakStartTime: v.optional(v.string()), // Format: "HH:mm"
    breakEndTime: v.optional(v.string()), // Format: "HH:mm"
    includeWeekends: v.boolean(),
  },
  handler: async (ctx, args) => {
    const slotIds = [];

    const startDate = new Date(args.startDate);
    const endDate = new Date(args.endDate);

    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
      // Skip weekends if not included
      if (!args.includeWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
        continue;
      }

      const dateString = date.toISOString().split('T')[0];
      const [startHour, startMinute] = args.dailyStartTime.split(':').map(Number);
      const [endHour, endMinute] = args.dailyEndTime.split(':').map(Number);

      let currentTime = new Date(date);
      currentTime.setHours(startHour, startMinute, 0, 0);
      const dailyEndTime = new Date(date);
      dailyEndTime.setHours(endHour, endMinute, 0, 0);

      let breakStartTime, breakEndTime;
      if (args.breakStartTime && args.breakEndTime) {
        const [breakStartHour, breakStartMinute] = args.breakStartTime.split(':').map(Number);
        const [breakEndHour, breakEndMinute] = args.breakEndTime.split(':').map(Number);
        breakStartTime = new Date(date);
        breakStartTime.setHours(breakStartHour, breakStartMinute, 0, 0);
        breakEndTime = new Date(date);
        breakEndTime.setHours(breakEndHour, breakEndMinute, 0, 0);
      }

      while (currentTime < dailyEndTime) {
        // Skip break time
        if (breakStartTime && breakEndTime && currentTime >= breakStartTime && currentTime < breakEndTime) {
          currentTime = new Date(breakEndTime);
          continue;
        }

        const startTime = istToUtc(dateString, currentTime.toTimeString().slice(0, 5));
        const endTime = startTime + args.slotDuration * 60 * 1000;

        // Ensure the slot doesn't extend past the daily end time
        if (endTime <= istToUtc(dateString, dailyEndTime.toTimeString().slice(0, 5))) {
          const slot = {
            doctorId: args.doctorId,
            startTime,
            endTime,
            isBooked: false
          };

          const slotId = await ctx.db.insert("slots", slot);
          slotIds.push(slotId);
        }

        currentTime.setTime(currentTime.getTime() + args.slotDuration * 60 * 1000);
      }
    }

    return slotIds;
  },
});

export const getAvailableSlots = query({
  args: {
    doctorId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const startOfDay = new Date(args.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(args.date);
    endOfDay.setHours(23, 59, 59, 999);

    const slots = await ctx.db
      .query("slots")
      .filter((q) => q.eq(q.field("doctorId"), args.doctorId))
      .filter((q) => q.gte(q.field("startTime"), startOfDay.getTime()))
      .filter((q) => q.lte(q.field("endTime"), endOfDay.getTime()))
      .filter((q) => q.eq(q.field("isBooked"), false))
      .collect();

    return slots.map((slot) => ({
      id: slot._id,
      startTime: convertToIST(slot.startTime),
      endTime: convertToIST(slot.endTime),
    }));
  },
});

function convertToIST(utcTimestamp: number): string {
  const date = new Date(utcTimestamp);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleString('en-IN', options);
}

export const updateSlotStatus = mutation({
  args: {
    slotId: v.id("slots"),
    isBooked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { slotId, isBooked } = args;

    // Fetch the current slot to ensure it exists
    const existingSlot = await ctx.db.get(slotId);
    if (!existingSlot) {
      throw new Error("Slot not found");
    }

    // Update the slot's isBooked status
    await ctx.db.patch(slotId, { isBooked });

    // Return the updated slot
    return await ctx.db.get(slotId);
  },
});