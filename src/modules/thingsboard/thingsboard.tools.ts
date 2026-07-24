import {
    ToolDecorator as Tool,
    ExecutionContext,
    z
} from "@nitrostack/core";

import { ThingsBoardService } from "./thingsboard.service.js";

export class ThingsBoardTools {

    constructor(
        private readonly service: ThingsBoardService
    ) {}

    @Tool({
        name: "create_smart_light",

        description: "Create a Smart Light device in ThingsBoard Cloud",

        inputSchema: z.object({
            deviceName: z
                .string()
                .describe("Name of the Smart Light"),

            label: z
                .string()
                .optional()
                .describe("Optional label")
        }),

        examples: {
            request: {
                deviceName: "Living Room Light",
                label: "Ground Floor"
            },
            response: {
                success: true,
                message: "Smart Light created successfully."
            }
        }
    })

    async createSmartLight(
        input: {
            deviceName: string;
            label?: string;
        },
        ctx: ExecutionContext
    ) {

        ctx.logger.info(
            `Creating Smart Light: ${input.deviceName}`
        );

        try {

            const result = await this.service.createSmartLight(
                input.deviceName,
                input.label
            );

            return {
                success: true,
                message: "Smart Light created successfully.",
                device: result
            };

        } catch (error: any) {

            ctx.logger.error(
                `Failed to create Smart Light: ${error.message}`
            );

            return {
                success: false,
                message:
                    error.response?.data?.message ??
                    error.message
            };

        }

    }

}