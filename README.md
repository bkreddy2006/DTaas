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

---

## 3D Visualization Capabilities

The server provides 3D visualization capabilities using Three.js (loaded via CDN) to render device twins, mapping real-time or historical telemetry metrics onto 3D parts' properties (such as rotation speed, color, scale, and opacity).

### 3D Visualization Tools Reference

#### 1. `generate_visual_mapping`
Uses Gemini AI (`gemini-2.5-flash`) to generate a 3D visual mapping configuration for a device type based on its registered telemetry schema, saving it as `draft`.
* **Parameters:**
  * `deviceType` (string, required): The type of device (e.g., `"centrifugal_pump"`).

#### 2. `get_device_3d_view`
Generates a self-contained HTML scene featuring the 3D model of a device, mapping its latest telemetry readings to the corresponding part properties.
* **Parameters:**
  * `deviceId` (string, required): The ThingsBoard Device UUID.
  * `deviceType` (string, required): The device type.
* **Response:**
  * Returns an MCP resource content block under `device-scene://${deviceId}` of mimeType `text/html`, and a fallback text block containing the raw HTML code.

#### 3. `preview_visual_mapping`
Generates a mock 3D scene preview for a device type using the midpoints of the mapping ranges. This allows checking the visual representation layout and property animations before any telemetry readings are registered.
* **Parameters:**
  * `deviceType` (string, required): The device type.

> [!NOTE]
> Frontend clients (like dashboards or custom control panels) are expected to render the returned `text/html` content inside an `iframe` or `webview`.

### Worked Example: Centrifugal Pump

An example configuration generated for a `centrifugal_pump` device type:

1. **Telemetry Schema**:
   Registered for `"centrifugal_pump"` containing:
   - `RPM`: Expected range `[0, 3600]`
   - `temperature`: Expected range `[20, 120]`
   - `flow_rate`: Expected range `[0, 100]`

2. **Generated Visual Mapping (`CompositeShape` and properties mapping)**:
   - **Parts**:
     - `base` (box): Colored `#555555`, positioned at `[0, -0.6, 0]`.
     - `body` (cylinder): Colored `#4a90d9`, positioned at `[0, 0, 0]`.
     - `impeller` (torus): Colored `#ff9900`, positioned at `[0, 0.4, 0]`.
   - **Mappings**:
     - `RPM` mapped to `impeller`'s `rotationSpeed` (range `[0, 3600]` to output range `[0, 10]`).
     - `temperature` mapped to `body`'s `color` (range `[20, 120]` to output colors `[#0000ff, #ff0000]`).

