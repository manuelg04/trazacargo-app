/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accessCodes from "../accessCodes.js";
import type * as auth from "../auth.js";
import type * as companies from "../companies.js";
import type * as dev from "../dev.js";
import type * as drivers from "../drivers.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_documents from "../lib/documents.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as tripDocumentRequirements from "../tripDocumentRequirements.js";
import type * as tripDocumentReviewEvents from "../tripDocumentReviewEvents.js";
import type * as tripDocuments from "../tripDocuments.js";
import type * as tripEvents from "../tripEvents.js";
import type * as trips from "../trips.js";
import type * as users from "../users.js";
import type * as vehicles from "../vehicles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accessCodes: typeof accessCodes;
  auth: typeof auth;
  companies: typeof companies;
  dev: typeof dev;
  drivers: typeof drivers;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/documents": typeof lib_documents;
  "lib/permissions": typeof lib_permissions;
  tripDocumentRequirements: typeof tripDocumentRequirements;
  tripDocumentReviewEvents: typeof tripDocumentReviewEvents;
  tripDocuments: typeof tripDocuments;
  tripEvents: typeof tripEvents;
  trips: typeof trips;
  users: typeof users;
  vehicles: typeof vehicles;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
