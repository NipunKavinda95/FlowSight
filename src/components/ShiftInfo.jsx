// ── components/ShiftInfo.jsx ──────────────────────────────────────────────────
// Sidebar panel: shift details, produced vs target, progress bar.

export default function ShiftInfo({ settings, shiftCfg, totalPcs, projectedTotal, targetProgress, onPace }) {
  const rows = [
    { label: "Shift",     value: `${settings.shift} · ${shiftCfg.start}–${shiftCfg.end}` },
    { label: "Operator",  value: settings.operator || "—" },
    { label: "Line",      value: settings.line },
    { label: "Target",    value: `${settings.target.toLocaleString()} pcs` },
    {
      label: "Produced",
      value: (
        <span style={{ color: onPace ? "#00e5a0" : "#ff4d4d" }}>
          {Math.round(totalPcs).toLocaleString()} pcs
        </span>
      ),
    },
    { label: "Projected", value: `${projectedTotal.toLocaleString()} pcs` },
  ];

  return (
    <div style={{ background: "#0f1520", border: "1px solid #1a2235", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: "0.1em", marginBottom: 10 }}>
        SHIFT INFO
      </div>

      {rows.map((r, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 11, padding: "4px 0", borderBottom: "1px solid #0d1420",
        }}>
          <span style={{ color: "#4a5568" }}>{r.label}</span>
          <span style={{ color: "#e2e8f0", fontFamily: "IBM Plex Mono,monospace", fontSize: 10 }}>
            {r.value}
          </span>
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
  );
}
