# FlowSight — Conveyor SCADA Dashboard

> Real-time visibility for your production line

A professional industrial dashboard simulating a 4-zone conveyor line with live sensor data, OEE tracking, fault detection, and shift management.

---

## Live Demo
[Deploy to Vercel — one click](https://vercel.com/new)

## Screenshots
<!-- Add screenshot here after deployment -->

## Features
- **4 conveyor zones** — speed, temperature, vibration, current with live sparkline trends
- **Series line logic** — output = MIN (bottleneck), not SUM — correct industrial behaviour
- **OEE gauge** — availability × performance calculated in real time
- **Fault injection** — simulate faults per zone, watch alarm panel respond
- **Shift settings** — set operator, target, shift type via settings modal
- **Production tracking** — actual vs target with progress bar and on-pace indicator
- **Fault history log** — timestamped fault events with cleared/active status
- **CSV export** — download sensor snapshot + fault log

## Tech Stack
- React 18 + Vite
- Recharts (sparkline area charts)
- Pure JS simulation (no backend required for Stage 1)

## Project Structure
```
src/
├── constants/
│   └── config.js          # All static data: lines, shifts, colours
├── utils/
│   └── simulation.js      # Pure functions: initConveyor, tickConveyor, exportCSV
├── hooks/
│   └── useSimulation.js   # All React state + simulation tick logic
├── components/
│   ├── TopBar.jsx          # Sticky header: logo, line dropdown, clock
│   ├── KPIBar.jsx          # 4 top metric cards
│   ├── ConveyorCard.jsx    # Single zone card with metrics + sparklines
│   ├── OEEGauge.jsx        # SVG circular OEE gauge
│   ├── OEEPanel.jsx        # OEE gauge + availability/performance
│   ├── AlarmPanel.jsx      # Active fault list
│   ├── ShiftInfo.jsx       # Shift details + target progress bar
│   ├── FaultLog.jsx        # Fault history table
│   ├── ShiftModal.jsx      # Settings modal
│   ├── Sparkline.jsx       # Recharts area sparkline
│   ├── Metric.jsx          # Single sensor value display
│   └── StatusPill.jsx      # Running/Fault/Stopped pill badge
├── styles/
│   └── index.css           # Global styles, fonts, keyframes
├── App.jsx                 # Layout only — imports all components
└── main.jsx                # Entry point
```

## Getting Started
```bash
npm create vite@latest flowsight -- --template react
cd flowsight
npm install recharts
# Replace src/ with the files in this repo
npm run dev
```

## Roadmap
- [ ] Stage 2: Python + SQLite backend with REST API
- [ ] Stage 3: OPC-UA / Modbus connector to real PLC hardware
- [ ] Multi-line overview page
- [ ] Historical trend charts (last 8 hours)

---
Built with React · Designed for industrial automation portfolios
