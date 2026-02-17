"use client";
import { useState, useEffect, useMemo } from "react";

const SUPABASE_URL = "https://qzmoehelrxywbfbyyqqq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6bW9laGVscnh5d2JmYnl5cXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4OTgzNzEsImV4cCI6MjA4NjQ3NDM3MX0.lZrmreBmM9Md2OXb9En4GOOCjGs2-06FPdaKzOjAP18";
const hdrs = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const MAX_TEMP_DAYS = 540;

async function supaGet(t, q = "") { const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?${q}`, { headers: hdrs }); if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); }
async function supaPatch(t, q, b) { const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?${q}`, { method: "PATCH", headers: { ...hdrs, Prefer: "return=representation" }, body: JSON.stringify(b) }); if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); }

const DEMO = {
  client: { client_name: "Logística Norte S.L.", contact_name: "María García", status: "pending" },
  workers: [
    { worker_id: "1", name: "Carlos Pérez López", role: "Operario de almacén", site: "Nave Central", start_date: "2024-03-15", end_date: "2026-02-28", decision: null, identifier: "EMP-2024-001", email: "carlos.perez@email.com", phone: "612345678", shift: "Mañana", probation_period: 0, contract_code: "CT-2024-0156", weekly_hours: 40, contract_status: "Activo", call_status: "Confirmado", temporality: 320, deadline: "2026-03-15", leave_type: null, leave_start: null, leave_end: null },
    { worker_id: "2", name: "Ana Martínez Ruiz", role: "Carretillera", site: "Nave Central", start_date: "2024-06-01", end_date: "2026-03-05", decision: null, identifier: "EMP-2024-002", email: "ana.martinez@email.com", phone: "623456789", shift: "Tarde", probation_period: 0, contract_code: "CT-2024-0203", weekly_hours: 40, contract_status: "Activo", call_status: "Confirmado", temporality: 210, deadline: "2026-03-20", leave_type: null, leave_start: null, leave_end: null },
    { worker_id: "3", name: "Jorge Sánchez Vega", role: "Mozo de carga", site: "Plataforma Sur", start_date: "2025-01-10", end_date: "2026-02-20", decision: null, identifier: "EMP-2025-003", email: "jorge.sanchez@email.com", phone: "634567890", shift: "Mañana", probation_period: 18, contract_code: "CT-2025-0012", weekly_hours: 30, contract_status: "Activo", call_status: "Pendiente", temporality: 45, deadline: "2026-03-01", leave_type: "IT", leave_start: "2026-02-01", leave_end: "2026-02-15" },
    { worker_id: "4", name: "Lucía Fernández Díaz", role: "Operaria de picking", site: "Nave Central", start_date: "2024-09-22", end_date: "2026-03-10", decision: null, identifier: "EMP-2024-004", email: "lucia.fernandez@email.com", phone: "645678901", shift: "Noche", probation_period: 0, contract_code: "CT-2024-0298", weekly_hours: 40, contract_status: "Activo", call_status: "Confirmado", temporality: 490, deadline: null, leave_type: null, leave_start: null, leave_end: null },
    { worker_id: "5", name: "Mohamed El Amrani", role: "Operario de almacén", site: "Plataforma Sur", start_date: "2024-11-04", end_date: "2026-02-25", decision: null, identifier: "EMP-2024-005", email: "mohamed.amrani@email.com", phone: "656789012", shift: "Mañana", probation_period: 5, contract_code: "CT-2024-0267", weekly_hours: 35, contract_status: "Activo", call_status: "Confirmado", temporality: 530, deadline: "2026-03-10", leave_type: "Maternidad", leave_start: "2026-01-15", leave_end: "2026-04-15" },
  ],
};

const ACTIONS = [
  { v: "renovar", l: "✅ Renovar", c: "text-emerald-700 border-emerald-300", cBg: "bg-emerald-50", r: "ring-emerald-300", cardBg: "bg-emerald-50 border-emerald-200" },
  { v: "no_renovar", l: "❌ No renovar", c: "text-red-700 border-red-300", cBg: "bg-red-50", r: "ring-red-300", cardBg: "bg-red-50 border-red-200" },
  { v: "sustituir", l: "🔄 Sustituir", c: "text-amber-700 border-amber-300", cBg: "bg-amber-50", r: "ring-amber-300", cardBg: "bg-amber-50 border-amber-200" },
];

function daysUntil(d) { return Math.ceil((new Date(d) - new Date()) / 86400000); }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString("es-ES") : "—"; }

function Badge({ endDate }) {
  const d = daysUntil(endDate);
  const c = d <= 7 ? "bg-red-100 text-red-700" : d <= 14 ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700";
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c}`}>{d} días</span>;
}

function StatusPill({ value }) {
  if (!value && value !== 0) return <span className="text-gray-400">—</span>;
  const colors = { "Activo": "bg-teal-100 text-teal-700", "Confirmado": "bg-teal-100 text-teal-700", "Pendiente": "bg-amber-100 text-amber-700", "Inactivo": "bg-red-100 text-red-700" };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[value] || "bg-gray-100 text-gray-600"}`}>{value}</span>;
}

function ProbationPill({ days }) {
  if (days == null) return <span className="text-gray-400">—</span>;
  if (days === 0) return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">✅ Superado</span>;
  const c = days <= 7 ? "bg-red-100 text-red-700" : days <= 15 ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700";
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c}`}>⏳ {days} días restantes</span>;
}

function DetailField({ label, value, pill }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      {pill ? <StatusPill value={value} /> : <span className="text-sm text-gray-700 font-medium">{value || "—"}</span>}
    </div>
  );
}

function TempBar({ days }) {
  if (days == null) return null;
  const pct = Math.min((days / MAX_TEMP_DAYS) * 100, 100);
  const remaining = MAX_TEMP_DAYS - days;
  const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-teal-500";
  const textColor = pct >= 90 ? "text-red-700" : pct >= 70 ? "text-amber-700" : "text-teal-700";
  return (
    <div className="mt-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Días trabajados acumulados</span>
        <span className={`text-xs font-bold ${textColor}`}>{days}/{MAX_TEMP_DAYS} días ({Math.round(pct)}%)</span>
      </div>
      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-0.5">
        {remaining > 0 ? `Quedan ${remaining} días disponibles` : "⚠️ Límite de temporalidad alcanzado"}
      </p>
    </div>
  );
}

function WorkerDetail({ w }) {
  return (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="col-span-2 sm:col-span-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">📧 Contacto</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <DetailField label="Email" value={w.email} />
            <DetailField label="Teléfono" value={w.phone} />
            <DetailField label="Ubicación" value={w.site} />
          </div>
        </div>
        <div className="col-span-2 sm:col-span-3 mt-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">📋 Contrato</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <DetailField label="Código contrato" value={w.contract_code} />
            <DetailField label="Horas semanales" value={w.weekly_hours ? `${w.weekly_hours}h/sem` : null} />
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Periodo de prueba</span>
              <div><ProbationPill days={w.probation_period} /></div>
            </div>
            <DetailField label="Fecha inicio" value={fmtDate(w.start_date)} />
          </div>
        </div>
        <div className="col-span-2 sm:col-span-3 mt-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">⏳ Temporalidad</p>
          <TempBar days={w.temporality} />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <DetailField label="Fecha tope" value={fmtDate(w.deadline)} />
            {w.deadline && <DetailField label="Días hasta tope" value={`${daysUntil(w.deadline)} días`} />}
          </div>
        </div>
        <div className="col-span-2 sm:col-span-3 mt-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">📊 Estado</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <DetailField label="Status contrato" value={w.contract_status} pill />
            <DetailField label="Status llamamiento" value={w.call_status} pill />
          </div>
        </div>
        {w.leave_type && (
          <div className="col-span-2 sm:col-span-3 mt-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">🏥 Baja</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <DetailField label="Tipo de baja" value={w.leave_type} />
              <DetailField label="Inicio baja" value={fmtDate(w.leave_start)} />
              <DetailField label="Fin baja" value={fmtDate(w.leave_end)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Screen({ iconBg, icon, title, sub, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
        <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>{icon}</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-500 text-sm mb-4">{sub}</p>
        {children}
      </div>
    </div>
  );
}

const CheckIcon = <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const ErrorIcon = <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const DoneIcon = <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ChevronDown = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const ChevronUp = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [client, setClient] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [dec, setDec] = useState({});
  const [subs, setSubs] = useState({});
  const [subExp, setSubExp] = useState(null);
  const [detailExp, setDetailExp] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [demo, setDemo] = useState(false);
  const [selectedSite, setSelectedSite] = useState("all");

  useEffect(() => {
    async function load() {
      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) { setClient(DEMO.client); setWorkers(DEMO.workers); setDemo(true); setLoading(false); return; }
      try {
        const [cl, wk] = await Promise.all([
          supaGet("clients", `token=eq.${encodeURIComponent(token)}`),
          supaGet("workers", `token=eq.${encodeURIComponent(token)}&order=end_date.asc`),
        ]);
        if (!cl.length) { setError("Enlace no válido o expirado"); setLoading(false); return; }
        if (new Date(cl[0].expires_at) < new Date()) { setError("Este enlace ha expirado"); setLoading(false); return; }
        setClient(cl[0]); setWorkers(wk);
        const d = {}, s = {};
        wk.forEach(w => { if (w.decision) d[w.worker_id] = w.decision; if (w.substitute_profile) s[w.worker_id] = w.substitute_profile; });
        setDec(d); setSubs(s);
      } catch { setError("Error de conexión. Inténtalo más tarde."); }
      setLoading(false);
    }
    load();
  }, []);

  const sites = useMemo(() => [...new Set(workers.map(w => w.site).filter(Boolean))].sort(), [workers]);
  const filtered = useMemo(() => selectedSite === "all" ? workers : workers.filter(w => w.site === selectedSite), [workers, selectedSite]);

  const pick = (wid, val) => {
    setDec(p => ({ ...p, [wid]: val }));
    if (val === "sustituir") setSubExp(wid);
    else { if (subExp === wid) setSubExp(null); setSubs(p => { const n = { ...p }; delete n[wid]; return n; }); }
  };

  const toggleDetail = (wid) => setDetailExp(p => ({ ...p, [wid]: !p[wid] }));

  const submit = async () => {
    if (demo) { setSent(true); return; }
    setSending(true);
    const token = new URLSearchParams(window.location.search).get("token");
    try {
      const now = new Date().toISOString();
      await Promise.all(workers.map(w =>
        supaPatch("workers", `token=eq.${encodeURIComponent(token)}&worker_id=eq.${encodeURIComponent(w.worker_id)}`, {
          decision: dec[w.worker_id], substitute_profile: subs[w.worker_id] || null, decided_at: now,
        })
      ));
      await supaPatch("clients", `token=eq.${encodeURIComponent(token)}`, { status: "completed" });
      setSent(true);
    } catch { alert("Error al guardar. Inténtalo de nuevo."); }
    setSending(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-white to-teal-50 flex items-center justify-center">
      <div className="text-center"><div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" /><p className="text-sm text-gray-500">Cargando...</p></div>
    </div>
  );
  if (error) return <Screen iconBg="bg-red-100" icon={ErrorIcon} title="Enlace no válido" sub={error} />;
  if (client?.status === "completed" && !sent) return <Screen iconBg="bg-teal-100" icon={DoneIcon} title="Ya has respondido" sub={`Las decisiones para ${client.client_name} ya fueron enviadas.`} />;
  if (sent) return (
    <Screen iconBg="bg-teal-100" icon={CheckIcon} title="¡Decisiones enviadas!" sub={`Hemos recibido tus indicaciones para ${workers.length} trabajadores.`}>
      <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
        {workers.map(w => { const a = ACTIONS.find(x => x.v === dec[w.worker_id]); return <div key={w.worker_id} className="flex items-center justify-between text-sm"><span className="text-gray-700 font-medium">{w.name}</span><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a?.cBg || ""} ${a?.c || ""}`}>{a?.l}</span></div>; })}
      </div>
    </Screen>
  );

  const allDone = workers.every(w => dec[w.worker_id]);
  const doneN = workers.filter(w => dec[w.worker_id]).length;
  const filteredDone = filtered.filter(w => dec[w.worker_id]).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-teal-50">
      {demo && <div className="bg-orange-400 text-white text-center py-2 text-xs font-semibold">⚡ MODO DEMO — Usa ?token=demo123 para probar con datos reales</div>}

      {/* Header - negro J&T */}
      <div className="bg-neutral-900 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-lg tracking-tight">job&talent</span>
            <div className="h-5 w-px bg-neutral-700" />
            <div>
              <p className="text-white text-sm font-medium leading-tight">Renovación de contratos</p>
              <p className="text-neutral-400 text-xs">{client.client_name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-neutral-400 text-xs">Decisiones</div>
            <div className="text-white text-sm font-bold">{doneN}/{workers.length}</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Intro - teal J&T */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-teal-800">Hola <strong>{client.contact_name}</strong>, los siguientes trabajadores tienen su contrato próximo a finalizar. Indica qué acción deseas para cada uno.</p>
        </div>

        {/* Site filter */}
        {sites.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button onClick={() => setSelectedSite("all")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${selectedSite === "all" ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
              Todos los sites ({workers.length})
            </button>
            {sites.map(s => {
              const count = workers.filter(w => w.site === s).length;
              const sd = workers.filter(w => w.site === s && dec[w.worker_id]).length;
              return (
                <button key={s} onClick={() => setSelectedSite(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${selectedSite === s ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                  📍 {s} ({sd}/{count})
                  {sd === count && <span className="text-teal-400">✓</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Progress - teal */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{selectedSite === "all" ? "Progreso total" : `Progreso: ${selectedSite}`}</span>
            <span>{selectedSite === "all" ? `${doneN}/${workers.length}` : `${filteredDone}/${filtered.length}`}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${((selectedSite === "all" ? doneN : filteredDone) / (selectedSite === "all" ? workers.length : filtered.length)) * 100}%` }} />
          </div>
        </div>

        {/* Worker cards */}
        <div className="space-y-3">
          {filtered.map(w => {
            const act = dec[w.worker_id] || "";
            const actObj = ACTIONS.find(a => a.v === act);
            const showDetail = detailExp[w.worker_id];
            const showSub = subExp === w.worker_id && act === "sustituir";
            const bg = actObj ? actObj.cardBg : "bg-white border-gray-200";

            return (
              <div key={w.worker_id} className={`rounded-xl border ${bg} transition-all duration-300 overflow-hidden`}>
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{w.name}</h3>
                        <Badge endDate={w.end_date} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                        <span>🆔 {w.identifier || w.worker_id}</span>
                        <span>{w.role}</span>
                        <span>🕐 {w.shift || "—"}</span>
                        <span>📍 {w.site}</span>
                        <span>Fin: {fmtDate(w.end_date)}</span>
                      </div>
                      <button onClick={() => toggleDetail(w.worker_id)} className="flex items-center gap-1 mt-2 text-xs text-teal-600 hover:text-teal-800 font-medium cursor-pointer">
                        {showDetail ? ChevronUp : ChevronDown}
                        {showDetail ? "Ocultar detalle" : "Ver detalle"}
                      </button>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {ACTIONS.map(o => {
                        const sel = act === o.v;
                        const cls = sel ? `${o.cBg} ${o.c} border-current ring-2 ring-offset-1 ${o.r}` : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50";
                        return <button key={o.v} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer ${cls}`} onClick={() => pick(w.worker_id, o.v)}>{o.l}</button>;
                      })}
                    </div>
                  </div>
                </div>

                {showDetail && <WorkerDetail w={w} />}

                {showSub && (
                  <div className="border-t border-amber-200 px-4 py-3">
                    <label className="text-xs font-semibold text-amber-800 mb-1.5 block">Describe el perfil del sustituto:</label>
                    <textarea className="w-full border border-amber-200 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" rows={2} placeholder="Ej: Carretillero/a con experiencia mínima 1 año, turno de mañana..." value={subs[w.worker_id] || ""} onChange={e => setSubs(p => ({ ...p, [w.worker_id]: e.target.value }))} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit - negro J&T */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button onClick={submit} disabled={!allDone || sending} className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${allDone && !sending ? "bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg hover:shadow-xl cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
            {sending ? "Enviando..." : allDone ? "Confirmar decisiones" : `Faltan ${workers.length - doneN} por decidir`}
          </button>
          {!allDone && <p className="text-xs text-gray-400">Debes decidir sobre todos los trabajadores de todos los sites</p>}
        </div>
        <p className="text-center text-xs text-gray-300 mt-8 pb-6">Enlace válido durante 7 días · Job&Talent © 2026</p>
      </div>
    </div>
  );
}