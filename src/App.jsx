import { useState } from "react";
import { SHIFTS, STATUS, NOMINAL_PPM, DEFAULT_SETTINGS } from "./constants/config";
import { shiftProgress, exportCSV }                      from "./utils/simulation";
import { useSimulation }                                  from "./hooks/useSimulation";

import TopBar       from "./components/TopBar";
import KPIBar       from "./components/KPIBar";
import ConveyorCard from "./components/ConveyorCard";
import OEEPanel     from "./components/OEEPanel";
import AlarmPanel   from "./components/AlarmPanel";
import ShiftInfo    from "./components/ShiftInfo";
import FaultLog     from "./components/FaultLog";
import ShiftModal   from "./components/ShiftModal";

export default function FlowSight() {
  const [settings,  setSettings]  = useState(DEFAULT_SETTINGS);
  const [showModal, setShowModal] = useState(false);

  const {
    conveyors, simRunning, totalPcs, now, faultLog,
    apiError, isStale, staleIds, secondsSince,        
    setSimRunning, toggleFault, toggleStop, clearFaultLog,
  } = useSimulation(settings);

  // ── KPI calculations ────────────────────────────────────────────────────────
  const runningCount = conveyors.filter(c => c.status === STATUS.RUNNING).length;
  const faultCount   = conveyors.filter(c => c.status === STATUS.FAULT).length;
  const anyStopped   = conveyors.some(c => c.status === STATUS.STOPPED);
  const avgUptime    = conveyors.reduce((s, c) => s + c.uptime, 0) / conveyors.length;
  const alarms       = conveyors.filter(c => c.status === STATUS.FAULT)
                                .map(c => `${c.id} ${c.label} — E_OVERTEMP`);

  // Series line: STOPPED = 0 output; FAULT = degraded MIN bottleneck
  const lineOutput = anyStopped ? 0 : Math.min(...conveyors.map(c => c.partsPerMin));

  // OEE = Availability × Performance × Quality (quality assumed 100% here)
  const availPct = (runningCount / conveyors.length) * 100;
  const perfPct  = Math.min(lineOutput / NOMINAL_PPM * 100, 100);
  const oee      = (avgUptime / 100) * (availPct / 100) * (perfPct / 100);

  // Shift progress
  const shiftCfg       = SHIFTS.find(s => s.name === settings.shift) || SHIFTS[0];
  const { elapsed, duration, ratio } = shiftProgress(shiftCfg);
  const remainingMin   = duration - elapsed;
  const projectedTotal = Math.round(totalPcs + lineOutput * remainingMin);
  const targetProgress = Math.min(totalPcs / settings.target * 100, 100);
  const onPace         = ratio > 0 ? (totalPcs / (settings.target * ratio)) >= 0.95 : true;

  // Clock display
  const timeStr = now.toLocaleTimeString("en-GB",  { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString("en-GB",  { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  const handleReconnect = async () => {
    try {
      // Call bridge reconnect endpoint — bridge reconnects to MQTT broker
      const res = await fetch("http://localhost:8000/api/reconnect", { method: "POST" });
      const result = await res.json();
      console.log("[FlowSight] Reconnect:", result.message);
    } catch (err) {
      console.warn("[FlowSight] Reconnect failed — is bridge.py running?", err.message);
    }
  };
  
  return (
    <div style={{ background: "#060b12", minHeight: "100vh", color: "#e2e8f0", paddingBottom: 40 }}>

      <TopBar
      settings={settings}
      onLineChange={line => setSettings(s => ({ ...s, line }))}
      faultCount={faultCount}
      simRunning={simRunning}
      onToggleSim={() => setSimRunning(r => !r)}
      onOpenSettings={() => setShowModal(true)}
      timeStr={timeStr}
      dateStr={dateStr}
    />

    {/* ── Connection health banner ── */}
    {(apiError || isStale) && (
      <div style={{
        background: apiError && !isStale ? "#ff4d4d18" : "#f0b42918",
        borderBottom: `1px solid ${apiError && !isStale ? "#ff4d4d44" : "#f0b42944"}`,
        padding: "7px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>

        {/* Left — icon + message + affected conveyors */}
        <div style={{
          fontSize: 11,
          color: apiError && !isStale ? "#ff8080" : "#f0b429",
          fontFamily: "IBM Plex Mono,monospace",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>
            {apiError && !isStale ? "⛔" : "⚠"}
          </span>

          {/* Error or stale message */}
          {apiError
            ? apiError
            : `Data stale — no update for ${secondsSince}s`
          }

          {/* Which conveyors are affected */}
          {staleIds.length > 0 && (
            <span style={{ color: "#4a5568", marginLeft: 4 }}>
              · Affected: {staleIds.join(", ")}
            </span>
          )}
        </div>

        {/* Right — instruction + reconnect button */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, color: "#4a5568", fontFamily: "IBM Plex Mono,monospace" }}>
            {isStale && !apiError
              ? `Last data ${secondsSince}s ago — restart plc_simulator.py`
              : "Start bridge.py and plc_simulator.py"
            }
          </span>

          {/* Reconnect button — calls bridge /api/reconnect */}
          <button
            onClick={handleReconnect}
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
              padding: "4px 12px", borderRadius: 6, cursor: "pointer",
              background: "#38bdf822", border: "1px solid #38bdf866",
              color: "#38bdf8",
            }}
          >
            ↺ RECONNECT
          </button>
        </div>
      </div>
    )}

      <div style={{ padding: "18px 20px 0", maxWidth: 1200, margin: "0 auto" }}>

        <KPIBar
          runningCount={runningCount}
          totalCount={conveyors.length}
          lineOutput={lineOutput}
          avgUptime={avgUptime}
          faultCount={faultCount}
        />

        {/* Main 2-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 272px", gap: 14 }}>

          {/* Conveyor cards 2×2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {conveyors.map(c => (
              <ConveyorCard
                key={c.id}
                c={c}
                onToggleFault={toggleFault}
                onToggleStop={toggleStop}
              />
            ))}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <OEEPanel oee={oee} availPct={availPct} perfPct={perfPct} />

            <AlarmPanel alarms={alarms} />

            <ShiftInfo
              settings={settings}
              shiftCfg={shiftCfg}
              totalPcs={totalPcs}
              projectedTotal={projectedTotal}
              targetProgress={targetProgress}
              onPace={onPace}
            />

            <button
              onClick={() => exportCSV(conveyors, faultLog, settings)}
              style={{
                padding: "10px", borderRadius: 9, cursor: "pointer",
                background: "#38bdf812", border: "1px solid #38bdf833",
                color: "#38bdf8", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              }}
            >⬇ EXPORT CSV REPORT</button>
          </div>
        </div>

        <FaultLog log={faultLog} onClear={clearFaultLog} />

      </div>

      {showModal && (
        <ShiftModal
          settings={settings}
          onSave={s => setSettings(s)}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
