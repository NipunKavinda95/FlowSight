// ── components/OEEGauge.jsx ───────────────────────────────────────────────────
// SVG circular gauge for OEE percentage display.

export default function OEEGauge({ value }) {
  const r    = 44, cx = 56, cy = 56;
  const circ = 2 * Math.PI * r;
  const color = value >= 85 ? "#00e5a0" : value >= 70 ? "#f0b429" : "#ff4d4d";

  return (
    <svg width={112} height={112}>
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2235" strokeWidth={10} />
      {/* Progress ring */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${circ * Math.min(value / 100, 1)} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{
          transition: "stroke-dasharray 0.6s ease",
          filter: `drop-shadow(0 0 6px ${color}88)`,
        }}
      />
      {/* Value text */}
      <text x={cx} y={cy - 6} textAnchor="middle" fill={color}
        fontSize={22} fontWeight={700} fontFamily="IBM Plex Mono,monospace">
        {value.toFixed(1)}
      </text>
      {/* Label */}
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#4a5568"
        fontSize={10} letterSpacing={2}>
        OEE %
      </text>
    </svg>
  );
}
