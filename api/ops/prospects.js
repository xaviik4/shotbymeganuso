import {
  eventForMessage, eventForStatus, localDateString, normalizeProspect,
  eventsForImportedProspect, readBody, requireOpsMember, sendMethodNotAllowed,
} from "../_lib/ops.js";

function eventDate(date) {
  return date ? new Date(`${date}T20:00:00.000Z`) : new Date();
}

async function insertEvents(db, events) {
  if (!events.length) return null;
  for (let index = 0; index < events.length; index += 500) {
    const { error } = await db.from("ops_prospect_events").insert(events.slice(index, index + 500));
    if (error) return { error };
  }
  return { error: null };
}

export default async function handler(req, res) {
  const context = await requireOpsMember(req, res, { write: req.method !== "GET" });
  if (!context) return;
  const { db } = context;

  if (req.method === "GET") {
    const { data, error } = await db.from("ops_prospects").select("*")
      .eq("workspace_id", context.workspaceId).order("created_at", { ascending: false }).limit(5000);
    if (error) return res.status(500).json({ error: "Could not load prospects." });
    return res.status(200).json({ prospects: data || [] });
  }

  if (req.method === "POST") {
    const body = readBody(req);
    if (body?.action === "import") {
      if (!Array.isArray(body.records) || body.records.length === 0 || body.records.length > 500) {
        return res.status(400).json({ error: "Import between 1 and 500 prospect rows at a time." });
      }
      let rows;
      try { rows = body.records.map((row) => normalizeProspect(row)); }
      catch (error) { return res.status(400).json({ error: error.message }); }

      const { data, error } = await db.from("ops_prospects")
        .insert(rows.map((row) => ({ ...row, workspace_id: context.workspaceId })))
        .select("*");
      if (error) return res.status(400).json({ error: "Could not import prospects. Check the CSV values and try again." });

      const events = data.flatMap((row) => eventsForImportedProspect(row, row.id, context.workspaceId, context.user.id));
      const eventResult = await insertEvents(db, events);
      if (eventResult?.error) {
        await db.from("ops_prospects").delete().in("id", data.map((row) => row.id)).eq("workspace_id", context.workspaceId);
        return res.status(500).json({ error: "Import could not record its history; no imported rows were kept." });
      }
      return res.status(201).json({ imported: data.length });
    }

    const input = { ...body };
    if (String(input.status || "").trim().toLowerCase() === "sent" && !input.first_sent_date && !input.firstSentDate) {
      input.first_sent_date = localDateString();
    }
    let row;
    try { row = normalizeProspect(input); }
    catch (error) { return res.status(400).json({ error: error.message }); }
    const { data, error } = await db.from("ops_prospects")
      .insert({ ...row, workspace_id: context.workspaceId }).select("*").single();
    if (error) return res.status(400).json({ error: "Could not add prospect." });
    const events = [];
    if (row.first_sent_date) {
      for (let i = 0; i <= row.follow_ups_sent; i += 1) {
        const date = i === 0 ? row.first_sent_date : (row.last_contact_date || row.first_sent_date);
        events.push(eventForMessage(data.id, context.workspaceId, context.user.id, eventDate(date), "prospect-create"));
      }
    }
    events.push(...eventForStatus(row.status, data.id, context.workspaceId, context.user.id));
    const eventResult = await insertEvents(db, events);
    if (eventResult?.error) {
      await db.from("ops_prospects").delete().eq("id", data.id).eq("workspace_id", context.workspaceId);
      return res.status(500).json({ error: "Could not record prospect activity." });
    }
    return res.status(201).json({ prospect: data });
  }

  if (req.method === "PATCH") {
    const body = readBody(req);
    const id = String(body?.id || "");
    if (!id) return res.status(400).json({ error: "Prospect id is required." });
    const { data: existing, error: readError } = await db.from("ops_prospects").select("*")
      .eq("id", id).eq("workspace_id", context.workspaceId).maybeSingle();
    if (readError || !existing) return res.status(404).json({ error: "Prospect not found." });

    if (body.action === "log_follow_up") {
      const today = localDateString();
      const newStatus = existing.status === "to contact" ? "sent" : existing.status;
      const { data, error } = await db.from("ops_prospects").update({
        follow_ups_sent: existing.follow_ups_sent + 1,
        last_contact_date: today,
        first_sent_date: existing.first_sent_date || today,
        status: newStatus,
        updated_at: new Date().toISOString(),
      }).eq("id", id).eq("workspace_id", context.workspaceId).select("*").single();
      if (error) return res.status(500).json({ error: "Could not log follow-up." });
      const { error: eventError } = await insertEvents(db, [eventForMessage(id, context.workspaceId, context.user.id)]);
      if (eventError) return res.status(500).json({ error: "Follow-up saved, but its activity event could not be recorded." });
      return res.status(200).json({ prospect: data });
    }

    const input = { ...existing, ...body };
    if (String(input.status || "").trim().toLowerCase() === "sent" && !input.first_sent_date && !input.firstSentDate) {
      input.first_sent_date = localDateString();
    }
    let row;
    try { row = normalizeProspect(input); }
    catch (error) { return res.status(400).json({ error: error.message }); }
    const { data, error } = await db.from("ops_prospects").update({ ...row, updated_at: new Date().toISOString() })
      .eq("id", id).eq("workspace_id", context.workspaceId).select("*").single();
    if (error) return res.status(400).json({ error: "Could not update prospect." });
    if (row.status !== existing.status) {
      const events = eventForStatus(row.status, id, context.workspaceId, context.user.id);
      if (row.status === "sent" && existing.status !== "sent") {
        events.push(eventForMessage(id, context.workspaceId, context.user.id, new Date(), "status-change"));
      }
      if (row.status === "interested" && !["replied", "interested"].includes(existing.status)) {
        events.push(...eventForStatus("replied", id, context.workspaceId, context.user.id));
      }
      const { error: eventError } = await insertEvents(db, events);
      if (eventError) return res.status(500).json({ error: "Status saved, but its activity event could not be recorded." });
    }
    return res.status(200).json({ prospect: data });
  }

  if (req.method === "DELETE") {
    const id = String(req.query?.id || readBody(req)?.id || "");
    if (!id) return res.status(400).json({ error: "Prospect id is required." });
    const { error } = await db.from("ops_prospects").delete().eq("id", id).eq("workspace_id", context.workspaceId);
    if (error) return res.status(500).json({ error: "Could not delete prospect." });
    return res.status(204).end();
  }

  return sendMethodNotAllowed(res, ["GET", "POST", "PATCH", "DELETE"]);
}
