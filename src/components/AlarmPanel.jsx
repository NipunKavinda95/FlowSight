// ── components/AlarmPanel.jsx ─────────────────────────────────────────────────

export default function AlarmPanel({ alarms }) {
  const faultCount = alarms.length;
  return (
    <div style={{
      background: "#0f1520",
      border: `1px solid ${faultCount > 0 ? "#ff4d4d44" : "#1a2235"}`,
      borderRadius: 12, padding: "14px 16px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: "0.1em" }}>ALARM PANEL</div>
        {faultCount > 0 && (
          <span style={{
            fontSize: 9, color: "#ff4d4d",
            background: "#ff4d4d18", border: "1px solid #ff4d4d44",
            padding: "1px 7px", borderRadius: 10,
          }}>{faultCount} ACTIVE</span>
        )}
      </div>

      {faultCount === 0
        ? <div style={{ fontSize: 11, color: "#00e5a066" }}>✓ No active alarms</div>
        : alarms.map((a, i) => (
          <div key={i} style={{
            fontSize: 10, padding: "4px 8px", borderRadius: 5, marginBottom: 3,
            background: "#ff4d4d16", border: "1px solid #ff4d4d33",
            color: "#ff8080", fontFamily: "IBM Plex Mono,monospace",
            animation: "fadeIn .3s ease",
          }}>⚠ {a}</div>
        ))
      }
    </div>
  );
}
