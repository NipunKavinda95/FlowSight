// ── constants/config.js ───────────────────────────────────────────────────────
// All static config: line definitions, shifts, status labels, colours.
// Nothing here changes at runtime — pure data only.

export const HISTORY_LEN = 40;
export const TICK_MS     = 1200;
export const NOMINAL_PPM = 22;   // healthy conveyor baseline pcs/min

export const LINES = {
  "Line 1": [
    { id: "C-01", label: "Infeed Belt",    zone: "Zone A", nominalSpeed: 72, nominalTemp: 38 },
    { id: "C-02", label: "Assembly Line",  zone: "Zone B", nominalSpeed: 65, nominalTemp: 52 },
    { id: "C-03", label: "Quality Check",  zone: "Zone C", nominalSpeed: 58, nominalTemp: 44 },
    { id: "C-04", label: "Outfeed / Pack", zone: "Zone D", nominalSpeed: 70, nominalTemp: 36 },
  ],
  "Line 2": [
    { id: "C-01", label: "Press Feed",  zone: "Zone A", nominalSpeed: 68, nominalTemp: 42 },
    { id: "C-02", label: "Stamping",    zone: "Zone B", nominalSpeed: 60, nominalTemp: 58 },
    { id: "C-03", label: "Deburring",   zone: "Zone C", nominalSpeed: 55, nominalTemp: 46 },
    { id: "C-04", label: "Packing",     zone: "Zone D", nominalSpeed: 65, nominalTemp: 34 },
  ],
  "Line 3": [
    { id: "C-01", label: "Raw Intake", zone: "Zone A", nominalSpeed: 75, nominalTemp: 36 },
    { id: "C-02", label: "Welding",    zone: "Zone B", nominalSpeed: 62, nominalTemp: 65 },
    { id: "C-03", label: "Coating",    zone: "Zone C", nominalSpeed: 50, nominalTemp: 55 },
    { id: "C-04", label: "Dispatch",   zone: "Zone D", nominalSpeed: 72, nominalTemp: 33 },
  ],
};

export const SHIFTS = [
  { name: "Morning",   start: "06:00", end: "14:00" },
  { name: "Afternoon", start: "14:00", end: "22:00" },
  { name: "Night",     start: "22:00", end: "06:00" },
];

export const STATUS = { RUNNING: "RUNNING", FAULT: "FAULT", STOPPED: "STOPPED" };

// Status colours — shared across all components
export const SC = {
  RUNNING: "#00e5a0",
  FAULT:   "#ff4d4d",
  STOPPED: "#7a8494",
};

export const DEFAULT_SETTINGS = {
  line: "Line 1", shift: "Morning", operator: "Team A", target: 8400,
};
