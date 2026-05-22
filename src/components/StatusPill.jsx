// ── components/StatusPill.jsx ─────────────────────────────────────────────────
import { SC, STATUS } from "../constants/config";

export default function StatusPill({ status }) {
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
