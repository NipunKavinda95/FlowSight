import { useState, useEffect, useRef } from "react";
import { LINES, STATUS, TICK_MS } from "../constants/config";
import { initConveyor, tickConveyor } from "../utils/simulation";

export function useSimulation(settings) {
  const [conveyors,  setConveyors]  = useState(() => LINES[settings.line].map(initConveyor));
  const [simRunning, setSimRunning] = useState(true);
  const [totalPcs,   setTotalPcs]   = useState(0);
  const [now,        setNow]        = useState(new Date());
  const [faultLog,   setFaultLog]   = useState([]);

  const prevFaults = useRef(new Set());

  // Reset when production line changes
  useEffect(() => {
    setConveyors(LINES[settings.line].map(initConveyor));
    setTotalPcs(0);
    setFaultLog([]);
    prevFaults.current = new Set();
  }, [settings.line]);

  // Simulation tick
  useEffect(() => {
    if (!simRunning) return;
    const id = setInterval(() => {
      setNow(new Date());
      setConveyors(cs => {
        const next = cs.map(tickConveyor);

        // Series line logic:
        // STOPPED = physically broken → 0 output
        // FAULT   = degraded throughput → bottleneck (MIN) still applies
        const anyStopped   = next.some(c => c.status === STATUS.STOPPED);
        const lineOutputNext = anyStopped
          ? 0
          : Math.min(...next.map(c => c.partsPerMin));

        // Accumulate real produced pieces this tick
        const tickMin = TICK_MS / 60000;
        setTotalPcs(prev => prev + lineOutputNext * tickMin);

        // Detect new faults → add to log
        next.forEach(c => {
          if (c.status === STATUS.FAULT && !prevFaults.current.has(c.id)) {
            prevFaults.current.add(c.id);
            setFaultLog(fl => [...fl.slice(-49), {
              time: new Date().toLocaleTimeString("en-GB"),
              id: c.id, zone: c.zone,
              code: "E_OVERTEMP", cleared: false,
            }]);
          }
          if (c.status !== STATUS.FAULT) prevFaults.current.delete(c.id);
        });

        // Mark cleared faults
        setFaultLog(fl => fl.map(e => ({
          ...e,
          cleared: e.cleared || !next.find(c => c.id === e.id && c.status === STATUS.FAULT),
        })));

        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [simRunning]);

  // Actions
  const toggleFault = id => setConveyors(cs => cs.map(c =>
    c.id !== id ? c : { ...c, status: c.status === STATUS.FAULT ? STATUS.RUNNING : STATUS.FAULT }
  ));

  const toggleStop = id => setConveyors(cs => cs.map(c =>
    c.id !== id ? c : { ...c, status: c.status === STATUS.STOPPED ? STATUS.RUNNING : STATUS.STOPPED }
  ));

  const clearFaultLog = () => setFaultLog([]);

  return {
    // state
    conveyors, simRunning, totalPcs, now, faultLog,
    // actions
    setSimRunning, toggleFault, toggleStop, clearFaultLog,
  };
}
