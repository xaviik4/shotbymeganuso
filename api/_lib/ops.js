import { createClient } from "@supabase/supabase-js";
import { getRequestUser } from "./auth.js";
import { supabaseAdmin } from "./supabase-admin.js";

export async function requireOpsMember(req, res, { write = false } = {}) {
  const user = await getRequestUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const { data: membership, error } = await supabaseAdmin()
    .from("ops_memberships")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !membership) {
    res.status(403).json({ error: "Operations access is not enabled for this account." });
    return null;
  }
  if (write && membership.role === "viewer") {
    res.status(403).json({ error: "This account has read-only access." });
    return null;
  }

  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!token || !url || !anonKey) {
    res.status(500).json({ error: "Operations data access is not configured." });
    return null;
  }
  const db = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { user, workspaceId: membership.workspace_id, role: membership.role, db };
}

export function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  return null;
}

export function sendMethodNotAllowed(res, allowed) {
  res.setHeader("Allow", allowed.join(", "));
  return res.status(405).json({ error: "Method not allowed" });
}

const AREAS = new Set(["South Omaha", "Papillion", "Bellevue", "Gretna", "Elkhorn", "NW Omaha", "West Omaha", "Other Omaha"]);
const SETUPS = new Set(["Solo", "Team lead", "Team member", "Brokerage owner"]);
const SOURCES = new Set(["Zillow", "Instagram", "Realtor.com", "Referral", "Facebook group", "Other"]);
const CHANNELS = new Set(["Instagram DM", "Email", "Phone", "Facebook"]);
const MESSAGE_TYPES = new Set(["Research", "Sales"]);
const VERSIONS = new Set(["v1", "v2", "v3", "v4", "v5"]);
const PROSPECT_STATUSES = new Set(["to contact", "sent", "replied", "interested", "booked", "showed", "closed", "no", "do not contact"]);

function cleanText(value, max = 4000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanDate(value) {
  if (!value) return null;
  const date = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) ? date : null;
}

function cleanBoolean(value) {
  if (value === true || value === 1) return true;
  if (typeof value === "string") return ["y", "yes", "true", "1"].includes(value.trim().toLowerCase());
  return false;
}

export function normalizeProspect(input) {
  if (!input || typeof input !== "object") throw new Error("Prospect data is required.");
  const name = cleanText(input.name, 160);
  if (!name) throw new Error("Prospect name is required.");
  const area = AREAS.has(input.area) ? input.area : "Other Omaha";
  const setup = SETUPS.has(input.setup) ? input.setup : "Solo";
  const source = SOURCES.has(input.source) ? input.source : "Other";
  const channel = CHANNELS.has(input.channel) ? input.channel : "Instagram DM";
  const messageType = MESSAGE_TYPES.has(input.message_type ?? input.messageType) ? (input.message_type ?? input.messageType) : "Research";
  const version = input.message_version ?? input.messageVersion;
  const requestedStatus = typeof input.status === "string" ? input.status.trim().toLowerCase() : "";
  const status = PROSPECT_STATUSES.has(requestedStatus) ? requestedStatus : "to contact";
  const sales = Number(input.sales_last_12_months ?? input.salesLast12Months ?? 0);
  const followUps = Number(input.follow_ups_sent ?? input.followUpsSent ?? 0);
  if (!Number.isInteger(sales) || sales < 0 || !Number.isInteger(followUps) || followUps < 0 || followUps > 100) {
    throw new Error("Sales must be nonnegative whole numbers; follow-ups must be between 0 and 100.");
  }

  let callAt = input.call_at ?? input.callAt ?? null;
  if (callAt && Number.isNaN(Date.parse(callAt))) throw new Error("Call date is invalid.");

  return {
    name,
    brokerage: cleanText(input.brokerage, 240),
    area,
    speaks_spanish: cleanBoolean(input.speaks_spanish ?? input.speaksSpanish),
    sales_last_12_months: sales,
    new_construction: cleanBoolean(input.new_construction ?? input.newConstruction),
    setup,
    instagram: cleanText(input.instagram, 240),
    email: cleanText(input.email, 320),
    phone: cleanText(input.phone, 80),
    source,
    channel,
    message_type: messageType,
    message_version: VERSIONS.has(version) ? version : null,
    first_sent_date: cleanDate(input.first_sent_date ?? input.firstSentDate),
    follow_ups_sent: followUps,
    last_contact_date: cleanDate(input.last_contact_date ?? input.lastContactDate),
    call_at: callAt ? new Date(callAt).toISOString() : null,
    status,
    next_step: cleanText(input.next_step ?? input.nextStep, 500),
    notes: cleanText(input.notes, 10000),
  };
}

export function localDateString(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

function eventTimestamp(date, fallback = new Date()) {
  const day = cleanDate(date);
  return day ? `${day}T20:00:00.000Z` : fallback.toISOString();
}

const STATUS_EVENTS = {
  replied: ["reply_received"],
  interested: ["prospect_interested"],
  booked: ["call_booked"],
  showed: ["call_held"],
  closed: ["client_signed"],
};

export function eventsForImportedProspect(prospect, prospectId, workspaceId, userId) {
  const events = [];
  const sentDate = prospect.first_sent_date;
  const followupCount = prospect.follow_ups_sent;
  if (sentDate) {
    const sentTotal = followupCount + 1;
    for (let i = 0; i < sentTotal; i += 1) {
      const date = i === 0 ? sentDate : (prospect.last_contact_date || sentDate);
      events.push({
        workspace_id: workspaceId,
        prospect_id: prospectId,
        event_type: "message_sent",
        happened_at: eventTimestamp(date),
        details: { source: "csv-import", sequence: i + 1 },
        recorded_by: userId,
      });
    }
  }
  const statusEvents = STATUS_EVENTS[prospect.status] || [];
  const importedStatusEvents = prospect.status === "interested" ? ["reply_received", ...statusEvents] : statusEvents;
  for (const eventType of importedStatusEvents) {
    events.push({
      workspace_id: workspaceId,
      prospect_id: prospectId,
      event_type: eventType,
      happened_at: eventTimestamp(prospect.last_contact_date || prospect.first_sent_date),
      details: { source: "csv-import", imported_status: prospect.status },
      recorded_by: userId,
    });
  }
  return events;
}

export function eventForStatus(status, prospectId, workspaceId, userId, happenedAt = new Date()) {
  const eventTypes = STATUS_EVENTS[status] || [];
  return eventTypes.map((eventType) => ({
    workspace_id: workspaceId,
    prospect_id: prospectId,
    event_type: eventType,
    happened_at: happenedAt.toISOString(),
    details: { source: "status-change", status },
    recorded_by: userId,
  }));
}

export function eventForMessage(prospectId, workspaceId, userId, happenedAt = new Date(), source = "follow-up") {
  return {
    workspace_id: workspaceId,
    prospect_id: prospectId,
    event_type: "message_sent",
    happened_at: happenedAt.toISOString(),
    details: { source },
    recorded_by: userId,
  };
}
