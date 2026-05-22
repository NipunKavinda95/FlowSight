// ── utils/simulation.js ───────────────────────────────────────────────────────
// Pure functions — no React, no state, no side effects.
// initConveyor, tickConveyor, shiftProgress, exportCSV

import { HISTORY_LEN, STATUS, NOMINAL_PPM } from "../constants/config";

export const rand = (base, spread) =>
  +(base + (Math.random() - 0.5) * spread * 2).toFixed(1);

export function initConveyor(cfg) {
  return {
    ...cfg,
    status:      STATUS.RUNNING,
    speed:       cfg.nominalSpeed,
    temp:        cfg.nominalTemp,
    vibration:   rand(1.2, 0.4),
    current:     rand(14, 3),
    partsPerMin: rand(NOMINAL_PPM, 4),
    uptime:      rand(97, 2),
    history: Array.from({ length: HISTORY_LEN }, () => ({
      speed: rand(cfg.nominalSpeed, 3),
      temp:  rand(cfg.nominalTemp, 2),
    })),
  };
}

export function tickConveyor(c) {
  // STOPPED — freeze readings, zero output
  if (c.status === STATUS.STOPPED) return { ...c, partsPerMin: 0 };

  const f     = c.status === STATUS.FAULT;
  const speed = f ? rand(c.speed, 15)    : rand(c.nominalSpeed, 4);
  const temp  = f ? rand(c.temp + 10, 8) : rand(c.nominalTemp, 2);

  return {
    ...c, speed, temp,
    vibration:   f ? rand(3.8, 1.2)    : rand(1.2, 0.4),
    current:     f ? rand(22, 4)        : rand(14, 3),
    // FAULT = degraded but non-zero throughput (line still moves, just slower)
    partsPerMin: f ? rand(10, 5)        : rand(NOMINAL_PPM, 4),
    history: [...c.history.slice(1), { speed, temp }],
  };
}

export function shiftProgress(shiftCfg) {
  const now = new Date();
  const [sh, sm] = shiftCfg.start.split(":").map(Number);
  const [eh, em] = shiftCfg.end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin   = eh * 60 + em;
  const nowMin   = now.getHours() * 60 + now.getMinutes();
  let duration   = endMin > startMin ? endMin - startMin : 1440 - startMin + endMin;
  let elapsed    = nowMin >= startMin ? nowMin - startMin : 1440 - startMin + nowMin;
  if (elapsed > duration) elapsed = duration;
  return { elapsed, duration, ratio: elapsed / duration };
}

export function exportCSV(conveyors, faultLog, settings) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const rows = [
    ["FLOWSIGHT — CONVEYOR SCADA REPORT", `Exported: ${new Date().toLocaleString()}`],
    ["Line", settings.line, "Shift", settings.shift, "Operator", settings.operator],
    [],
    ["ID", "Label", "Zone", "Status", "Speed (m/min)", "Temp (°C)", "Vibration (g)", "Current (A)", "Parts/min", "Uptime %"],
    ...conveyors.map(c => [
      c.id, c.label, c.zone, c.status,
      c.speed.toFixed(1), c.temp.toFixed(1), c.vibration.toFixed(2),
      c.current.toFixed(1), c.partsPerMin.toFixed(1), c.uptime.toFixed(1),
    ]),
    [],
    ["FAULT LOG"],
    ["Time", "Conveyor ID", "Zone", "Fault Code", "Cleared"],
    ...faultLog.map(e => [e.time, e.id, e.zone, e.code, e.cleared ? "Yes" : "No"]),
  ];
  const csv  = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = `flowsight-${ts}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
