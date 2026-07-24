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

        description: "Create a Smart Light device in ThingsBoard Cloud.",

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

        ctx.logger.info(
            `Creating Smart Light: ${input.deviceName}`
        );

        try {

            const device =
                await this.service.createSmartLight(

                    input.deviceName,

                    input.label

                );

            return {

                success: true,

                message: "Smart Light created successfully.",

                device

            };

        } catch (error: any) {

            ctx.logger.error(error);

            return {

                success: false,

                message:
                    error.response?.data ??
                    error.message

            };

        }

    }

}