"use client";
import { useCallback, useEffect, useState } from "react";
import { Padlock } from "@/components/ui/Guestbook";
import type { Gold, Note } from "@/lib/guestbook";

/* /admin/locks: approve or reject new locks, remove old ones, set the gold lock's message.
   Needs GUESTBOOK_ADMIN_TOKEN (set in Vercel); the token is only kept for this browser tab. */
type Data = { pending: Note[]; approved: Note[]; gold: Gold };

export default function LockAdmin() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [goldName, setGoldName] = useState("");
  const [goldText, setGoldText] = useState("");

  const load = useCallback(async (t: string) => {
    setBusy(true); setMsg("");
    try {
      const res = await fetch("/api/guestbook/admin", { headers: { "x-admin-token": t }, cache: "no-store" });
      const j = await res.json();
      if (!res.ok) { setData(null); setMsg(j.error || "Couldn't load."); return; }
      setData(j as Data);
      setGoldName((j as Data).gold.name); setGoldText((j as Data).gold.text);
      try { sessionStorage.setItem("lock-admin-token", t); } catch { /* storage can be blocked */ }
    } catch { setMsg("Couldn't reach the server."); } finally { setBusy(false); }
  }, []);

  useEffect(() => {
    try { const t = sessionStorage.getItem("lock-admin-token"); if (t) { setToken(t); void load(t); } } catch { /* ignore */ }
  }, [load]);

  async function act(action: string, id?: string) {
    setBusy(true); setMsg("");
    try {
      const body = action === "gold" ? { action, name: goldName, text: goldText } : { action, id };
      const res = await fetch("/api/guestbook/admin", { method: "POST", headers: { "x-admin-token": token, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) setMsg(j.error || "Couldn't do that.");
      else { setMsg(action === "gold" ? "Gold lock updated." : "Done."); await load(token); }
    } catch { setMsg("Couldn't reach the server."); } finally { setBusy(false); }
  }

  const row = (n: Note, actions: React.ReactNode) => (
    <li key={n.id} className="f-card flex items-start gap-4" style={{ padding: 14 }}>
      <div className="w-12 shrink-0"><Padlock color={n.color} shape={n.shape} initial={(n.name.trim()[0] || "·").toUpperCase()} /></div>
      <div className="min-w-0 flex-1">
        <p className="f-type break-words text-[15px]">{n.text}</p>
        <p className="f-mono mt-1 text-[var(--muted)]">{n.name}{n.city ? ` · ${n.city}` : ""} · {new Date(n.at).toLocaleString()}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
    </li>
  );

  return (
    <main className="f-wrap min-h-screen pb-24 pt-16 text-[var(--ink)]" style={{ background: "var(--paper)" }}>
      <p className="f-hand text-3xl text-[var(--blue)]">owner only</p>
      <h1 className="f-h1 mt-1"><span className="f-mark">lock wall admin</span></h1>

      <form className="mt-8 flex max-w-xl flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); void load(token); }}>
        <label className="sr-only" htmlFor="tok">Admin token</label>
        <input id="tok" type="password" autoComplete="off" className="f-input f-type min-w-0 flex-1" placeholder="admin token" value={token} onChange={(e) => setToken(e.target.value)} />
        <button type="submit" className="f-btn f-btn-butter" disabled={busy || !token}>{data ? "refresh" : "open"}</button>
      </form>
      {msg && <p role="status" className="f-type mt-3 text-sm">{msg}</p>}

      {data && (
        <div className="mt-10 grid gap-10">
          <section>
            <h2 className="f-h2">waiting for approval ({data.pending.length})</h2>
            <ul className="mt-4 grid gap-3">
              {data.pending.length === 0 && <li className="f-type text-[var(--muted)]">Nothing waiting. New locks will show up here.</li>}
              {data.pending.map((n) => row(n, <>
                <button type="button" className="f-btn f-btn-butter" disabled={busy} onClick={() => act("approve", n.id)}>approve</button>
                <button type="button" className="f-btn" disabled={busy} onClick={() => act("reject", n.id)}>reject</button>
              </>))}
            </ul>
          </section>

          <section>
            <h2 className="f-h2">the gold lock</h2>
            <p className="f-type mt-2 text-sm text-[var(--muted)]">Pinned at the top of the wall. Clear the message and save to go back to the default.</p>
            <div className="mt-4 grid max-w-xl gap-3">
              <input className="f-input f-type" aria-label="Gold lock name" maxLength={30} value={goldName} onChange={(e) => setGoldName(e.target.value)} placeholder="name" />
              <textarea className="f-input f-type resize-none" aria-label="Gold lock message" rows={3} maxLength={300} value={goldText} onChange={(e) => setGoldText(e.target.value)} placeholder="message for everyone" />
              <div><button type="button" className="f-btn f-btn-butter" disabled={busy} onClick={() => act("gold")}>save gold lock</button></div>
            </div>
          </section>

          <section>
            <h2 className="f-h2">on the wall ({data.approved.length})</h2>
            <ul className="mt-4 grid gap-3">
              {data.approved.length === 0 && <li className="f-type text-[var(--muted)]">No approved locks yet.</li>}
              {data.approved.map((n) => row(n, <button type="button" className="f-btn" disabled={busy} onClick={() => act("remove", n.id)}>remove</button>))}
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}
