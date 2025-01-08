/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as appointment from "../appointment.js";
import type * as bills from "../bills.js";
import type * as contacts from "../contacts.js";
import type * as crons from "../crons.js";
import type * as getdoctorslots from "../getdoctorslots.js";
import type * as hospitals from "../hospitals.js";
import type * as http from "../http.js";
import type * as investigations from "../investigations.js";
import type * as iot from "../iot.js";
import type * as labReports from "../labReports.js";
import type * as lib_mockapi from "../lib/mockapi.js";
import type * as lib_mockconvex from "../lib/mockconvex.js";
import type * as lib_quickcache from "../lib/quickcache.js";
import type * as lib_utils from "../lib/utils.js";
import type * as machines from "../machines.js";
import type * as messages from "../messages.js";
import type * as patients from "../patients.js";
import type * as patientsearch from "../patientsearch.js";
import type * as prescriptions from "../prescriptions.js";
import type * as scheduledCalls from "../scheduledCalls.js";
import type * as service_openai from "../service/openai.js";
import type * as slots from "../slots.js";
import type * as users from "../users.js";
import type * as vaccinations from "../vaccinations.js";
import type * as vendors from "../vendors.js";
import type * as videos from "../videos.js";
import type * as watiWebhook from "../watiWebhook.js";
import type * as watsappapi from "../watsappapi.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  appointment: typeof appointment;
  bills: typeof bills;
  contacts: typeof contacts;
  crons: typeof crons;
  getdoctorslots: typeof getdoctorslots;
  hospitals: typeof hospitals;
  http: typeof http;
  investigations: typeof investigations;
  iot: typeof iot;
  labReports: typeof labReports;
  "lib/mockapi": typeof lib_mockapi;
  "lib/mockconvex": typeof lib_mockconvex;
  "lib/quickcache": typeof lib_quickcache;
  "lib/utils": typeof lib_utils;
  machines: typeof machines;
  messages: typeof messages;
  patients: typeof patients;
  patientsearch: typeof patientsearch;
  prescriptions: typeof prescriptions;
  scheduledCalls: typeof scheduledCalls;
  "service/openai": typeof service_openai;
  slots: typeof slots;
  users: typeof users;
  vaccinations: typeof vaccinations;
  vendors: typeof vendors;
  videos: typeof videos;
  watiWebhook: typeof watiWebhook;
  watsappapi: typeof watsappapi;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
