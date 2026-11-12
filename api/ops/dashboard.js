import { localDateString, requireOpsMember, sendMethodNotAllowed } from "../_lib/ops.js";
import { currentPacificWeek } from "../_lib/ops-time.js";
import { isActiveClient, nextFollowUpDate } from "../../src/lib/operations.js";

const percent = (numerator, denominator) => denominator ? Math.round((numerator / denominator) * 1000) / 10 : 0;

export default async function handler(req, res) {
  if (req.method !== "GET") return sendMethodNotAllowed(res, ["GET"]);
  const context = await requireOpsMember(req, res);
  if (!context) return;
  const { db } = context;
  const week = currentPacificWeek();
  const today = localDateString();
  const now = new Date().toISOString();

  const [eventResult, prospectResult, clientResult, versionProspectsResult, versionEventsResult] = await Promise.all([
    db.from("ops_prospect_events").select("event_type, prospect_id")
      .eq("workspace_id", context.workspaceId).gte("happened_at", week.start).lt("happened_at", week.end),
    db.from("ops_prospects").select("*").eq("workspace_id", context.workspaceId),
    db.from("ops_clients").select("status, monthly_price").eq("workspace_id", context.workspaceId),
    db.from("ops_prospects").select("id, message_version").eq("workspace_id", context.workspaceId).not("message_version", "is", null),
    db.from("ops_prospect_events").select("event_type, prospect_id")
      .eq("workspace_id", context.workspaceId).in("event_type", ["message_sent", "reply_received"]),
  ]);

  if (eventResult.error || prospectResult.error || clientResult.error || versionProspectsResult.error || versionEventsResult.error) {
    return res.status(500).json({ error: "Could not load operations metrics." });
  }

  const events = eventResult.data || [];
  const countUnique = (type) => new Set(events.filter((event) => event.event_type === type).map((event) => event.prospect_id)).size;
  const messagesSent = events.filter((event) => event.event_type === "message_sent").length;
  const replies = events.filter((event) => event.event_type === "reply_received").length;
  const callsBooked = countUnique("call_booked");
  const interested = countUnique("prospect_interested");
  const callsHeld = countUnique("call_held");
  const clientsSigned = countUnique("client_signed");

  const prospects = prospectResult.data || [];
  const followUps = prospects.map((prospect) => ({ ...prospect, next_follow_up_date: nextFollowUpDate(prospect) }))
    .filter((prospect) => typeof prospect.next_follow_up_date === "string" && prospect.next_follow_up_date !== "close out" && prospect.next_follow_up_date <= today)
    .map((prospect) => ({ ...prospect, is_overdue: prospect.next_follow_up_date < today }))
    .sort((a, b) => a.next_follow_up_date.localeCompare(b.next_follow_up_date));
  const calls = prospects.filter((prospect) => prospect.status === "booked")
    .filter((prospect) => !prospect.call_at || prospect.call_at >= now)
    .sort((a, b) => (a.call_at || "9999").localeCompare(b.call_at || "9999")).slice(0, 12);

  const clients = clientResult.data || [];
  const activeClients = clients.filter((client) => isActiveClient(client.status));
  const versionByProspect = new Map((versionProspectsResult.data || []).map((prospect) => [prospect.id, prospect.message_version]));
  const versions = Object.fromEntries(["v1", "v2", "v3", "v4", "v5"].map((version) => [version, { version, sent: 0, replies: 0, reply_rate: 0, ready_to_judge: false }]));
  for (const event of versionEventsResult.data || []) {
    const version = versionByProspect.get(event.prospect_id);
    if (version && versions[version]) {
      if (event.event_type === "message_sent") versions[version].sent += 1;
      if (event.event_type === "reply_received") versions[version].replies += 1;
    }
  }
  for (const stats of Object.values(versions)) {
    stats.reply_rate = percent(stats.replies, stats.sent);
    stats.ready_to_judge = stats.sent >= 100;
  }

  return res.status(200).json({
    week: { start: week.monday, timezone: "America/Los_Angeles", ends_exclusive: week.end },
    weekly: {
      messages_sent: messagesSent,
      replies,
      reply_rate: percent(replies, messagesSent),
      calls_booked: callsBooked,
      prospects_interested: interested,
      booked_rate: percent(callsBooked, interested),
      calls_held: callsHeld,
      show_rate: percent(callsHeld, callsBooked),
      clients_signed: clientsSigned,
      targets: { reply_rate: "10–20%", booked_rate: "30–50%", show_rate: "70%+" },
    },
    follow_ups_due: followUps,
    upcoming_calls: calls,
    active_clients: activeClients.length,
    monthly_recurring_revenue: activeClients.reduce((sum, client) => sum + Number(client.monthly_price || 0), 0),
    message_versions: Object.values(versions),
    generated_at: now,
  });
}
