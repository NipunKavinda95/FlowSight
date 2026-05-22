// ── components/ShiftModal.jsx ─────────────────────────────────────────────────
import { useState } from "react";
import { LINES, SHIFTS } from "../constants/config";

export default function ShiftModal({ settings, onSave, onClose }) {
  const [form, setForm] = useState({ ...settings });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fields = [
    { label: "PRODUCTION LINE",    key: "line",     type: "select", options: Object.keys(LINES) },
    { label: "SHIFT",              key: "shift",    type: "select", options: SHIFTS.map(s => s.name) },
    { label: "OPERATOR / TEAM",    key: "operator", type: "text",   placeholder: "e.g. Team A" },
    { label: "SHIFT TARGET (pcs)", key: "target",   type: "number", placeholder: "e.g. 8400" },
  ];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f1520", border: "1px solid #2a3448",
          borderRadius: 14, padding: "24px 28px", width: 380, maxWidth: "95vw",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", color: "#e2e8f0", marginBottom: 20 }}>
          ⚙ SHIFT SETTINGS
        </div>

        {fields.map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "#4a5568", letterSpacing: "0.1em", marginBottom: 5 }}>{f.label}</div>
            {f.type === "select" ? (
              <select
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                style={{
                  width: "100%", background: "#080d14", border: "1px solid #2a3448",
                  borderRadius: 7, padding: "8px 10px", color: "#e2e8f0", fontSize: 13,
                }}
              >
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={f.type}
                value={form[f.key]}
                placeholder={f.placeholder}
                onChange={e => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                style={{
                  width: "100%", background: "#080d14", border: "1px solid #2a3448",
                  borderRadius: 7, padding: "8px 10px", color: "#e2e8f0", fontSize: 13,
                }}
              />
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
