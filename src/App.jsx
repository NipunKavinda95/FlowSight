import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

// ── Constants ──────────────────────────────────────────────────────────────────
const HISTORY_LEN = 40;
const TICK_MS     = 1200;

const LINES = {
  "Line 1": [
    { id: "C-01", label: "Infeed Belt",    zone: "Zone A", nominalSpeed: 72, nominalTemp: 38 },
    { id: "C-02", label: "Assembly Line",  zone: "Zone B", nominalSpeed: 65, nominalTemp: 52 },
    { id: "C-03", label: "Quality Check",  zone: "Zone C", nominalSpeed: 58, nominalTemp: 44 },
    { id: "C-04", label: "Outfeed / Pack", zone: "Zone D", nominalSpeed: 70, nominalTemp: 36 },
  ],
  "Line 2": [
    { id: "C-01", label: "Press Feed",     zone: "Zone A", nominalSpeed: 68, nominalTemp: 42 },
    { id: "C-02", label: "Stamping",       zone: "Zone B", nominalSpeed: 60, nominalTemp: 58 },
    { id: "C-03", label: "Deburring",      zone: "Zone C", nominalSpeed: 55, nominalTemp: 46 },
    { id: "C-04", label: "Packing",        zone: "Zone D", nominalSpeed: 65, nominalTemp: 34 },
  ],
  "Line 3": [
    { id: "C-01", label: "Raw Intake",     zone: "Zone A", nominalSpeed: 75, nominalTemp: 36 },
    { id: "C-02", label: "Welding",        zone: "Zone B", nominalSpeed: 62, nominalTemp: 65 },
    { id: "C-03", label: "Coating",        zone: "Zone C", nominalSpeed: 50, nominalTemp: 55 },
    { id: "C-04", label: "Dispatch",       zone: "Zone D", nominalSpeed: 72, nominalTemp: 33 },
  ],
};

const SHIFTS = [
  { name: "Morning",   start: "06:00", end: "14:00" },
  { name: "Afternoon", start: "14:00", end: "22:00" },
  { name: "Night",     start: "22:00", end: "06:00" },
];

const STATUS = { RUNNING: "RUNNING", FAULT: "FAULT", STOPPED: "STOPPED" };
const SC     = { RUNNING: "#00e5a0", FAULT: "#ff4d4d", STOPPED: "#7a8494" };

// ── Helpers ────────────────────────────────────────────────────────────────────
const rand = (base, spread) => +(base + (Math.random() - 0.5) * spread * 2).toFixed(1);

function initConveyor(cfg) {
  return {
    ...cfg,
    status: STATUS.RUNNING,
    speed: cfg.nominalSpeed, temp: cfg.nominalTemp,
    vibration: rand(1.2, 0.4), current: rand(14, 3),
    partsPerMin: rand(22, 4),  uptime: rand(97, 2),
    history: Array.from({ length: HISTORY_LEN }, () => ({
      speed: rand(cfg.nominalSpeed, 3),
      temp:  rand(cfg.nominalTemp, 2),
    })),
  };
}

function tickConveyor(c) {
  if (c.status === STATUS.STOPPED) {
    // Freeze all sensor readings at last values — speed/temp/vibr/amps stay as-is
    // partsPerMin = 0 because line not producing
    return { ...c, partsPerMin: 0 };
  }
  const f = c.status === STATUS.FAULT;
  const speed = f ? rand(c.speed, 15)       : rand(c.nominalSpeed, 4);
  const temp  = f ? rand(c.temp + 10, 8)    : rand(c.nominalTemp, 2);
  return {
    ...c, speed, temp,
    vibration:   f ? rand(3.8, 1.2) : rand(1.2, 0.4),
    current:     f ? rand(22, 4)    : rand(14, 3),
    // FAULT reduces throughput but line still physically moves — not zero
    partsPerMin: f ? rand(10, 5)    : rand(22, 4),
    history: [...c.history.slice(1), { speed, temp }],
  };
}

function shiftProgress(shiftCfg) {
  // returns 0-1 how far through the shift we are
  const now   = new Date();
  const [sh, sm] = shiftCfg.start.split(":").map(Number);
  const [eh, em] = shiftCfg.end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin   = eh * 60 + em;
  const nowMin   = now.getHours() * 60 + now.getMinutes();
  let duration   = endMin > startMin ? endMin - startMin : 1440 - startMin + endMin;
  let elapsed    = nowMin >= startMin ? nowMin - startMin : 1440 - startMin + nowMin;
  if (elapsed > duration) elapsed = duration;
  return { elapsed, duration, ratio: elapsed / duration };
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
      padding: "3px 10px", borderRadius: 20,
      background: SC[status] + "22", color: SC[status],
      border: `1px solid ${SC[status]}44`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: SC[status],
        boxShadow: status === STATUS.RUNNING ? `0 0 6px ${SC[status]}` : "none",
        animation: status === STATUS.RUNNING ? "cPulse 1.8s ease-in-out infinite" : "none",
      }} />
      {status}
    </span>
  );
}

function Sparkline({ data, dataKey, color }) {
  return (
    <ResponsiveContainer width="100%" height={38}>
      <AreaChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={`g-${dataKey}-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5}
          fill={`url(#g-${dataKey}-${color.replace("#","")})`}
          dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function Metric({ label, value, unit, warn, crit }) {
  const v = parseFloat(value);
  const color = v >= crit ? "#ff4d4d" : v >= warn ? "#f0b429" : "#00e5a0";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "#4a5568", marginBottom: 2, letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>
        {value}<span style={{ fontSize: 10, marginLeft: 2, color: "#4a5568" }}>{unit}</span>
      </div>
    </div>
  );
}

function OEEGauge({ value }) {
  const r = 44, cx = 56, cy = 56, circ = 2 * Math.PI * r;
  const color = value >= 85 ? "#00e5a0" : value >= 70 ? "#f0b429" : "#ff4d4d";
  return (
    <svg width={112} height={112}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2235" strokeWidth={10} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${circ * Math.min(value / 100, 1)} ${circ}`}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 0.6s ease", filter: `drop-shadow(0 0 6px ${color}88)` }} />
      <text x={cx} y={cy - 6} textAnchor="middle" fill={color} fontSize={22} fontWeight={700} fontFamily="IBM Plex Mono,monospace">{value.toFixed(1)}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#4a5568" fontSize={10} letterSpacing={2}>OEE %</text>
    </svg>
  );
}

function ConveyorCard({ c, onToggleFault, onToggleStop }) {
  const isFault   = c.status === STATUS.FAULT;
  const isStopped = c.status === STATUS.STOPPED;
  return (
    <div style={{
      background: "#0f1520", border: `1px solid ${SC[c.status]}33`,
      borderRadius: 12, padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 10,
      boxShadow: isFault ? `0 0 18px ${SC[c.status]}18` : "none",
      transition: "all 0.4s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: "0.1em", marginBottom: 2 }}>{c.zone} · {c.id}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", fontFamily: "IBM Plex Mono,monospace" }}>{c.label}</div>
        </div>
        <StatusPill status={c.status} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6,
        background: "#080d14", borderRadius: 8, padding: "9px 4px" }}>
        <Metric label="SPEED"   value={c.speed.toFixed(0)}    unit="m/min" warn={80}  crit={90} />
        <Metric label="TEMP"    value={c.temp.toFixed(1)}     unit="°C"    warn={60}  crit={72} />
        <Metric label="VIBR"    value={c.vibration.toFixed(2)}unit="g"     warn={2.5} crit={4}  />
        <Metric label="AMPS"    value={c.current.toFixed(1)}  unit="A"     warn={20}  crit={25} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: 9, color: "#4a5568", marginBottom: 2, letterSpacing: "0.06em" }}>SPEED TREND</div>
          <Sparkline data={c.history} dataKey="speed" color="#38bdf8" />
        </div>
        <div>
          <div style={{ fontSize: 9, color: "#4a5568", marginBottom: 2, letterSpacing: "0.06em" }}>TEMP TREND</div>
          <Sparkline data={c.history} dataKey="temp" color="#fb923c" />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, color: "#4a5568" }}>
          <span style={{ color: "#00e5a0" }}>{c.partsPerMin.toFixed(1)}</span> pcs/min ·{" "}
          <span style={{ color: "#38bdf8" }}>{c.uptime.toFixed(1)}%</span> uptime
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[
            { label: isFault   ? "CLEAR FAULT" : "INJECT FAULT", active: isFault,   color: "#ff4d4d", onClick: () => onToggleFault(c.id) },
            { label: isStopped ? "RESTART"     : "STOP",         active: isStopped, color: "#f0b429", onClick: () => onToggleStop(c.id)  },
          ].map(b => (
            <button key={b.label} onClick={b.onClick} style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
              padding: "3px 9px", borderRadius: 5, cursor: "pointer",
              background: b.active ? b.color + "22" : "transparent",
              border: `1px solid ${b.active ? b.color + "88" : "#2a3448"}`,
              color: b.active ? b.color : "#4a5568",
            }}>{b.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shift Settings Modal ───────────────────────────────────────────────────────
function ShiftModal({ settings, onSave, onClose }) {
  const [form, setForm] = useState({ ...settings });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "#0f1520", border: "1px solid #2a3448", borderRadius: 14,
        padding: "24px 28px", width: 380, maxWidth: "95vw",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", color: "#e2e8f0", marginBottom: 20 }}>
          ⚙ SHIFT SETTINGS
        </div>

        {[
          { label: "PRODUCTION LINE", key: "line", type: "select", options: Object.keys(LINES) },
          { label: "SHIFT",           key: "shift", type: "select", options: SHIFTS.map(s => s.name) },
          { label: "OPERATOR / TEAM", key: "operator", type: "text",   placeholder: "e.g. Team A" },
          { label: "SHIFT TARGET (pcs)", key: "target", type: "number", placeholder: "e.g. 8400" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "#4a5568", letterSpacing: "0.1em", marginBottom: 5 }}>{f.label}</div>
            {f.type === "select" ? (
              <select value={form[f.key]} onChange={e => set(f.key, e.target.value)} style={{
                width: "100%", background: "#080d14", border: "1px solid #2a3448",
                borderRadius: 7, padding: "8px 10px", color: "#e2e8f0", fontSize: 13,
              }}>
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                onChange={e => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                style={{
                  width: "100%", background: "#080d14", border: "1px solid #2a3448",
                  borderRadius: 7, padding: "8px 10px", color: "#e2e8f0", fontSize: 13,
                }} />
            )}
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "9px", borderRadius: 8, cursor: "pointer",
            background: "transparent", border: "1px solid #2a3448", color: "#4a5568", fontSize: 12,
          }}>CANCEL</button>
          <button onClick={() => { onSave(form); onClose(); }} style={{
            flex: 2, padding: "9px", borderRadius: 8, cursor: "pointer",
            background: "#00e5a022", border: "1px solid #00e5a066", color: "#00e5a0",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
          }}>SAVE SETTINGS</button>
        </div>
      </div>
    </div>
  );
}

// ── Fault History Log ──────────────────────────────────────────────────────────
function FaultLog({ log }) {
  if (!log.length) return (
    <div style={{ fontSize: 12, color: "#00e5a044", padding: "12px 0", textAlign: "center" }}>
      No fault events recorded this session
    </div>
  );
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr>{["TIME", "CONVEYOR", "ZONE", "FAULT CODE", "STATUS"].map(h => (
            <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontSize: 9,
              color: "#4a5568", letterSpacing: "0.1em", borderBottom: "1px solid #1a2235" }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {log.slice().reverse().map((e, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #0f1520" }}>
              <td style={{ padding: "6px 10px", color: "#4a5568", fontFamily: "IBM Plex Mono,monospace", fontSize: 10 }}>{e.time}</td>
              <td style={{ padding: "6px 10px", color: "#e2e8f0", fontFamily: "IBM Plex Mono,monospace" }}>{e.id}</td>
              <td style={{ padding: "6px 10px", color: "#4a5568" }}>{e.zone}</td>
              <td style={{ padding: "6px 10px" }}>
                <span style={{ background: "#ff4d4d18", border: "1px solid #ff4d4d33",
                  color: "#ff8080", padding: "1px 7px", borderRadius: 10, fontSize: 10,
                  fontFamily: "IBM Plex Mono,monospace" }}>{e.code}</span>
              </td>
              <td style={{ padding: "6px 10px" }}>
                <span style={{ color: e.cleared ? "#00e5a0" : "#f0b429", fontSize: 10 }}>
                  {e.cleared ? "✓ Cleared" : "⚠ Active"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── CSV Export ─────────────────────────────────────────────────────────────────
function exportCSV(conveyors, faultLog, settings) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");

  // Sensor snapshot
  const sensorRows = [
    ["CONVEYOR SENSOR SNAPSHOT", `Exported: ${new Date().toLocaleString()}`],
    ["Line", settings.line, "Shift", settings.shift, "Operator", settings.operator],
    [],
    ["ID", "Label", "Zone", "Status", "Speed (m/min)", "Temp (°C)", "Vibration (g)", "Current (A)", "Parts/min", "Uptime %"],
    ...conveyors.map(c => [c.id, c.label, c.zone, c.status,
      c.speed.toFixed(1), c.temp.toFixed(1), c.vibration.toFixed(2),
      c.current.toFixed(1), c.partsPerMin.toFixed(1), c.uptime.toFixed(1)]),
    [],
    ["FAULT LOG"],
    ["Time", "Conveyor ID", "Zone", "Fault Code", "Cleared"],
    ...faultLog.map(e => [e.time, e.id, e.zone, e.code, e.cleared ? "Yes" : "No"]),
  ];

  const csv = sensorRows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `flowsight-export-${ts}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function FlowSight() {
  const [settings, setSettings] = useState({
    line: "Line 1", shift: "Morning", operator: "Team A", target: 8400,
  });
  const [conveyors,   setConveyors]   = useState(() => LINES["Line 1"].map(initConveyor));
  const [simRunning,  setSimRunning]  = useState(true);
  const [totalPcs,    setTotalPcs]    = useState(0);
  const [now,         setNow]         = useState(new Date());
  const [showModal,   setShowModal]   = useState(false);
  const [faultLog,    setFaultLog]    = useState([]);

  // sessionStart is set ONCE on mount — never reassigned in render body
  const sessionStart = useRef(Date.now());
  const prevFaults   = useRef(new Set());

  // Reset only when production LINE changes
  useEffect(() => {
    setConveyors(LINES[settings.line].map(initConveyor));
    setTotalPcs(0);
    sessionStart.current = Date.now();
    setFaultLog([]);
    prevFaults.current = new Set();
  }, [settings.line]);

  // Simulation tick
  useEffect(() => {
    if (!simRunning) return;
    const id = setInterval(() => {
      setNow(new Date());
      setConveyors(cs => {
        const next = cs.map(tickConveyor);

        // ── Produced count ──────────────────────────────────────────────────────
        // STOPPED conveyor = line breaks → 0 output that tick
        // FAULT conveyor   = reduced but non-zero output (degraded throughput)
        // Output resumes exactly where it left off once fault is cleared
        const anyStoppedNext  = next.some(c => c.status === STATUS.STOPPED);
        const lineOutputNext  = anyStoppedNext
          ? 0
          : Math.min(...next.map(c => c.partsPerMin));
        const tickMin = TICK_MS / 60000;
        setTotalPcs(prev => prev + lineOutputNext * tickMin); // always ACCUMULATE, never reset

        // ── Fault detection ─────────────────────────────────────────────────────
        next.forEach(c => {
          if (c.status === STATUS.FAULT && !prevFaults.current.has(c.id)) {
            prevFaults.current.add(c.id);
            setFaultLog(fl => [...fl.slice(-49), {
              time: new Date().toLocaleTimeString("en-GB"),
              id: c.id, zone: c.zone,
              code: "E_OVERTEMP", cleared: false,
            }]);
          }
          if (c.status !== STATUS.FAULT) prevFaults.current.delete(c.id);
        });

        // Mark cleared faults in log
        setFaultLog(fl => fl.map(e => ({
          ...e,
          cleared: e.cleared || !next.find(c => c.id === e.id && c.status === STATUS.FAULT),
        })));

        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [simRunning]);

  const toggleFault = id => setConveyors(cs => cs.map(c =>
    c.id !== id ? c : { ...c, status: c.status === STATUS.FAULT ? STATUS.RUNNING : STATUS.FAULT }
  ));
  const toggleStop  = id => setConveyors(cs => cs.map(c =>
    c.id !== id ? c : { ...c, status: c.status === STATUS.STOPPED ? STATUS.RUNNING : STATUS.STOPPED }
  ));

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const runningCount = conveyors.filter(c => c.status === STATUS.RUNNING).length;
  const faultCount   = conveyors.filter(c => c.status === STATUS.FAULT).length;
  const anyStopped   = conveyors.some(c => c.status === STATUS.STOPPED);
  // STOPPED = line physically broken → 0 pcs/min displayed
  // FAULT   = degraded throughput (bottleneck still applies, but lower partsPerMin)
  const lineOutput   = anyStopped
    ? 0
    : Math.min(...conveyors.map(c => c.partsPerMin));
  const avgUptime    = conveyors.reduce((s, c) => s + c.uptime, 0) / conveyors.length;
  const oee          = avgUptime * (runningCount / conveyors.length) * Math.min(lineOutput / 22, 1);
  const alarms       = conveyors.filter(c => c.status === STATUS.FAULT).map(c => `${c.id} ${c.label} — E_OVERTEMP`);

  // ── Est. output — fixed: time-based projection ──────────────────────────────
  const shiftCfg     = SHIFTS.find(s => s.name === settings.shift) || SHIFTS[0];
  const { elapsed, duration, ratio } = shiftProgress(shiftCfg);
  const remainingMin = (duration - elapsed);
  const projectedTotal = Math.round(totalPcs + lineOutput * remainingMin);
  const targetProgress = Math.min(totalPcs / settings.target * 100, 100);
  const onPace         = ratio > 0 ? (totalPcs / (settings.target * ratio)) >= 0.95 : true;

  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#060b12", minHeight: "100vh",
      fontFamily: "'IBM Plex Sans','Segoe UI',sans-serif", color: "#e2e8f0", paddingBottom: 40 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        @keyframes cPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(1.4)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-3px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
        select,input { outline:none; }
        select option { background:#0f1520; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#060b12} ::-webkit-scrollbar-thumb{background:#1a2235;border-radius:4px}
      `}</style>

      {/* ── Topbar ── */}
      <div style={{
        background: "#080d14", borderBottom: "1px solid #1a2235",
        padding: "0 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        {/* Left: logo + line selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg,#00e5a033,#38bdf833)",
            border: "1px solid #00e5a044",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>⚙</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "IBM Plex Mono,monospace", letterSpacing: "0.05em" }}>
              FlowSight
            </div>
            <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: "0.1em" }}>CONVEYOR SCADA</div>
          </div>

          {/* Line dropdown */}
          <div style={{ marginLeft: 16 }}>
            <select value={settings.line}
              onChange={e => setSettings(s => ({ ...s, line: e.target.value }))}
              style={{
                background: "#0f1520", border: "1px solid #2a3448", borderRadius: 7,
                padding: "5px 28px 5px 10px", color: "#e2e8f0",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "IBM Plex Mono,monospace",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%234a5568'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
              }}>
              {Object.keys(LINES).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Right: fault badge, clock, settings, pause */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {faultCount > 0 && (
            <div style={{ fontSize: 11, color: "#ff4d4d", fontFamily: "IBM Plex Mono,monospace",
              animation: "fadeIn .3s ease", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff4d4d",
                animation: "cPulse 0.8s ease-in-out infinite", display: "inline-block" }} />
              {faultCount} FAULT{faultCount > 1 ? "S" : ""}
            </div>
          )}
          <div style={{ fontFamily: "IBM Plex Mono,monospace", textAlign: "right" }}>
            <div style={{ fontSize: 13, color: "#e2e8f0" }}>{timeStr}</div>
            <div style={{ fontSize: 9, color: "#4a5568" }}>{dateStr}</div>
          </div>
          <button onClick={() => setShowModal(true)} style={{
            padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600,
            cursor: "pointer", background: "#1a2235", border: "1px solid #2a3448", color: "#a0aec0",
          }}>⚙ Settings</button>
          <button onClick={() => setSimRunning(r => !r)} style={{
            padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.06em", cursor: "pointer",
            background: simRunning ? "#00e5a022" : "#f0b42922",
            border: `1px solid ${simRunning ? "#00e5a066" : "#f0b42966"}`,
            color: simRunning ? "#00e5a0" : "#f0b429",
          }}>{simRunning ? "⏸ PAUSE" : "▶ RESUME"}</button>
        </div>
      </div>

      <div style={{ padding: "18px 20px 0", maxWidth: 1200, margin: "0 auto" }}>

        {/* ── KPI bar ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { label: "LINES RUNNING", value: `${runningCount} / ${conveyors.length}`, color: runningCount === conveyors.length ? "#00e5a0" : "#f0b429" },
            { label: "LINE OUTPUT",  value: `${lineOutput.toFixed(1)} pcs/min`,         color: "#38bdf8" },
            { label: "AVG UPTIME",    value: `${avgUptime.toFixed(1)}%`,                color: "#a78bfa" },
            { label: "ACTIVE FAULTS", value: faultCount,                                color: faultCount > 0 ? "#ff4d4d" : "#00e5a0" },
          ].map(k => (
            <div key={k.label} style={{ background: "#0f1520", border: "1px solid #1a2235", borderRadius: 10, padding: "11px 14px" }}>
              <div style={{ fontSize: 9, color: "#4a5568", letterSpacing: "0.1em", marginBottom: 5 }}>{k.label}</div>
              <div style={{ fontSize: 21, fontWeight: 700, color: k.color, fontFamily: "IBM Plex Mono,monospace" }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 272px", gap: 14 }}>

          {/* Conveyor cards 2x2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {conveyors.map(c => (
              <ConveyorCard key={c.id} c={c} onToggleFault={toggleFault} onToggleStop={toggleStop} />
            ))}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* OEE */}
            <div style={{ background: "#0f1520", border: "1px solid #1a2235", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: "0.1em", marginBottom: 10 }}>OVERALL EFFECTIVENESS</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <OEEGauge value={Math.min(oee * 100, 99.9)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 10 }}>
                {[
                  { label: "Availability", value: `${(runningCount / conveyors.length * 100).toFixed(0)}%` },
                  { label: "Performance",  value: `${Math.min(lineOutput / 22 * 100, 100).toFixed(0)}%` },
                ].map(m => (
                  <div key={m.label} style={{ background: "#080d14", borderRadius: 7, padding: "7px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#4a5568", marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#a78bfa", fontFamily: "IBM Plex Mono,monospace" }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alarm panel */}
            <div style={{ background: "#0f1520", border: `1px solid ${faultCount > 0 ? "#ff4d4d44" : "#1a2235"}`,
              borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: "0.1em" }}>ALARM PANEL</div>
                {faultCount > 0 && <span style={{ fontSize: 9, color: "#ff4d4d",
                  background: "#ff4d4d18", border: "1px solid #ff4d4d44",
                  padding: "1px 7px", borderRadius: 10 }}>{faultCount} ACTIVE</span>}
              </div>
              {alarms.length === 0
                ? <div style={{ fontSize: 11, color: "#00e5a066" }}>✓ No active alarms</div>
                : alarms.map((a, i) => (
                  <div key={i} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 5, marginBottom: 3,
                    background: "#ff4d4d16", border: "1px solid #ff4d4d33", color: "#ff8080",
                    fontFamily: "IBM Plex Mono,monospace", animation: "fadeIn .3s ease" }}>⚠ {a}</div>
                ))
              }
            </div>

            {/* Shift info — fixed Est. output */}
            <div style={{ background: "#0f1520", border: "1px solid #1a2235", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: "0.1em", marginBottom: 10 }}>SHIFT INFO</div>
              {[
                { label: "Shift",    value: `${settings.shift} · ${shiftCfg.start}–${shiftCfg.end}` },
                { label: "Operator", value: settings.operator || "—" },
                { label: "Line",     value: settings.line },
                { label: "Target",   value: `${settings.target.toLocaleString()} pcs` },
                { label: "Produced", value: <span style={{ color: onPace ? "#00e5a0" : "#ff4d4d" }}>{Math.round(totalPcs).toLocaleString()} pcs</span> },
                { label: "Projected", value: `${projectedTotal.toLocaleString()} pcs` },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between",
                  fontSize: 11, padding: "4px 0", borderBottom: "1px solid #0d1420" }}>
                  <span style={{ color: "#4a5568" }}>{r.label}</span>
                  <span style={{ color: "#e2e8f0", fontFamily: "IBM Plex Mono,monospace", fontSize: 10 }}>{r.value}</span>
                </div>
              ))}

              {/* Target progress bar */}
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#4a5568", marginBottom: 4 }}>
                  <span>TARGET PROGRESS</span>
                  <span style={{ color: onPace ? "#00e5a0" : "#ff4d4d" }}>
                    {targetProgress.toFixed(1)}% · {onPace ? "On Pace ✓" : "Behind ⚠"}
                  </span>
                </div>
                <div style={{ height: 6, background: "#1a2235", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    width: `${targetProgress}%`,
                    background: onPace
                      ? "linear-gradient(90deg,#00e5a0,#38bdf8)"
                      : "linear-gradient(90deg,#f0b429,#ff4d4d)",
                    transition: "width 1s ease",
                    boxShadow: `0 0 6px ${onPace ? "#00e5a066" : "#ff4d4d66"}`,
                  }} />
                </div>
              </div>
            </div>

            {/* CSV Export */}
            <button onClick={() => exportCSV(conveyors, faultLog, settings)} style={{
              padding: "10px", borderRadius: 9, cursor: "pointer",
              background: "#38bdf812", border: "1px solid #38bdf833",
              color: "#38bdf8", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            }}>⬇ EXPORT CSV REPORT</button>
          </div>
        </div>

        {/* ── Fault History Log ── */}
        <div style={{ background: "#0f1520", border: "1px solid #1a2235", borderRadius: 12,
          padding: "16px 18px", marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: "0.1em" }}>
              FAULT HISTORY LOG <span style={{ color: "#2a3448", marginLeft: 6 }}>— last {faultLog.length} events this session</span>
            </div>
            {faultLog.length > 0 && (
              <button onClick={() => setFaultLog([])} style={{
                fontSize: 9, padding: "2px 8px", borderRadius: 5, cursor: "pointer",
                background: "transparent", border: "1px solid #2a3448", color: "#4a5568",
              }}>CLEAR LOG</button>
            )}
          </div>
          <FaultLog log={faultLog} />
        </div>

      </div>

      {/* ── Settings Modal ── */}
      {showModal && (
        <ShiftModal
          settings={settings}
          onSave={s => setSettings(s)}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}