import { Module } from "@nitrostack/core";
import { SyncModule } from "../sync/sync.module.js";
import { TelemetryAnalyticsService } from "./telemetry-analytics.service.js";
import { AnalyticsTools } from "./analytics.tools.js";

@Module({
    name: "analytics",
    description: "Historical telemetry queries and analytics",
    imports: [
        SyncModule
    ],
    controllers: [
        AnalyticsTools
    ],
    providers: [
        TelemetryAnalyticsService
    ],
    exports: [
        TelemetryAnalyticsService
    ]
})
export class AnalyticsModule {}
