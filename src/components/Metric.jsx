// ── components/Metric.jsx ─────────────────────────────────────────────────────
// Displays a single sensor value with colour thresholds (warn / crit).

export default function Metric({ label, value, unit, warn, crit }) {
  const v     = parseFloat(value);
  const color = v >= crit ? "#ff4d4d" : v >= warn ? "#f0b429" : "#00e5a0";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "#4a5568", marginBottom: 2, letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>
        {value}
        <span style={{ fontSize: 10, marginLeft: 2, color: "#4a5568" }}>{unit}</span>
      </div>
    </div>
  );
}
