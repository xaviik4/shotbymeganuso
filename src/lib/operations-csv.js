const COLUMNS = [
  "name", "brokerage", "area", "speaks_spanish", "sales_last_12_months", "new_construction", "setup",
  "instagram", "email", "phone", "source", "channel", "message_type", "message_version",
  "first_sent_date", "follow_ups_sent", "last_contact_date", "call_at", "status", "next_step", "notes",
];

const HEADER_ALIASES = {
  "speaks_spanish_y_n": "speaks_spanish", "speaks_spanish_yn": "speaks_spanish", "spanish": "speaks_spanish",
  "sales_last_12_months_number": "sales_last_12_months", "sales_last_12_months": "sales_last_12_months",
  "new_construction_y_n": "new_construction", "new_construction_yn": "new_construction",
  "message_version_v1_v5": "message_version", "follow_ups_sent_number": "follow_ups_sent",
  "first_sent": "first_sent_date", "last_contact": "last_contact_date", "next_step": "next_step",
  "message_type": "message_type", "call_date_time": "call_at", "call_scheduled_at": "call_at",
};

function parseRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const input = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(cell); cell = ""; }
    else if (char === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  if (cell || row.length) { row.push(cell.replace(/\r$/, "")); rows.push(row); }
  return rows.filter((values) => values.some((value) => value.trim() !== ""));
}

function headerKey(value) {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return HEADER_ALIASES[normalized] || normalized;
}

function dateValue(value) {
  const text = value.trim();
  if (!text) return "";
  const mdy = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`;
  return text.slice(0, 10);
}

function yesNo(value) {
  return ["y", "yes", "true", "1"].includes(value.trim().toLowerCase());
}

export function parseProspectCsv(text) {
  const rows = parseRows(text);
  if (rows.length < 2) throw new Error("CSV needs a header and at least one prospect row.");
  const headers = rows[0].map(headerKey);
  const missing = ["name"].filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Missing required CSV column: ${missing.join(", ")}`);
  return rows.slice(1).map((values) => {
    const raw = Object.fromEntries(headers.map((header, index) => [header, (values[index] || "").trim()]));
    const prospect = {};
    for (const key of COLUMNS) if (raw[key] !== undefined) prospect[key] = raw[key];
    prospect.speaks_spanish = yesNo(raw.speaks_spanish || "");
    prospect.new_construction = yesNo(raw.new_construction || "");
    prospect.sales_last_12_months = Number.parseInt(raw.sales_last_12_months || "0", 10) || 0;
    prospect.follow_ups_sent = Number.parseInt(raw.follow_ups_sent || "0", 10) || 0;
    prospect.message_version = /^\d$/.test(raw.message_version || "") ? `v${raw.message_version}` : (raw.message_version || null);
    prospect.first_sent_date = dateValue(raw.first_sent_date || "") || null;
    prospect.last_contact_date = dateValue(raw.last_contact_date || "") || null;
    if (raw.call_at) {
      const parsed = new Date(raw.call_at);
      prospect.call_at = Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    } else prospect.call_at = null;
    return prospect;
  }).filter((prospect) => prospect.name);
}

function safeCell(value) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function prospectsToCsv(prospects) {
  return [COLUMNS.join(","), ...prospects.map((prospect) => COLUMNS.map((key) => safeCell(prospect[key])).join(","))].join("\r\n");
}
