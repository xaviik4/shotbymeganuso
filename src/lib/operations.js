export const PROSPECT_STATUSES = [
  "to contact", "sent", "replied", "interested", "booked", "showed", "closed", "no", "do not contact",
];

export const CLIENT_STATUSES = [
  "onboarding", "filming", "editing", "awaiting approval", "live", "reporting", "paused", "churned",
];

const NO_FOLLOW_UP_STATUSES = new Set(["no", "do not contact", "booked", "showed", "closed"]);
const HIGH_PRIORITY_SETUPS = new Set(["Solo", "Team lead", "Brokerage owner"]);

export function prospectPriority(prospect) {
  const sales = Number(prospect.sales_last_12_months ?? prospect.salesLast12Months) || 0;
  const spanish = prospect.speaks_spanish ?? prospect.speaksSpanish;
  const setup = prospect.setup;
  if (spanish && sales >= 3 && HIGH_PRIORITY_SETUPS.has(setup)) return "A";
  if (spanish && sales >= 1) return "B";
  return "C";
}

function addDays(dateValue, days) {
  if (!dateValue) return null;
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function nextFollowUpDate(prospect) {
  const status = prospect.status;
  const firstSent = prospect.first_sent_date ?? prospect.firstSentDate;
  const lastContact = prospect.last_contact_date ?? prospect.lastContactDate;
  const count = Number(prospect.follow_ups_sent ?? prospect.followUpsSent) || 0;

  if (!firstSent || NO_FOLLOW_UP_STATUSES.has(status)) return null;
  if (status === "replied" || status === "interested") {
    return addDays(lastContact || firstSent, 3);
  }
  if (count >= 3) return "close out";
  return addDays(firstSent, [3, 7, 14][count]);
}

export function isActiveClient(status) {
  return status !== "paused" && status !== "churned";
}
