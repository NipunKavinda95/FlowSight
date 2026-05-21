# FlowSight

## Industrial SCADA-Style Monitoring Dashboard

FlowSight is a modern industrial monitoring dashboard demo built with React, designed to simulate a real-world smart factory environment. The platform visualizes live machine data, conveyor performance, OEE metrics, alarms, and production insights through a clean SCADA-inspired interface.

This project demonstrates how industrial automation dashboards can be built for manufacturing plants, conveyor systems, textile factories, packaging lines, and Industry 4.0 environments.

---

## Live Demo

Add your deployment URL here after deploying:

```bash
https://your-demo-url.vercel.app
```

---

# Features

## Real-Time Conveyor Monitoring

* 4 live conveyor production lines
* Simulated industrial sensor data
* Real-time updates without backend services
* Conveyor operational status visualization

## Sensor Data Simulation

Each conveyor line includes:

* Speed monitoring
* Temperature monitoring
* Vibration monitoring
* Current consumption monitoring

## Real-Time Charts

* Live sparkline trend charts
* Continuous data updates
* SCADA-style visualization
* Production analytics interface

## OEE Dashboard

Track:

* Availability
* Performance
* Operational efficiency
* Estimated production output

## Alarm & Fault Detection System

* Active alarm panel
* Fault detection simulation
* Out-of-range condition alerts
* Live warning visualization

## Interactive Demo Controls

* Inject Fault button
* Pause/Resume simulation
* Live operational response simulation

## Modern Industrial UI

* SCADA-inspired dashboard design
* Responsive layout
* Real-time operational visibility
* Industry 4.0 visualization approach

---

# Technology Stack

## Frontend

* React
* JavaScript
* HTML5
* CSS3

## Data Visualization

* Recharts

## Deployment

* Vercel
* GitHub Pages

---

# Project Purpose

FlowSight was developed as a demonstration platform for industrial automation dashboards and smart factory monitoring systems.

The goal is to showcase how real-time industrial data can be visualized through modern web technologies while simulating actual production environments.

This demo can later be extended to connect with:

* PLC systems
* OPC-UA servers
* Modbus devices
* MQTT brokers
* IoT sensors
* Industrial databases
* MES systems
* Predictive maintenance platforms

---

# Use Cases

FlowSight can be adapted for:

* Conveyor monitoring systems
* Textile manufacturing dashboards
* Packaging line monitoring
* Production analytics
* Factory monitoring systems
* Machine health monitoring
* Predictive maintenance systems
* Industrial IoT dashboards
* Smart factory visualization
* SCADA dashboard prototypes

---

# Installation

## Clone Repository

```bash
git clone https://github.com/NipunKavinda95/FlowSight.git
```

## Navigate to Project

```bash
cd FlowSight
```

## Install Dependencies

```bash
npm install
```

## Install Recharts

```bash
npm install recharts
```

## Start Development Server

```bash
npm start
```

The application will run on:

```bash
http://localhost:3000
```

---

# Deployment

## Deploy on Vercel

### Install Vercel CLI

```bash
npm install -g vercel
```

### Deploy

```bash
vercel
```

---

## Deploy on GitHub Pages

### Install gh-pages

```bash
npm install gh-pages --save-dev
```

### Add to package.json

```json
"homepage": "https://yourusername.github.io/FlowSight"
```

Add scripts:

```json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
```

### Deploy

```bash
npm run deploy
```

---

# Dashboard Modules

## Conveyor Monitoring

Displays operational conditions and performance indicators for multiple conveyor systems.

## Sensor Analytics

Visualizes live industrial sensor values including:

* Temperature
* Vibration
* Current
* Conveyor speed

## OEE Tracking

Provides operational efficiency insights and production performance metrics.

## Alarm Management

Detects abnormal operating conditions and generates live alerts.

## Production Overview

Displays:

* Shift information
* Estimated output
* Operational status
* Machine activity

---

# Future Enhancements

Planned improvements include:

* Historical data storage
* Export to CSV
* Maintenance scheduling system
* Predictive maintenance AI models
* OPC-UA integration
* Modbus TCP/IP connectivity
* MQTT integration
* User authentication
* Dark/light theme support
* Database integration
* Real PLC communication
* Mobile responsive optimization
* Multi-factory support
* KPI analytics panels
* Energy monitoring

---

# Why This Project Matters

Many factories still lack accessible real-time monitoring systems for machine performance, conveyor operation, and production analytics.

FlowSight demonstrates how modern web technologies and industrial automation concepts can be combined to create scalable monitoring solutions for Industry 4.0 environments.

This project combines:

* Industrial automation knowledge
* SCADA concepts
* Frontend software development
* Real-time visualization
* Smart manufacturing ideas
* Predictive monitoring concepts

---

# Ideal Industries

This dashboard concept is suitable for:

* Textile industry
* Manufacturing plants
* Packaging facilities
* Warehousing systems
* Conveyor-based production lines
* Logistics operations
* Industrial automation companies

---

# Screenshots

Add screenshots here:

```md
![Dashboard Screenshot](./screenshots/dashboard.png)
```

---

# Project Structure

```bash
FlowSight/
│
├── public/
├── src/
│   ├── components/
│   ├── charts/
│   ├── pages/
│   ├── styles/
│   └── App.jsx
│
├── package.json
├── README.md
└── .gitignore
```

---

# Contributing

Contributions, ideas, and improvements are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

# License

This project is licensed under the MIT License.

---

# Author

## Nipun Kavinda

Industrial automation enthusiast and software developer focused on:

* Industrial monitoring systems
* Smart factory solutions
* Predictive maintenance
* AI-based machine monitoring
* Industrial IoT applications
* Real-time dashboard development

GitHub:

[https://github.com/NipunKavinda95](https://github.com/NipunKavinda95)

---

# GitHub Topics

```text
react
industrial-dashboard
scada
industry-4-0
iot
automation
smart-factory
oee
real-time-dashboard
predictive-maintenance
machine-monitoring
industrial-iot
conveyor-system
factory-monitoring
recharts
```

---

# Client Demo Pitch

"FlowSight demonstrates how a modern industrial monitoring platform can visualize live factory operations, machine performance, alarms, and OEE metrics in real time. The same architecture can be connected directly to PLCs, OPC-UA servers, Modbus devices, and industrial IoT systems for real production environments."
