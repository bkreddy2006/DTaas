import {
    ToolDecorator as Tool,
    ExecutionContext,
    z
} from "@nitrostack/core";

import { ThingsBoardService } from "./thingsboard.service.js";

const service = new ThingsBoardService();

export class ThingsBoardTools {

    @Tool({
        name: "create_device",
        description: "Create any device in ThingsBoard Cloud",
        inputSchema: z.object({
            deviceName: z.string().describe("Name of the device"),
            deviceType: z.string().describe("Device type (Smart Light, Smart Plug, Smart Meter, CCTV, etc.)"),
            label: z.string().optional().describe("Optional label")
        })
    })
    async createDevice(
        input: { deviceName: string; deviceType: string; label?: string; },
        ctx: ExecutionContext
    ) {
        ctx.logger.info(`Creating ${input.deviceType}: ${input.deviceName}`);

        try {
            const device = await service.createDevice(
                input.deviceName,
                input.deviceType,
                input.label
            );

            return {
                success: true,
                message: `${input.deviceType} created successfully.`,
                device
            };
        } catch (e: any) {
            return {
                success: false,
                message: e.response?.data ?? e.message
            };
        }
    }

    // ---------- ASSET TOOLS ----------

    @Tool({
        name: "create_asset",
        description: "Create any asset in ThingsBoard Cloud (Building, Floor, Zone, etc.)",
        inputSchema: z.object({
            assetName: z.string().describe("Name of the asset"),
            assetType: z.string().describe("Asset type (Building, Floor, Room, Zone, etc.)"),
            label: z.string().optional().describe("Optional label")
        })
    })
    async createAsset(
        input: { assetName: string; assetType: string; label?: string; },
        ctx: ExecutionContext
    ) {
        ctx.logger.info(`Creating asset ${input.assetType}: ${input.assetName}`);

        try {
            const asset = await service.createAsset(
                input.assetName,
                input.assetType,
                input.label
            );

            return {
                success: true,
                message: `${input.assetType} "${input.assetName}" created successfully.`,
                asset
            };
        } catch (e: any) {
            return {
                success: false,
                message: e.response?.data ?? e.message
            };
        }
    }

    @Tool({
        name: "delete_asset",
        description: "Delete an asset in ThingsBoard Cloud by name",
        inputSchema: z.object({
            assetName: z.string().describe("Name of the asset to delete")
        })
    })
    async deleteAsset(
        input: { assetName: string; },
        ctx: ExecutionContext
    ) {
        ctx.logger.info(`Deleting asset: ${input.assetName}`);

        try {
            const result = await service.deleteAsset(input.assetName);

            return {
                success: true,
                message: `Asset "${input.assetName}" deleted successfully.`,
                result
            };
        } catch (e: any) {
            return {
                success: false,
                message: e.response?.data ?? e.message
            };
        }
    }

}