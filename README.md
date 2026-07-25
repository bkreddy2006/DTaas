# DTaaS MCP Server (Device Synchronization, Historical Analytics & Datasets)

A powerful, production-ready NitroStack MCP server facilitating seamless Device Telemetry Synchronization from ThingsBoard, robust local persistence in Neon PostgreSQL, and comprehensive Historical Analytics / Machine Learning Dataset Generation.

## Architecture

This server coordinates automatic background telemetry sync from ThingsBoard cloud directly into your Neon PostgreSQL database, exposing rich historical query and analytics capability to MCP clients (like AI agents).

```
                    ThingsBoard
                         │
                         ▼
              Background Sync Service
                         │
          Incremental Telemetry Synchronization
                         │
                         ▼
                     Neon Database
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
 Historical Query   Analytics      Dataset Export
        │                │                │
        └────────────────┼────────────────┘
                         ▼
                   NitroStack MCP
                         │
      register_device_for_sync
      pause_device_sync
      resume_device_sync
      sync_device_now
      query_device_history
      get_device_statistics
      export_device_csv
      create_training_dataset
```

## Features

### 1. Sync Registry
Enables explicit registration, pausing, resuming, and unregistering of devices for synchronization. Registry metadata is persistent in Neon.
- `deviceId`: The ThingsBoard Device UUID.
- `enabled`: Enable/disable background synchronization status.
- `syncIntervalSeconds`: Customizable telemetry fetch rate (default is 30 seconds).

### 2. Background Synchronization
A continuous background service that:
- Runs automatically using NitroStack's `OnApplicationBootstrap` hook.
- Respects custom sync intervals and prevents overlapping executions with lock state.
- Executes incremental telemetry synchronization (only fetches data since `lastSyncedTimestamp`).
- Isolate device failures (a single device synchronization failure does not impact other devices).

### 3. Manual & Historical Synchronization
- **Sync Now**: Force an immediate synchronization run for a registered device, returning the number of new records inserted.
- **History Backfill**: Backfill historical ranges of telemetry without modifying the background scheduler's state.

### 4. Telemetry Analytics
- **Historical Query API**: Retrieve historical timeseries telemetry from Neon (never queries ThingsBoard for history, ensuring performance and rate-limit safety).
- **Aggregate Statistics**: Efficiently calculate statistical summaries (`minimum`, `maximum`, `average`, `median`, `standardDeviation`, `sampleCount`, `firstTimestamp`, `lastTimestamp`) directly inside the Neon database in a single database query.

### 5. Dataset Exports & ML Datasets
- **Dataset Generation**: Combine telemetry from multiple devices and metrics, sorted chronologically, in CSV or JSON format. Large datasets are automatically queried and streamed in chunks.
- **CSV Export**: Generate downloadable CSV files, containing telemetry schema, saved under the server's `scratch/` directory.

---

## Comparison: Synchronization & Retrieval Methods

| Feature | Method | Source | Target | Updates Scheduler State? | Primary Use Case |
|---|---|---|---|---|---|
| **Background Sync** | Automatic Scheduler | ThingsBoard API | Neon DB | Yes | Continuous incremental data ingestion |
| **Manual MCP Sync** | `sync_device_now` | ThingsBoard API | Neon DB | Yes | Ad-hoc refresh before querying telemetry |
| **History Backfill** | `backfill_device_history` | ThingsBoard API | Neon DB | No | Backfilling gaps/historical ranges |
| **Historical Queries** | `query_device_history` | Neon DB | MCP Client | No | Visualizations, dashboard widgets, tool inspection |
| **Analytics & Export** | `get_device_statistics` / `create_training_dataset` | Neon DB | MCP Client / File | No | Statistical analysis & ML training dataset creation |

---

## Environment Variables

Configure these in `src/.env`:

```env
TB_URL=https://thingsboard.cloud
TB_API_KEY=your_thingsboard_api_key
DATABASE_URL=postgresql://neondb_owner:...
```

---

## Example Agent Prompts

### Synchronization & Registry Prompts
- `"Register ventilator-12 for continuous synchronization."`
- `"Pause synchronization for ICU device 4."`
- `"Synchronize the last 24 hours of telemetry for device ventilator-12."`

### Querying History & Statistics
- `"Show CPU and memory history for Device-12 from yesterday to today."`
- `"Calculate average heart rate for ICU device 4 yesterday."`

### Dataset Generation & CSV Export
- `"Export ECG telemetry from the last month as CSV."`
- `"Generate a JSON training dataset for all ventilators."`
- `"Generate a CSV dataset containing battery, CPU, and memory telemetry for all infusion pumps."`
