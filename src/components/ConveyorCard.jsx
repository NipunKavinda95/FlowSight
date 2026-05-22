// ── components/ConveyorCard.jsx ───────────────────────────────────────────────
import { STATUS, SC } from "../constants/config";
import StatusPill from "./StatusPill";
import Metric     from "./Metric";
import Sparkline  from "./Sparkline";

export default function ConveyorCard({ c, onToggleFault, onToggleStop }) {
  const isFault   = c.status === STATUS.FAULT;
  const isStopped = c.status === STATUS.STOPPED;

  return (
    <div style={{
      background: "#0f1520",
      border: `1px solid ${SC[c.status]}33`,
      borderRadius: 12, padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 10,
      boxShadow: isFault ? `0 0 18px ${SC[c.status]}18` : "none",
      transition: "all 0.4s ease",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: "0.1em", marginBottom: 2 }}>
            {c.zone} · {c.id}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", fontFamily: "IBM Plex Mono,monospace" }}>
            {c.label}
          </div>
        </div>
        <StatusPill status={c.status} />
      </div>

      {/* Sensor metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6,
        background: "#080d14", borderRadius: 8, padding: "9px 4px" }}>
        <Metric label="SPEED" value={c.speed.toFixed(0)}     unit="m/min" warn={80}  crit={90} />
        <Metric label="TEMP"  value={c.temp.toFixed(1)}      unit="°C"    warn={60}  crit={72} />
        <Metric label="VIBR"  value={c.vibration.toFixed(2)} unit="g"     warn={2.5} crit={4}  />
        <Metric label="AMPS"  value={c.current.toFixed(1)}   unit="A"     warn={20}  crit={25} />
      </div>

      {/* Sparkline trends */}
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

      {/* Footer: pcs/min + action buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, color: "#4a5568" }}>
          <span style={{ color: "#00e5a0" }}>{c.partsPerMin.toFixed(1)}</span> pcs/min ·{" "}
          <span style={{ color: "#38bdf8" }}>{c.uptime.toFixed(1)}%</span> uptime
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[
            { label: isFault   ? "CLEAR FAULT" : "INJECT FAULT", active: isFault,   color: "#ff4d4d", fn: () => onToggleFault(c.id) },
            { label: isStopped ? "RESTART"     : "STOP",         active: isStopped, color: "#f0b429", fn: () => onToggleStop(c.id)  },
          ].map(b => (
            <button key={b.label} onClick={b.fn} style={{
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
