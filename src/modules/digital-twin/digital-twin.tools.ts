import {
    ToolDecorator as Tool,
    ExecutionContext,
    z
} from "@nitrostack/core";

import { PlannerService } from "../../agents/planner/planner.service.js";
import { EngineerService } from "../../agents/engineer/engineer.service.js";

const planner = new PlannerService();
const engineer = new EngineerService();

export class DigitalTwinTools {

    @Tool({
        name: "create_digital_twin",
        description: "Creates a complete ThingsBoard Digital Twin from a natural language description.",

        inputSchema: z.object({
            prompt: z
                .string()
                .describe("Natural language description of the required digital twin.")
        })
    })
    async createDigitalTwin(
        input: {
            prompt: string;
        },
        ctx: ExecutionContext
    ) {

        ctx.logger.info("Planning digital twin...");

        try {

            const specification =
                await planner.analyze(input.prompt);
            ctx.logger.info("===== PLANNER OUTPUT =====");
            ctx.logger.info(JSON.stringify(specification, null, 2));

            ctx.logger.info("Provisioning digital twin...");

            const graph =
                await engineer.build(specification);
            ctx.logger.info("===== ENGINEER OUTPUT =====");
ctx.logger.info(JSON.stringify(graph, null, 2));
            return {
                success: true,
                specification,
                graph
            };

        } catch (e: any) {

            ctx.logger.error(e);

            return {
                success: false,
                message: e.message
            };
        }
    }
}