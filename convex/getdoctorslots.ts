import { v } from "convex/values";
import { httpAction, query } from "./_generated/server";
import { defineTable } from "convex/server";
import { internal } from "./_generated/api";




export const getDoctorSlots = httpAction(async ({ runQuery }, request) => {
  // Parse the doctor ID and date from the URL
  const url = new URL(request.url);
  const doctorId = url.searchParams.get("doctorId");
  const date = url.searchParams.get("date");

  // Validate the doctorId and date
  if (!doctorId || !date) {
    return new Response("Doctor ID and date are required", { status: 400 });
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return new Response("Invalid date format. Use YYYY-MM-DD", { status: 400 });
  }

  try {
    // Query the available slots
    const availableSlots = ['']//await runQuery(internal.messages.getAvailableSlots, { doctorId, date });

    // If no slots are found, return an empty array
    if (!availableSlots || availableSlots.length === 0) {
      return Response.json([]);
    }

    // Return the available slots as a JSON response
    return Response.json(availableSlots);
  } catch (error) {
    console.error("Error fetching doctor slots:", error);
    return new Response("Failed to fetch doctor slots", { status: 500 });
  }
});