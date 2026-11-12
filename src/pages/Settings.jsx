import OperationsLayout from "../components/OperationsLayout";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { session } = useAuth();
  return <OperationsLayout active="settings"><main className="ops-page">
    <header className="ops-page-head"><div><p className="ops-eyebrow">Workspace</p><h1>Settings</h1><p className="ops-subtitle">Internal operations access and reporting preferences.</p></div></header>
    <section className="ops-panel ops-settings-panel"><p className="ops-eyebrow">Signed-in account</p><h2>{session?.user?.email || "Workspace member"}</h2><p>Weekly reporting uses America/Los_Angeles time and starts on Monday.</p><p>Workspace roles are managed in the Supabase operations membership table.</p></section>
  </main></OperationsLayout>;
}
