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

}