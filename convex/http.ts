import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { handleWatiWebhook } from "./watiWebhook";
import { handleWatiWebhook1 } from "./watsappapi";

// Ensure all environment variables are set
const WATI_API_URL = process.env.WATI_API_URL!;
const WATI_API_TOKEN = process.env.WATI_API_TOKEN!;
const WATI_MEDIA_URL = process.env.WATI_MEDIA_URL!;
const WEBSITE_LINK = process.env.WEBSITE_LINK!;
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

if (!WATI_API_URL || !WATI_API_TOKEN || !WATI_MEDIA_URL || !WEBSITE_LINK || !CLERK_WEBHOOK_SECRET) {
  throw new Error("Missing required environment variables");
}

export const ensureEnvironmentVariable = (name: string): string => {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`missing environment variable ${name}`);
  }
  return value;
}



// Clerk webhook handler
const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await validateClerkRequest(request);
  if (!event) {
    return new Response("Error occurred", {
      status: 400,
    });
  }
  switch (event.type) {
    case "user.created": {
      console.log(event)
      await ctx.runMutation(internal.users.createUser, {
        userId: event.data.id,
        email: event.data.email_addresses[0]?.email_address,
        firstName: event.data?.first_name ?? "",
        lastName: event.data?.last_name ?? "",
        profileImageUrl: event.data?.has_image ? event.data?.image_url : undefined
      });
      break;
    }
    default: {
      console.log("ignored Clerk webhook event", event.type);
    }
  }
  return new Response(null, {
    status: 200,
  });
});



const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

http.route({
  path: "/wati-webhook",
  method: "POST",
  handler: handleWatiWebhook
});

http.route({
  path: "/wati-webhook1",
  method: "POST",
  handler: handleWatiWebhook1
});

async function validateClerkRequest(
  req: Request
): Promise<WebhookEvent | undefined> {
  const payloadString = await req.text();

  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const clerkWebhookSecret = ensureEnvironmentVariable("CLERK_WEBHOOK_SECRET");

  const wh = new Webhook(clerkWebhookSecret);
  let evt: Event | null = null;
  try {
    evt = wh.verify(payloadString, svixHeaders) as Event;
  } catch (_) {
    console.log("error verifying");
    return;
  }

  return evt as unknown as WebhookEvent;
}
export default http;