import test from "node:test";
import assert from "node:assert/strict";
import { nextFollowUpDate, prospectPriority } from "../src/lib/operations.js";
import { eventsForImportedProspect } from "../api/_lib/ops.js";
import { parseProspectCsv } from "../src/lib/operations-csv.js";

test("priority follows Spanish, sales volume, and qualifying setup rules", () => {
  assert.equal(prospectPriority({ speaks_spanish: true, sales_last_12_months: 3, setup: "Solo" }), "A");
  assert.equal(prospectPriority({ speaks_spanish: true, sales_last_12_months: 3, setup: "Team member" }), "B");
  assert.equal(prospectPriority({ speaks_spanish: true, sales_last_12_months: 1, setup: "Team member" }), "B");
  assert.equal(prospectPriority({ speaks_spanish: false, sales_last_12_months: 10, setup: "Brokerage owner" }), "C");
  assert.equal(prospectPriority({ speaks_spanish: true, sales_last_12_months: 0, setup: "Solo" }), "C");
});

test("follow-up dates use the prescribed schedule", () => {
  const prospect = { first_sent_date: "2026-11-02", status: "sent", follow_ups_sent: 0 };
  assert.equal(nextFollowUpDate(prospect), "2026-11-05");
  assert.equal(nextFollowUpDate({ ...prospect, follow_ups_sent: 1 }), "2026-11-09");
  assert.equal(nextFollowUpDate({ ...prospect, follow_ups_sent: 2 }), "2026-11-16");
  assert.equal(nextFollowUpDate({ ...prospect, follow_ups_sent: 3 }), "close out");
});

test("replied prospects get three days from last contact, with first-sent fallback", () => {
  assert.equal(nextFollowUpDate({ status: "replied", first_sent_date: "2026-11-02", last_contact_date: "2026-11-08" }), "2026-11-11");
  assert.equal(nextFollowUpDate({ status: "interested", first_sent_date: "2026-11-02" }), "2026-11-05");
});

test("excluded statuses and missing first sent dates have no follow-up", () => {
  for (const status of ["no", "do not contact", "booked", "showed", "closed"]) {
    assert.equal(nextFollowUpDate({ status, first_sent_date: "2026-11-02" }), null);
  }
  assert.equal(nextFollowUpDate({ status: "sent" }), null);
});

test("CSV history events use the imported first-sent and last-contact dates", () => {
  const events = eventsForImportedProspect({
    first_sent_date: "2026-10-01",
    last_contact_date: "2026-10-12",
    follow_ups_sent: 2,
    status: "replied",
  }, "prospect-id", "workspace-id", "user-id");
  assert.equal(events.filter((event) => event.event_type === "message_sent").length, 3);
  assert.equal(events[0].happened_at, "2026-10-01T20:00:00.000Z");
  assert.equal(events[1].happened_at, "2026-10-12T20:00:00.000Z");
  assert.equal(events.at(-1).event_type, "reply_received");
  assert.equal(events.at(-1).happened_at, "2026-10-12T20:00:00.000Z");
});

test("CSV importer maps the provided header format and quoted values", () => {
  const [prospect] = parseProspectCsv([
    'Name,Brokerage,Area,Speaks Spanish (Y/N),Sales Last 12 Months (Number),New Construction (Y/N),Setup,Notes',
    'Avery Lopez,"Team, West",Papillion,Y,4,N,Team lead,"Asked for a follow-up, next week"',
  ].join("\n"));
  assert.equal(prospect.name, "Avery Lopez");
  assert.equal(prospect.brokerage, "Team, West");
  assert.equal(prospect.speaks_spanish, true);
  assert.equal(prospect.sales_last_12_months, 4);
  assert.equal(prospect.new_construction, false);
  assert.equal(prospect.notes, "Asked for a follow-up, next week");
});
