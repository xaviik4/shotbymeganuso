import { useCallback, useEffect, useMemo, useState } from "react";
import OperationsLayout from "../components/OperationsLayout";
import { useAuth } from "../context/AuthContext";
import { nextFollowUpDate, prospectPriority, PROSPECT_STATUSES } from "../lib/operations";
import { parseProspectCsv, prospectsToCsv } from "../lib/operations-csv";
import { jsonBody, opsApi } from "../lib/ops-api";

const AREAS = ["South Omaha", "Papillion", "Bellevue", "Gretna", "Elkhorn", "NW Omaha", "West Omaha", "Other Omaha"];
const SETUPS = ["Solo", "Team lead", "Team member", "Brokerage owner"];
const SOURCES = ["Zillow", "Instagram", "Realtor.com", "Referral", "Facebook group", "Other"];
const CHANNELS = ["Instagram DM", "Email", "Phone", "Facebook"];
const blank = () => ({ name: "", brokerage: "", area: "Other Omaha", speaks_spanish: false, sales_last_12_months: 0, new_construction: false, setup: "Solo", instagram: "", email: "", phone: "", source: "Other", channel: "Instagram DM", message_type: "Research", message_version: "", first_sent_date: "", follow_ups_sent: 0, last_contact_date: "", call_at: "", status: "to contact", next_step: "", notes: "" });

function dateText(value) {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" }).format(date);
}

function localDateTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function SelectField({ label, name, value, options, onChange }) {
  return <label className="ops-field">{label}<select name={name} value={value} onChange={onChange}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function ProspectEditor({ prospect, token, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({ ...blank(), ...prospect, call_at: localDateTimeInput(prospect?.call_at) }));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const change = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };
  async function submit(event) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form, id: prospect?.id, sales_last_12_months: Number(form.sales_last_12_months), follow_ups_sent: Number(form.follow_ups_sent), call_at: form.call_at ? new Date(form.call_at).toISOString() : null };
      const result = await opsApi(prospect ? "/api/ops/prospects" : "/api/ops/prospects", token, { method: prospect ? "PATCH" : "POST", body: jsonBody(payload) });
      onSaved(result.prospect);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  return <div className="ops-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <form className="ops-modal" onSubmit={submit} aria-labelledby="prospect-editor-title">
      <div className="ops-modal-head"><h2 id="prospect-editor-title">{prospect ? "Edit prospect" : "Add prospect"}</h2><button type="button" className="ops-icon-button" onClick={onClose} aria-label="Close">×</button></div>
      {error && <div className="ops-alert" role="alert">{error}</div>}
      <div className="ops-form-grid">
        <label className="ops-field">Name *<input required name="name" value={form.name} onChange={change} /></label>
        <label className="ops-field">Brokerage<input name="brokerage" value={form.brokerage} onChange={change} /></label>
        <SelectField label="Area" name="area" value={form.area} options={AREAS} onChange={change} />
        <SelectField label="Setup" name="setup" value={form.setup} options={SETUPS} onChange={change} />
        <label className="ops-field">Sales last 12 months<input type="number" min="0" name="sales_last_12_months" value={form.sales_last_12_months} onChange={change} /></label>
        <SelectField label="Source" name="source" value={form.source} options={SOURCES} onChange={change} />
        <SelectField label="Channel" name="channel" value={form.channel} options={CHANNELS} onChange={change} />
        <SelectField label="Message type" name="message_type" value={form.message_type} options={["Research", "Sales"]} onChange={change} />
        <SelectField label="Message version" name="message_version" value={form.message_version} options={["", "v1", "v2", "v3", "v4", "v5"]} onChange={change} />
        <label className="ops-field">Instagram<input name="instagram" value={form.instagram} onChange={change} /></label>
        <label className="ops-field">Email<input type="email" name="email" value={form.email} onChange={change} /></label>
        <label className="ops-field">Phone<input type="tel" name="phone" value={form.phone} onChange={change} /></label>
        <label className="ops-field">First sent<input type="date" name="first_sent_date" value={form.first_sent_date || ""} onChange={change} /></label>
        <label className="ops-field">Follow-ups sent<input type="number" min="0" name="follow_ups_sent" value={form.follow_ups_sent} onChange={change} /></label>
        <label className="ops-field">Last contact<input type="date" name="last_contact_date" value={form.last_contact_date || ""} onChange={change} /></label>
        <label className="ops-field">Call date/time<input type="datetime-local" name="call_at" value={form.call_at || ""} onChange={change} /></label>
        <SelectField label="Status" name="status" value={form.status} options={PROSPECT_STATUSES} onChange={change} />
        <label className="ops-field ops-field-wide">Next step<input name="next_step" value={form.next_step} onChange={change} /></label>
        <label className="ops-field ops-field-wide">Notes<textarea rows="4" name="notes" value={form.notes} onChange={change} /></label>
        <label className="ops-check"><input type="checkbox" name="speaks_spanish" checked={form.speaks_spanish} onChange={change} /> Speaks Spanish</label>
        <label className="ops-check"><input type="checkbox" name="new_construction" checked={form.new_construction} onChange={change} /> New construction</label>
      </div>
      <div className="ops-modal-actions"><button type="button" className="ops-button ops-button-quiet" onClick={onClose}>Cancel</button><button className="ops-button" disabled={saving}>{saving ? "Saving…" : "Save prospect"}</button></div>
    </form>
  </div>;
}

function CsvImporter({ token, onClose, onImported }) {
  const [records, setRecords] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function chooseFile(event) {
    setError("");
    const file = event.target.files?.[0];
    if (!file) return;
    try { setRecords(parseProspectCsv(await file.text())); }
    catch (err) { setRecords(null); setError(err.message); }
  }
  async function save() {
    setSaving(true); setError("");
    try {
      const result = await opsApi("/api/ops/prospects", token, { method: "POST", body: jsonBody({ action: "import", records }) });
      onImported(result.imported);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  return <div className="ops-modal-backdrop"><div className="ops-modal ops-import-modal">
    <div className="ops-modal-head"><h2>Import CSV</h2><button className="ops-icon-button" onClick={onClose} aria-label="Close">×</button></div>
    <p className="ops-muted">Choose a CSV with your prospect headers. Review the first rows before importing.</p>
    <label className="ops-field">CSV file<input type="file" accept=".csv,text/csv" onChange={chooseFile} /></label>
    {records && <><p className="ops-success">Preview: {records.length} prospects ready to import.</p><div className="ops-table-wrap ops-preview"><table><thead><tr><th>Name</th><th>Area</th><th>Status</th><th>First sent</th></tr></thead><tbody>{records.slice(0, 8).map((row, index) => <tr key={`${row.name}-${index}`}><td>{row.name}</td><td>{row.area || "Other Omaha"}</td><td>{row.status || "to contact"}</td><td>{row.first_sent_date || "—"}</td></tr>)}</tbody></table></div></>}
    {error && <div className="ops-alert" role="alert">{error}</div>}
    <div className="ops-modal-actions"><button className="ops-button ops-button-quiet" onClick={onClose}>Cancel</button><button className="ops-button" disabled={!records?.length || saving} onClick={save}>{saving ? "Importing…" : `Import ${records?.length || ""} prospects`}</button></div>
  </div></div>;
}

export default function Pipeline() {
  const { session } = useAuth();
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [areaFilter, setAreaFilter] = useState("All areas");
  const [editor, setEditor] = useState(undefined);
  const [importOpen, setImportOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const data = await opsApi("/api/ops/prospects", session.access_token); setProspects(data.prospects); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [session.access_token]);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => prospects.map((prospect) => ({ ...prospect, priority: prospectPriority(prospect), next_follow_up_date: nextFollowUpDate(prospect) }))
    .filter((prospect) => statusFilter === "All statuses" || prospect.status === statusFilter)
    .filter((prospect) => priorityFilter === "All priorities" || prospect.priority === priorityFilter)
    .filter((prospect) => areaFilter === "All areas" || prospect.area === areaFilter)
    .sort((a, b) => {
      const left = a.next_follow_up_date;
      const right = b.next_follow_up_date;
      if (!left && !right) return a.name.localeCompare(b.name);
      if (!left) return 1;
      if (!right) return -1;
      if (left === "close out") return right === "close out" ? 0 : 1;
      if (right === "close out") return -1;
      return left.localeCompare(right);
    }), [prospects, statusFilter, priorityFilter, areaFilter]);

  function saved(prospect) {
    setProspects((current) => prospect ? (current.some((item) => item.id === prospect.id) ? current.map((item) => item.id === prospect.id ? prospect : item) : [prospect, ...current]) : current);
    setEditor(undefined); setNotice("Prospect saved.");
  }
  async function update(id, payload) {
    setError("");
    try { const data = await opsApi("/api/ops/prospects", session.access_token, { method: "PATCH", body: jsonBody({ id, ...payload }) }); saved(data.prospect); }
    catch (err) { setError(err.message); }
  }
  async function remove(prospect) {
    if (!window.confirm(`Delete ${prospect.name}? This also removes its activity history.`)) return;
    try { await opsApi(`/api/ops/prospects?id=${encodeURIComponent(prospect.id)}`, session.access_token, { method: "DELETE" }); setProspects((current) => current.filter((item) => item.id !== prospect.id)); }
    catch (err) { setError(err.message); }
  }
  function exportCsv() {
    const blob = new Blob([prospectsToCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = "meganusopr-prospects.csv"; link.click(); URL.revokeObjectURL(url);
  }
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());

  return <OperationsLayout active="pipeline"><main className="ops-page ops-pipeline-page">
    <header className="ops-page-head"><div><p className="ops-eyebrow">Sell · CRM</p><h1>Pipeline</h1><p className="ops-subtitle">{prospects.length} prospects · follow-ups sorted by due date</p></div><div className="ops-toolbar"><button className="ops-button ops-button-quiet" onClick={() => setImportOpen(true)}>Import CSV</button><button className="ops-button ops-button-quiet" onClick={exportCsv}>Export CSV</button><button className="ops-button" onClick={() => setEditor(null)}>Add prospect <span aria-hidden="true">+</span></button></div></header>
    <section className="ops-filters" aria-label="Pipeline filters">
      <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status"><option>All statuses</option>{PROSPECT_STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
      <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} aria-label="Filter by priority"><option>All priorities</option>{["A", "B", "C"].map((priority) => <option key={priority}>{priority}</option>)}</select>
      <select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} aria-label="Filter by area"><option>All areas</option>{AREAS.map((area) => <option key={area}>{area}</option>)}</select>
      <span className="ops-filter-count">Showing {filtered.length}</span>
    </section>
    {notice && <p className="ops-success" role="status">{notice}</p>}{error && <div className="ops-alert" role="alert">{error}</div>}
    {loading ? <p className="ops-loading" role="status">Loading prospects…</p> : <div className="ops-table-wrap"><table className="ops-table"><thead><tr><th>Prospect</th><th>Priority</th><th>Area</th><th>Spanish</th><th>Sales 12 mo.</th><th>Setup</th><th>New build</th><th>Contact</th><th>Source / channel</th><th>Message</th><th>First sent</th><th>Follow-ups</th><th>Last contact</th><th>Next follow-up</th><th>Status</th><th>Call</th><th>Next step / notes</th><th>Actions</th></tr></thead><tbody>
      {filtered.map((prospect) => {
        const inactive = ["no", "do not contact"].includes(prospect.status);
        const due = prospect.next_follow_up_date;
        const overdue = typeof due === "string" && due !== "close out" && due < today && !inactive;
        return <tr key={prospect.id} className={`${inactive ? "is-inactive " : ""}${overdue ? "is-overdue" : ""}`}>
          <td><strong>{prospect.name}</strong><small>{prospect.brokerage}</small></td><td><span className={`ops-priority priority-${prospect.priority.toLowerCase()}`}>{prospect.priority}</span></td><td>{prospect.area}</td><td>{prospect.speaks_spanish ? "Yes" : "No"}</td><td>{prospect.sales_last_12_months}</td><td>{prospect.setup}</td><td>{prospect.new_construction ? "Yes" : "No"}</td>
          <td className="ops-contact-cell">{prospect.instagram && <a href={prospect.instagram.startsWith("http") ? prospect.instagram : `https://instagram.com/${prospect.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer">IG</a>}{prospect.email && <a href={`mailto:${prospect.email}`}>Email</a>}{prospect.phone && <a href={`tel:${prospect.phone}`}>Phone</a>}</td>
          <td>{prospect.source}<small>{prospect.channel}</small></td><td>{prospect.message_type}<small>{prospect.message_version || "—"}</small></td><td>{dateText(prospect.first_sent_date)}</td><td>{prospect.follow_ups_sent}</td><td>{dateText(prospect.last_contact_date)}</td><td>{due === "close out" ? "Close out" : dateText(due)}{overdue && <small>Overdue</small>}</td>
          <td><select value={prospect.status} onChange={(event) => update(prospect.id, { status: event.target.value })} aria-label={`Change ${prospect.name} status`}>{PROSPECT_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></td><td>{dateText(prospect.call_at, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</td><td className="ops-notes-cell">{prospect.next_step && <strong>{prospect.next_step}</strong>}{prospect.notes && <small>{prospect.notes}</small>}</td>
          <td className="ops-row-actions"><button onClick={() => update(prospect.id, { action: "log_follow_up" })} disabled={inactive || prospect.status === "booked" || prospect.status === "showed" || prospect.status === "closed"}>Log follow-up</button><button onClick={() => setEditor(prospect)}>Edit</button><button className="danger" onClick={() => remove(prospect)}>Delete</button></td>
        </tr>;
      })}
      {!filtered.length && <tr><td colSpan="18" className="ops-empty">No prospects match these filters.</td></tr>}
    </tbody></table></div>}
    {editor !== undefined && <ProspectEditor prospect={editor} token={session.access_token} onClose={() => setEditor(undefined)} onSaved={saved} />}
    {importOpen && <CsvImporter token={session.access_token} onClose={() => setImportOpen(false)} onImported={(count) => { setImportOpen(false); setNotice(`${count} prospects imported; events were recorded using the CSV dates.`); load(); }} />}
  </main></OperationsLayout>;
}
