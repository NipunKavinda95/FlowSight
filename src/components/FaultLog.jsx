// ── components/FaultLog.jsx ───────────────────────────────────────────────────
// Fault history table — shows last N fault events this session.

export default function FaultLog({ log, onClear }) {
  return (
    <div style={{
      background: "#0f1520", border: "1px solid #1a2235",
      borderRadius: 12, padding: "16px 18px", marginTop: 14,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: "0.1em" }}>
          FAULT HISTORY LOG
          <span style={{ color: "#2a3448", marginLeft: 6 }}>— {log.length} events this session</span>
        </div>
        {log.length > 0 && (
          <button onClick={onClear} style={{
            fontSize: 9, padding: "2px 8px", borderRadius: 5, cursor: "pointer",
            background: "transparent", border: "1px solid #2a3448", color: "#4a5568",
          }}>CLEAR LOG</button>
        )}
      </div>

      {log.length === 0 ? (
        <div style={{ fontSize: 12, color: "#00e5a044", padding: "12px 0", textAlign: "center" }}>
          No fault events recorded this session
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>
                {["TIME", "CONVEYOR", "ZONE", "FAULT CODE", "STATUS"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "6px 10px", fontSize: 9,
                    color: "#4a5568", letterSpacing: "0.1em", borderBottom: "1px solid #1a2235",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {log.slice().reverse().map((e, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #0f1520" }}>
                  <td style={{ padding: "6px 10px", color: "#4a5568", fontFamily: "IBM Plex Mono,monospace", fontSize: 10 }}>{e.time}</td>
                  <td style={{ padding: "6px 10px", color: "#e2e8f0", fontFamily: "IBM Plex Mono,monospace" }}>{e.id}</td>
                  <td style={{ padding: "6px 10px", color: "#4a5568" }}>{e.zone}</td>
                  <td style={{ padding: "6px 10px" }}>
                    <span style={{
                      background: "#ff4d4d18", border: "1px solid #ff4d4d33",
                      color: "#ff8080", padding: "1px 7px", borderRadius: 10,
                      fontSize: 10, fontFamily: "IBM Plex Mono,monospace",
                    }}>{e.code}</span>
                  </td>
                  <td style={{ padding: "6px 10px" }}>
                    <span style={{ color: e.cleared ? "#00e5a0" : "#f0b429", fontSize: 10 }}>
                      {e.cleared ? "✓ Cleared" : "⚠ Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
