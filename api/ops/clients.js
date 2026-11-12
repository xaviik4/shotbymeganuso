import { readBody, requireOpsMember, sendMethodNotAllowed } from "../_lib/ops.js";

const STATUSES = new Set(["onboarding", "filming", "editing", "awaiting approval", "live", "reporting", "paused", "churned"]);
const text = (value, max = 4000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const date = (value) => value && /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? String(value) : null;

function normalizeClient(input) {
  const businessName = text(input?.business_name ?? input?.businessName, 240);
  if (!businessName) throw new Error("Business name is required.");
  const price = Number(input.monthly_price ?? input.monthlyPrice ?? 0);
  if (!Number.isFinite(price) || price < 0) throw new Error("Monthly price must be zero or more.");
  const status = STATUSES.has(input.status) ? input.status : "onboarding";
  return {
    business_name: businessName,
    contact: text(input.contact, 240),
    start_date: date(input.start_date ?? input.startDate),
    monthly_price: price,
    filming_date: date(input.filming_date ?? input.filmingDate),
    status,
    notes: text(input.notes, 10000),
    prospect_id: input.prospect_id || null,
  };
}

export default async function handler(req, res) {
  const context = await requireOpsMember(req, res, { write: req.method !== "GET" });
  if (!context) return;
  const { db } = context;

  if (req.method === "GET") {
    const { data, error } = await db.from("ops_clients").select("*")
      .eq("workspace_id", context.workspaceId).order("created_at", { ascending: false }).limit(3000);
    if (error) return res.status(500).json({ error: "Could not load clients." });
    return res.status(200).json({ clients: data || [] });
  }

  if (req.method === "POST") {
    let client;
    try { client = normalizeClient(readBody(req)); }
    catch (error) { return res.status(400).json({ error: error.message }); }
    const { data, error } = await db.from("ops_clients")
      .insert({ ...client, workspace_id: context.workspaceId }).select("*").single();
    if (error) return res.status(400).json({ error: "Could not add client. A linked prospect may already have a client record." });
    if (client.prospect_id) {
      const { data: prospect } = await db.from("ops_prospects").select("id,status")
        .eq("id", client.prospect_id).eq("workspace_id", context.workspaceId).maybeSingle();
      if (prospect && prospect.status !== "closed") {
        const { error: closeError } = await db.from("ops_prospects").update({ status: "closed", updated_at: new Date().toISOString() })
          .eq("id", prospect.id).eq("workspace_id", context.workspaceId);
        if (closeError) return res.status(500).json({ error: "Client was created, but the linked prospect could not be closed." });
        const { error: eventError } = await db.from("ops_prospect_events").insert({
          workspace_id: context.workspaceId,
          prospect_id: prospect.id,
          event_type: "client_signed",
          happened_at: new Date().toISOString(),
          details: { source: "client-create" },
          recorded_by: context.user.id,
        });
        if (eventError) return res.status(500).json({ error: "Client was created, but its signed activity could not be recorded." });
      }
    }
    return res.status(201).json({ client: data });
  }

  if (req.method === "PATCH") {
    const body = readBody(req);
    if (!body?.id) return res.status(400).json({ error: "Client id is required." });
    let client;
    try { client = normalizeClient(body); }
    catch (error) { return res.status(400).json({ error: error.message }); }
    const { data, error } = await db.from("ops_clients").update({ ...client, updated_at: new Date().toISOString() })
      .eq("id", body.id).eq("workspace_id", context.workspaceId).select("*").maybeSingle();
    if (error || !data) return res.status(404).json({ error: "Could not update client." });
    return res.status(200).json({ client: data });
  }

  if (req.method === "DELETE") {
    const id = String(req.query?.id || readBody(req)?.id || "");
    if (!id) return res.status(400).json({ error: "Client id is required." });
    const { error } = await db.from("ops_clients").delete().eq("id", id).eq("workspace_id", context.workspaceId);
    if (error) return res.status(500).json({ error: "Could not delete client." });
    return res.status(204).end();
  }

  return sendMethodNotAllowed(res, ["GET", "POST", "PATCH", "DELETE"]);
}
