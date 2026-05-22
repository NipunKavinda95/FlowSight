// ── components/KPIBar.jsx ─────────────────────────────────────────────────────
// Top row: 4 KPI cards — Lines Running, Line Output, Avg Uptime, Active Faults.

export default function KPIBar({ runningCount, totalCount, lineOutput, avgUptime, faultCount }) {
  const cards = [
    {
      label: "LINES RUNNING",
      value: `${runningCount} / ${totalCount}`,
      color: runningCount === totalCount ? "#00e5a0" : "#f0b429",
    },
    {
      label: "LINE OUTPUT",
      value: `${lineOutput.toFixed(1)} pcs/min`,
      color: "#38bdf8",
    },
    {
      label: "AVG UPTIME",
      value: `${avgUptime.toFixed(1)}%`,
      color: "#a78bfa",
    },
    {
      label: "ACTIVE FAULTS",
      value: faultCount,
      color: faultCount > 0 ? "#ff4d4d" : "#00e5a0",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
      {cards.map(k => (
        <div key={k.label} style={{
          background: "#0f1520", border: "1px solid #1a2235",
          borderRadius: 10, padding: "11px 14px",
        }}>
          <div style={{ fontSize: 9, color: "#4a5568", letterSpacing: "0.1em", marginBottom: 5 }}>
            {k.label}
          </div>
          <div style={{ fontSize: 21, fontWeight: 700, color: k.color, fontFamily: "IBM Plex Mono,monospace" }}>
            {k.value}
          </div>
        </div>
      ))}
    </div>
  );
}
