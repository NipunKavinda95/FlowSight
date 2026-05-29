// ── hooks/useSimulation.js — MQTT VERSION with command support ────────────────
// KEY FIX: toggleFault and toggleStop now send commands to bridge → simulator
// Instead of changing local React state (which gets overwritten every 1.5s),
// we tell the simulator to change — then MQTT brings back the real new state.

import { useState, useEffect, useRef } from "react";
import { LINES, STATUS, TICK_MS }      from "../constants/config";
import { initConveyor }                from "../utils/simulation";

const API_URL     = "http://localhost:8000/api/line";
const CMD_URL     = "http://localhost:8000/api/command";
const FETCH_MS    = 1500;

export function useSimulation(settings) {
  const [conveyors,    setConveyors]    = useState(() => LINES[settings.line].map(initConveyor));
  const [simRunning,   setSimRunning]   = useState(true);
  const [totalPcs,     setTotalPcs]     = useState(0);
  const [now,          setNow]          = useState(new Date());
  const [faultLog,     setFaultLog]     = useState([]);

  // ── Connection health state ────────────────────────────────────────────────
  const [apiError,     setApiError]     = useState(null);
  const [isStale,      setIsStale]      = useState(false);
  const [staleIds,     setStaleIds]     = useState([]);
  const [secondsSince, setSecondsSince] = useState(0);

  const prevFaults   = useRef(new Set());
  const lastFetchRef = useRef(Date.now());

  // Reset on line change
  useEffect(() => {
    setConveyors(LINES[settings.line].map(initConveyor));
    setTotalPcs(0);
    setFaultLog([]);
    setApiError(null);
    setIsStale(false);
    setStaleIds([]);
    prevFaults.current = new Set();
  }, [settings.line]);

  // ── Fetch from bridge API every 1.5s ──────────────────────────────────────
  useEffect(() => {
    if (!simRunning) return;

    const fetchFromBridge = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`API returned ${res.status}`);

        const response = await res.json();

        const conveyorData = response.data ?? response;
        const stale        = response.stale        ?? false;
        const errMsg       = response.error        ?? null;
        const staleIdList  = response.stale_ids    ?? [];
        const secSince     = response.seconds_since ?? 0;

        setIsStale(stale);
        setStaleIds(staleIdList);
        setSecondsSince(secSince);
        setApiError(errMsg);

        if (!Array.isArray(conveyorData) || conveyorData.length === 0) return;

        setNow(new Date());

        setConveyors(prev => {
          const next = prev.map(existing => {
            const fresh = conveyorData.find(d => d.id === existing.id);
            if (!fresh) return existing;

            const isThisStale = staleIdList.includes(existing.id);

            return {
              ...existing,
              ...fresh,
              stale: isThisStale,
              history: [
                ...existing.history.slice(1),
                { speed: fresh.speed, temp: fresh.temp },
              ],
              status: fresh.status || STATUS.RUNNING,
            };
          });

          // Fault detection for log
          next.forEach(c => {
            if (c.status === STATUS.FAULT && !prevFaults.current.has(c.id)) {
              prevFaults.current.add(c.id);
              setFaultLog(fl => [...fl.slice(-49), {
                time:    new Date().toLocaleTimeString("en-GB"),
                id:      c.id,
                zone:    c.zone,
                code:    "E_OVERTEMP",
                cleared: false,
              }]);
            }
            if (c.status !== STATUS.FAULT) prevFaults.current.delete(c.id);
          });

          setFaultLog(fl => fl.map(e => ({
            ...e,
            cleared: e.cleared || !next.find(c => c.id === e.id && c.status === STATUS.FAULT),
          })));

          // Count produced parts — only when data is fresh
          if (!stale) {
            const anyStopped = next.some(c => c.status === STATUS.STOPPED);
            const lineOutput = anyStopped ? 0 : Math.min(...next.map(c => c.partsPerMin || 0));
            const elapsedMin = (Date.now() - lastFetchRef.current) / 60000;
            lastFetchRef.current = Date.now();
            setTotalPcs(prev => prev + lineOutput * elapsedMin);
          }

          return next;
        });

      } catch (err) {
        setApiError(`Bridge offline — ${err.message}`);
        setIsStale(true);
      }
    };

    fetchFromBridge();
    const id = setInterval(fetchFromBridge, FETCH_MS);
    return () => clearInterval(id);

  }, [simRunning, settings.line]);

  // ── Send command to bridge → simulator ────────────────────────────────────
  // This is the KEY FIX:
  // Old way: setConveyors(local state change) → overwritten by MQTT in 1.5s ❌
  // New way: tell simulator → simulator publishes new state → MQTT brings it back ✅
  const sendCommand = async (id, action) => {
    try {
      const res = await fetch(CMD_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id, action }),
      });
      const result = await res.json();
      console.log(`[CMD] ${id} → ${action}:`, result.success ? "OK" : "FAILED");
    } catch (err) {
      console.warn(`[CMD] Failed to send ${action} to ${id}:`, err.message);
    }
  };

  // ── Button handlers ───────────────────────────────────────────────────────
  const toggleFault = id => {
    // Find current status — toggle between FAULT and RUNNING
    setConveyors(prev => {
      const current = prev.find(c => c.id === id);
      const action  = current?.status === STATUS.FAULT ? "START" : "FAULT";
      sendCommand(id, action);   // tell simulator — MQTT will confirm
      return prev;               // don't change local state — wait for MQTT
    });
  };

  const toggleStop = id => {
    // Find current status — toggle between STOPPED and RUNNING
    setConveyors(prev => {
      const current = prev.find(c => c.id === id);
      const action  = current?.status === STATUS.STOPPED ? "START" : "STOP";
      sendCommand(id, action);   // tell simulator — MQTT will confirm
      return prev;               // don't change local state — wait for MQTT
    });
  };

  const clearFaultLog = () => setFaultLog([]);

  return {
    conveyors, simRunning, totalPcs, now, faultLog,
    apiError, isStale, staleIds, secondsSince,
    setSimRunning, toggleFault, toggleStop, clearFaultLog,
  };
}
