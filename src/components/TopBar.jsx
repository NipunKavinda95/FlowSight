// ── components/TopBar.jsx ─────────────────────────────────────────────────────
import { LINES } from "../constants/config";

export default function TopBar({ settings, onLineChange, faultCount, simRunning, onToggleSim, onOpenSettings, timeStr, dateStr }) {
  return (
    <div style={{
      background: "#080d14", borderBottom: "1px solid #1a2235",
      padding: "0 20px", display: "flex", alignItems: "center",
      justifyContent: "space-between", height: 56,
      position: "sticky", top: 0, zIndex: 100,
    }}>
      {/* Left: logo + line dropdown */}
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

        <div style={{ marginLeft: 16 }}>
          <select
            value={settings.line}
            onChange={e => onLineChange(e.target.value)}
            style={{
              background: "#0f1520", border: "1px solid #2a3448", borderRadius: 7,
              padding: "5px 28px 5px 10px", color: "#e2e8f0",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "IBM Plex Mono,monospace", appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%234a5568'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
            }}
          >
            {Object.keys(LINES).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Right: fault badge, clock, settings, pause */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {faultCount > 0 && (
          <div style={{
            fontSize: 11, color: "#ff4d4d", fontFamily: "IBM Plex Mono,monospace",
            animation: "fadeIn .3s ease", display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: "#ff4d4d",
              animation: "cPulse 0.8s ease-in-out infinite", display: "inline-block",
            }} />
            {faultCount} FAULT{faultCount > 1 ? "S" : ""}
          </div>
        )}

        <div style={{ fontFamily: "IBM Plex Mono,monospace", textAlign: "right" }}>
          <div style={{ fontSize: 13, color: "#e2e8f0" }}>{timeStr}</div>
          <div style={{ fontSize: 9, color: "#4a5568" }}>{dateStr}</div>
        </div>

        <button onClick={onOpenSettings} style={{
          padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600,
          cursor: "pointer", background: "#1a2235", border: "1px solid #2a3448", color: "#a0aec0",
        }}>⚙ Settings</button>

        <button onClick={onToggleSim} style={{
          padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.06em", cursor: "pointer",
          background: simRunning ? "#00e5a022" : "#f0b42922",
          border: `1px solid ${simRunning ? "#00e5a066" : "#f0b42966"}`,
          color: simRunning ? "#00e5a0" : "#f0b429",
        }}>
          {simRunning ? "⏸ PAUSE" : "▶ RESUME"}
        </button>
      </div>
    </div>
  );
}
