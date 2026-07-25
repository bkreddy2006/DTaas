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

            deviceName: z.string()
                .describe("Name of the device"),

            deviceType: z.string()
                .describe("Device type (Smart Light, Smart Plug, Smart Meter, CCTV, etc.)"),

            label: z.string()
                .optional()
                .describe("Optional label")

        })

    })

    async createDevice(

        input: {
            deviceName: string;
            deviceType: string;
            label?: string;
        },

        ctx: ExecutionContext

    ) {

        ctx.logger.info(
            `Creating ${input.deviceType}: ${input.deviceName}`
        );

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

                message:
                    e.response?.data ??
                    e.message

            };

        }

    }

    @Tool({

        name: "delete_device",

        description: "Delete an existing device by its name from ThingsBoard Cloud",

        inputSchema: z.object({

            deviceName: z.string()
                .describe("The name of the device to delete")

        })

    })

    async deleteDevice(

        input: {
            deviceName: string;
        },

        ctx: ExecutionContext

    ) {

        ctx.logger.info(
            `Attempting to delete device named: ${input.deviceName}`
        );

        try {

            // Step 1: Find the device by name to get its ID
            const device = await service.getTenantDevice(input.deviceName);

            if (!device || !device.id || !device.id.id) {
                return {
                    status: "ERROR",
                    message: `Device with name '${input.deviceName}' not found.`,
                    deviceName: input.deviceName
                };
            }

            const deviceId = device.id.id;

            // Step 2: Delete using the retrieved ID
            await service.deleteDevice(deviceId);

            return {

                status: "OK",

                message: `Device '${input.deviceName}' (ID: ${deviceId}) deleted successfully.`,

                deviceName: input.deviceName

            };

        } catch (e: any) {

            return {

                status: "ERROR",

                message:
                    e.response?.data?.message ??
                    e.response?.data ??
                    e.message,

                deviceName: input.deviceName

            };

        }

    }

}