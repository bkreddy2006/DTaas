import { Module } from "@nitrostack/core";
import { DeviceDataService } from "./device-data.service.js";
import { ThingsBoardClientService } from "./thingsboard-client.service.js";
import { SyncRegistryService } from "./sync-registry.service.js";
import { BackgroundSyncService } from "./background-sync.service.js";
import { SyncTools } from "./sync.tools.js";

@Module({
    name: "sync",
    description: "Device synchronization registry and background service",
    controllers: [
        SyncTools
    ],
    providers: [
        DeviceDataService,
        ThingsBoardClientService,
        SyncRegistryService,
        BackgroundSyncService
    ],
    exports: [
        DeviceDataService,
        SyncRegistryService,
        BackgroundSyncService
    ]
})
export class SyncModule {}
