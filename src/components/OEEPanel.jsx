// ── components/OEEPanel.jsx ───────────────────────────────────────────────────
import OEEGauge from "./OEEGauge";

export default function OEEPanel({ oee, availPct, perfPct }) {
  return (
    <div style={{ background: "#0f1520", border: "1px solid #1a2235", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: "0.1em", marginBottom: 10 }}>
        OVERALL EFFECTIVENESS
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <OEEGauge value={Math.min(oee * 100, 99.9)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 10 }}>
        {[
          { label: "Availability", value: `${availPct.toFixed(0)}%` },
          { label: "Performance",  value: `${perfPct.toFixed(0)}%`  },
        ].map(m => (
          <div key={m.label} style={{
            background: "#080d14", borderRadius: 7, padding: "7px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: 9, color: "#4a5568", marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#a78bfa", fontFamily: "IBM Plex Mono,monospace" }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
