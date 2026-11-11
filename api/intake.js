import { createHmac } from "node:crypto";
import { supabaseAdmin } from "./_lib/supabase-admin.js";
import { localDateString } from "./_lib/ops.js";

const OPS_WORKSPACE_ID = "52f3df09-e12e-4f98-9cf0-86d0ff06ad73";
const text = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (text(body.website_url, 300)) return res.status(204).end();

  const name = text(body.name, 160);
  const email = text(body.email, 320);
  const phone = text(body.phone, 80);
  const business = text(body.business_name, 240);
  const instagram = text(body.instagram, 240);
  const website = text(body.website, 500);
  const wantsHelp = text(body.wants_help, 3000);
  const acquisition = text(body.client_acquisition, 3000);
  const language = text(body.client_language, 100);
  if (!name || !emailPattern.test(email) || phone.replace(/\D/g, "").length < 7 || !wantsHelp || !acquisition || !["Spanish", "English", "Both"].includes(language)) {
    return res.status(400).json({ error: "Please complete the required fields with valid contact details." });
  }

  const pepper = process.env.INTAKE_RATE_LIMIT_SECRET;
  if (!pepper) return res.status(503).json({ error: "The intake form is temporarily unavailable." });
  const forwarded = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : String(forwarded || "").split(",")[0]).trim()
    || req.socket?.remoteAddress || "unknown";
  const ipHash = createHmac("sha256", pepper).update(ip).digest("hex");
  const now = new Date();
  now.setUTCMinutes(0, 0, 0);
  const windowStart = now.toISOString();
  const admin = supabaseAdmin();
  const { data: allowed, error: limitError } = await admin.rpc("consume_ops_intake_rate_limit", {
    p_ip_hash: ipHash,
    p_window_start: windowStart,
    p_limit: 5,
  });
  if (limitError) return res.status(503).json({ error: "The intake form is temporarily unavailable." });
  if (!allowed) return res.status(429).json({ error: "Please try again later." });

  const notes = [
    `Website: ${website || "Not provided"}`,
    `Instagram: ${instagram || "Not provided"}`,
    `What they want help with: ${wantsHelp}`,
    `Current client acquisition: ${acquisition}`,
    `Client language preference: ${language}`,
  ].join("\n");
  const { error: insertError } = await admin.rpc("create_ops_intake_submission", {
    p_workspace_id: OPS_WORKSPACE_ID,
    p_name: name,
    p_email: email,
    p_phone: phone,
    p_brokerage: business,
    p_instagram: instagram,
    p_notes: notes,
    p_last_contact_date: localDateString(),
  });
  if (insertError) return res.status(503).json({ error: "Could not submit your inquiry. Please try again." });
  return res.status(204).end();
}
