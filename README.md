<h1 align="center">
  <br />
  DTaaS
  <br />
</h1>

<h4 align="center">Device-Twin-as-a-Service — MCP Server for IoT Telemetry, Analytics & 3D Digital Twins</h4>

<p align="center">
  <a href="https://github.com/blackflash-exe/DTaas/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/blackflash-exe/DTaas/deploy.yml?style=flat-square&label=build" alt="Build Status" />
  </a>
  <a href="https://github.com/blackflash-exe/DTaas/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
  </a>
  <img src="https://img.shields.io/badge/NitroStack-MCP%20Framework-6c63ff?style=flat-square" alt="NitroStack" />
  <img src="https://img.shields.io/badge/ThingsBoard-IoT%20Platform-brightgreen?style=flat-square" alt="ThingsBoard" />
  <img src="https://img.shields.io/badge/Neon-PostgreSQL-3ECF8E?style=flat-square" alt="Neon DB" />
  <img src="https://img.shields.io/badge/Three.js-3D%20Visualization-black?style=flat-square" alt="Three.js" />
  <img src="https://img.shields.io/badge/version-1.0.0-orange?style=flat-square" alt="Version" />
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#tools-reference">Tools Reference</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#documentation">Documentation</a>
</p>

---

## Overview

**DTaaS** is a production-ready [NitroStack](https://nitrostack.ai) MCP server that bridges your IoT infrastructure with AI agents. It continuously synchronizes device telemetry from [ThingsBoard](https://thingsboard.io) into a [Neon PostgreSQL](https://neon.tech) database, exposes rich historical analytics and ML dataset generation, and can render interactive **3D Digital Twin visualizations** of any device using its live telemetry data.

> Built for AI-native IoT applications. Connect once — query, analyze, and visualize forever.

```
  ThingsBoard IoT Platform
          │
          │  REST API
          ▼
  ┌───────────────────────┐
  │  Background Sync      │  ◄── Runs every 10s, incremental fetch
  │  (per-device timers)  │
  └──────────┬────────────┘
             │
             ▼
  ┌───────────────────────┐
  │  Neon PostgreSQL      │  ◄── Persistent telemetry store
  │  (device_telemetry)   │
  └──────────┬────────────┘
             │
    ┌────────┴────────┬──────────────┐
    ▼                 ▼              ▼
  Historical       Analytics     3D Digital Twin
  Queries          & ML Export   Visualization
    │                 │              │
    └────────┬────────┴──────────────┘
             │
             ▼
    NitroStack MCP Server
    (58 tools · HTTP + STDIO)
```

---

## Features

### 🔄 Continuous Device Synchronization
Register any ThingsBoard device for automatic, incremental background telemetry sync. The service respects per-device intervals, prevents overlapping executions, and isolates failures so a single bad device never blocks others.

### 📊 Historical Analytics & Statistics
Query any time range of stored telemetry directly from the Neon database — never hitting ThingsBoard again. Compute aggregate statistics (`min`, `max`, `avg`, `median`, `stdDev`, `count`) in a single database query.

### 🤖 ML Dataset Generation
Combine telemetry from multiple devices and metrics into structured CSV or JSON datasets, chunked and sorted chronologically. Ready to feed directly into ML training pipelines.

### 🧊 3D Digital Twin Visualization
Generate interactive Three.js 3D scenes for any device type using AI-powered mapping. Map live telemetry metrics to 3D part properties (rotation speed, color, scale, opacity) — no WebGL code required.

### 🏗️ Full IoT Platform Toolkit
A complete set of ThingsBoard management tools covering devices, assets, customers, dashboards, rule chains, alarms, users, and notifications — all exposed as MCP tools for AI agents.

---

## Architecture

### Module Overview

```
src/
├── modules/
│   ├── sync/                     # Core telemetry sync engine
│   │   ├── background-sync.service.ts   # Scheduler (OnApplicationBootstrap)
│   │   ├── sync-registry.service.ts     # Device registry (Neon)
│   │   ├── device-data.service.ts       # Schema + telemetry persistence
│   │   ├── thingsboard-client.service.ts# ThingsBoard REST client
│   │   └── sync.tools.ts                # MCP tool definitions
│   ├── thingsboard/              # ThingsBoard management API wrapper
│   ├── dashboard/                # Dashboard & widget management
│   ├── rule-chain/               # Rule chain orchestration
│   ├── digital-twin/             # Digital twin lifecycle
│   └── analytics/                # Statistics & dataset generation
└── visualization/                # 3D twin engine
    ├── telemetry-schema.service.ts
    ├── visual-mapping.service.ts
    ├── visual-mapping-agent.service.ts  # Gemini AI mapper
    └── scene-builder.ts                 # Three.js HTML generator
```

### Database Schema

| Table | Purpose |
|---|---|
| `device_sync_registry` | Registered devices, sync intervals, last-sync timestamps |
| `device_telemetry` | Time-series telemetry readings (metric, value, timestamp) |
| `telemetry_schemas` | Per-device-type metric schemas with expected value ranges |
| `visual_mappings` | 3D part-to-metric binding configurations |

---

## Tools Reference

DTaaS exposes **58 MCP tools** across 6 modules. Below is a summary.

### 🔁 Sync & Registry (8 tools)

| Tool | Description |
|---|---|
| `register_device_for_sync` | Register a device for continuous background sync |
| `unregister_device_for_sync` | Remove a device from the sync registry |
| `pause_device_sync` | Temporarily suspend sync for a device |
| `resume_device_sync` | Resume sync for a paused device |
| `get_device_sync_status` | Get registry entry and last sync state |
| `sync_device_now` | Force an immediate manual sync |
| `backfill_device_history` | Backfill a historical time window |
| `query_device_history` | Query stored telemetry by time range |

### 📈 Analytics & Export (3 tools)

| Tool | Description |
|---|---|
| `get_device_statistics` | Compute min/max/avg/median/stdDev aggregates |
| `create_training_dataset` | Generate a multi-device JSON/CSV ML dataset |
| `export_device_csv` | Export telemetry as a CSV file to disk |

### 🧊 3D Visualization (3 tools)

| Tool | Description |
|---|---|
| `generate_visual_mapping` | Use Gemini AI to generate a 3D part-metric binding |
| `preview_visual_mapping` | Preview a 3D scene using midpoint values (no live data needed) |
| `get_device_3d_view` | Render a live 3D HTML scene for a device using real telemetry |

### 🏗️ ThingsBoard Management (44 tools)

Full CRUD coverage for: **Devices**, **Assets**, **Customers**, **Users**, **Dashboards**, **Widgets**, **Rule Chains**, **Alarms**, **Notifications**, **Entity Groups**, and **Device Profiles**.

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [NitroStack CLI](https://nitrostack.ai) (`npm install -g @nitrostack/cli`)
- A [ThingsBoard](https://thingsboard.io) instance (cloud or self-hosted)
- A [Neon](https://neon.tech) PostgreSQL database

### 1. Clone & Install

```bash
git clone https://github.com/blackflash-exe/DTaas.git
cd DTaas
npm install
```

### 2. Configure Environment

Create `src/.env`:

```env
# ThingsBoard
TB_BASE_URL=https://your-thingsboard-host.com
TB_API_KEY=your_thingsboard_api_key

# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Gemini AI (for 3D visual mapping generation)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run in Development

```bash
npm run dev
```

The server starts in dual mode — Streamable HTTP on `http://localhost:3000/mcp` and STDIO.

### 4. Deploy to NitroStack Cloud

```bash
git push origin main
```

Then deploy via the [NitroStack Cloud](https://nitrostack.ai) dashboard. Add the environment variables above in project settings.

---

## Configuration

### Sync Intervals

Each device can have its own sync interval:

```
register_device_for_sync(
  deviceId: "your-device-uuid",
  syncIntervalSeconds: 30     # default: 30s, minimum: 10s
)
```

### Sync Strategies

| Method | Use When |
|---|---|
| Background auto-sync | Continuous IoT monitoring |
| `sync_device_now` | Before an ad-hoc analytics query |
| `backfill_device_history` | Recovering data gaps or importing history |

---

## Example Agent Prompts

Once connected to an MCP client (e.g. Claude Desktop, NitroStack Studio):

**Sync & Registry**
```
"Register device abc-123 for sync every 60 seconds."
"Show me the sync status of all my devices."
"Backfill the last 7 days of data for pump-01."
```

**Analytics**
```
"What was the average temperature of device abc-123 last week?"
"Show me the min and max RPM for the centrifugal pump yesterday."
"Generate a CSV of all sensor readings from the past month."
```

**3D Visualization**
```
"Generate a 3D visual twin for device type centrifugal_pump."
"Show me the live 3D view of pump device abc-123."
"Preview the 3D model for a water meter."
```

**ThingsBoard Management**
```
"Create a new temperature sensor device in ThingsBoard."
"Add an alarm rule to alert when temperature exceeds 80°C."
"Create a dashboard with a telemetry timeseries widget for pump-01."
```

---

## Documentation

| Guide | Description |
|---|---|
| [Device Synchronization & Analytics](./docs/device-synchronization-analytics.md) | Full sync engine reference, registry API, analytics tools |
| [3D Twin Visualization & Mapping](./docs/3d-twin-visualization-mapping.md) | Visual mapping schema, Three.js scene builder, AI mapping |
| [Dashboard Integration](./docs/dashboard-integration.md) | Dashboard & widget management tools reference |

> 📘 Full documentation website: _Coming soon_

---

## Tech Stack

| Layer | Technology |
|---|---|
| MCP Framework | [NitroStack](https://nitrostack.ai) |
| IoT Platform | [ThingsBoard](https://thingsboard.io) |
| Database | [Neon Serverless PostgreSQL](https://neon.tech) |
| 3D Rendering | [Three.js](https://threejs.org) (via CDN) |
| AI Mapping | [Gemini 2.5 Flash](https://deepmind.google/gemini) |
| Language | TypeScript (ESM) |
| Transport | HTTP Streamable + STDIO (dual mode) |

---

## License

MIT © [blackflash-exe](https://github.com/blackflash-exe)

---

<p align="center">
  Built with ❤️ on <a href="https://nitrostack.ai">NitroStack</a>
</p>
