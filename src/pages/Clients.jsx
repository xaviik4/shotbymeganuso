import { useCallback, useEffect, useState } from "react";
import OperationsLayout from "../components/OperationsLayout";
import { useAuth } from "../context/AuthContext";
import { CLIENT_STATUSES, isActiveClient } from "../lib/operations";
import { jsonBody, opsApi } from "../lib/ops-api";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const stages = ["onboarding", "filming", "editing", "awaiting approval", "live", "reporting"];
const blank = { business_name: "", contact: "", start_date: "", monthly_price: 0, filming_date: "", status: "onboarding", notes: "" };

function ClientForm({ client, token, onClose, onSaved }) {
  const [form, setForm] = useState({ ...blank, ...client });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const result = await opsApi("/api/ops/clients", token, { method: client ? "PATCH" : "POST", body: jsonBody({ ...form, id: client?.id, monthly_price: Number(form.monthly_price) }) });
      onSaved(result.client);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  return <div className="ops-modal-backdrop"><form className="ops-modal ops-client-form" onSubmit={submit}>
    <div className="ops-modal-head"><h2>{client ? "Edit client" : "Add client"}</h2><button type="button" className="ops-icon-button" onClick={onClose} aria-label="Close">×</button></div>
    {error && <div className="ops-alert" role="alert">{error}</div>}
    <label className="ops-field">Business name *<input required name="business_name" value={form.business_name} onChange={change} /></label>
    <label className="ops-field">Contact<input name="contact" value={form.contact} onChange={change} /></label>
    <label className="ops-field">Start date<input type="date" name="start_date" value={form.start_date || ""} onChange={change} /></label>
    <label className="ops-field">Monthly price<input type="number" min="0" step="0.01" name="monthly_price" value={form.monthly_price} onChange={change} /></label>
    <label className="ops-field">Filming date<input type="date" name="filming_date" value={form.filming_date || ""} onChange={change} /></label>
    <label className="ops-field">Status<select name="status" value={form.status} onChange={change}>{CLIENT_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
    <label className="ops-field">Notes<textarea rows="4" name="notes" value={form.notes} onChange={change} /></label>
    <div className="ops-modal-actions"><button type="button" className="ops-button btn-outline" onClick={onClose}>Cancel</button><button className="ops-button btn-primary" disabled={saving}>{saving ? "Saving…" : "Save client"}</button></div>
  </form></div>;
}

export default function Clients() {
  const { session } = useAuth();
  const [clients, setClients] = useState([]);
  const [editor, setEditor] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const data = await opsApi("/api/ops/clients", session.access_token); setClients(data.clients); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [session.access_token]);
  useEffect(() => { load(); }, [load]);

  async function changeStatus(client, status) {
    try {
      const result = await opsApi("/api/ops/clients", session.access_token, { method: "PATCH", body: jsonBody({ ...client, status }) });
      setClients((current) => current.map((item) => item.id === client.id ? result.client : item));
    } catch (err) { setError(err.message); }
  }
  async function remove(client) {
    if (!window.confirm(`Delete the client record for ${client.business_name}?`)) return;
    try { await opsApi(`/api/ops/clients?id=${encodeURIComponent(client.id)}`, session.access_token, { method: "DELETE" }); setClients((current) => current.filter((item) => item.id !== client.id)); }
    catch (err) { setError(err.message); }
  }
  const activeCount = clients.filter((client) => isActiveClient(client.status)).length;
  const activeMrr = clients.filter((client) => isActiveClient(client.status)).reduce((sum, client) => sum + Number(client.monthly_price || 0), 0);

  return <OperationsLayout active="clients"><main className="ops-page">
    <header className="ops-page-head"><div><p className="ops-eyebrow">Sell · Accounts</p><h1>Clients</h1><p className="ops-subtitle">Track each account through its monthly production cycle.</p></div><button className="ops-button btn-primary" onClick={() => setEditor(null)}>Add client <span aria-hidden="true">+</span></button></header>
    <div className="ops-metrics ops-client-summary"><article className="ops-metric"><span>Active clients</span><strong>{activeCount}</strong></article><article className="ops-metric is-accent"><span>Monthly recurring revenue</span><strong>{money.format(activeMrr)}</strong></article></div>
    {error && <div className="ops-alert" role="alert">{error}</div>}
    {loading ? <p className="ops-loading" role="status">Loading clients…</p> : <div className="ops-client-grid">
      {clients.map((client) => {
        const stageIndex = stages.indexOf(client.status);
        return <article className={`ops-client-card${["paused", "churned"].includes(client.status) ? " is-inactive" : ""}`} key={client.id}>
          <div className="ops-client-card-head"><div><p className="ops-eyebrow">{client.contact || "Client"}</p><h2>{client.business_name}</h2></div><button className="ops-icon-button" onClick={() => setEditor(client)} aria-label={`Edit ${client.business_name}`}>⋯</button></div>
          <div className="ops-client-facts"><span><small>Monthly</small><strong>{money.format(client.monthly_price)}</strong></span><span><small>Started</small><strong>{client.start_date || "—"}</strong></span><span><small>Filming</small><strong>{client.filming_date || "Not set"}</strong></span></div>
          <label className="ops-field">Cycle status<select value={client.status} onChange={(event) => changeStatus(client, event.target.value)}>{CLIENT_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
          {stageIndex >= 0 && <div className="ops-cycle" aria-label={`Monthly cycle stage ${client.status}`}>
            {stages.map((stage, index) => <span key={stage} className={index <= stageIndex ? "is-complete" : ""} title={stage} />)}
          </div>}
          {client.notes && <p className="ops-client-notes">{client.notes}</p>}
          <div className="ops-client-actions"><span className={`ops-status-badge status-${client.status.replaceAll(" ", "-")}`}>{client.status}</span><button onClick={() => remove(client)}>Delete</button></div>
        </article>;
      })}
      {!clients.length && <div className="ops-empty-card"><h2>No clients yet</h2><p>Add the first client to track delivery and recurring revenue.</p><button className="ops-button btn-primary" onClick={() => setEditor(null)}>Add client</button></div>}
    </div>}
    {editor !== undefined && <ClientForm client={editor} token={session.access_token} onClose={() => setEditor(undefined)} onSaved={(client) => { setClients((current) => current.some((item) => item.id === client.id) ? current.map((item) => item.id === client.id ? client : item) : [client, ...current]); setEditor(undefined); }} />}
  </main></OperationsLayout>;
}
