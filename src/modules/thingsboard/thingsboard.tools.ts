import {
    ToolDecorator as Tool,
    ExecutionContext,
    z
} from "@nitrostack/core";

import { ThingsBoardService } from "./thingsboard.service.js";

const service = new ThingsBoardService();

export class ThingsBoardTools {

    @Tool({
        name: "create_smart_light",
        description: "Create a Smart Light device in ThingsBoard Cloud",
        inputSchema: z.object({
            deviceName: z.string(),
            label: z.string().optional()
        })
    })
    async createSmartLight(
        input: {
            deviceName: string;
            label?: string;
        },
        ctx: ExecutionContext
    ) {

        ctx.logger.info(`Creating Smart Light ${input.deviceName}`);

        try {

            const device = await service.createSmartLight(
                input.deviceName,
                input.label
            );

            return {
                success: true,
                device
            };

        } catch (e: any) {

            return {
                success: false,
                message: e.response?.data ?? e.message
            };

        }
    }
}