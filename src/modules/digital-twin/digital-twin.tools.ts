import {
    ToolDecorator as Tool,
    PromptDecorator as Prompt,
    ExecutionContext,
    z
} from "@nitrostack/core";

import { PlannerService } from "../../agents/planner/planner.service.js";
import { EngineerService } from "../../agents/engineer/engineer.service.js";
import { ThingsBoardConfig } from "../thingsboard/tb-config.js";
import { TwinSpecificationSchema } from "../../agents/planner/planner.schema.js";

export class DigitalTwinTools {

    @Prompt({
        name: "smart_home",
        description: "Creates a digital twin specification for a Smart Home including lights, plugs, camera, meter, dashboards, customer, users, rule chain, and alarms."
    })
    async getSmartHomePrompt(
        args: Record<string, any>,
        ctx: ExecutionContext
    ) {
        ctx.logger.info("Executing smart_home prompt template");
        return [
            {
                role: "user" as const,
                content: `Create a digital twin named "Smart Home".

Create the following devices:
- 2 Smart Lights
- 1 Smart Plug
- 1 CCTV Camera
- 1 Smart Meter

Create three dashboards:
- Home Overview
- Energy Monitoring
- Security Dashboard

Create one customer named "HomeOwner".

Create two users under this customer:
- homeadmin@example.com (Tenant Administrator)
- resident@example.com (Customer User)

Create a rule chain named "Home Automation".

Create two alarms:
- High Energy Usage (CRITICAL)
- Camera Offline (MAJOR)`
            }
        ];
    }

    @Prompt({
        name: "smart_factory",
        description: "Creates a digital twin specification for a Smart Factory including temperature sensors, conveyor motor, PLC controller, power meter, dashboards, customer, users, rule chain, and alarms."
    })
    async getSmartFactoryPrompt(
        args: Record<string, any>,
        ctx: ExecutionContext
    ) {
        ctx.logger.info("Executing smart_factory prompt template");
        return [
            {
                role: "user" as const,
                content: `Create a digital twin named "Smart Factory".

Create the following devices:
- 2 Temperature Sensors
- 1 Conveyor Motor
- 1 PLC Controller
- 1 Power Meter

Create three dashboards:
- Factory Overview
- Production Dashboard
- Machine Health

Create one customer named "Factory Operations".

Create two users under this customer:
- manager@factory.com (Tenant Administrator)
- operator@factory.com (Customer User)

Create a rule chain named "Factory Monitoring".

Create two alarms:
- Machine Overheating (CRITICAL)
- Power Failure (MAJOR)`
            }
        ];
    }

    @Tool({
        name: "create_digital_twin",
        description: "Creates a complete ThingsBoard Digital Twin from a natural language description. Note: For two-step verification/planning, call 'plan_digital_twin' first to review the spec, then call 'build_digital_twin_from_spec'.",

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

        if (!ThingsBoardConfig.hasConfig()) {
            return {
                success: false,
                message: "Error: ThingsBoard connection is not configured. Please use the 'configure_credentials' tool first to configure your ThingsBoard URL and API Key before creating or building anything."
            };
        }

        ctx.logger.info("Planning digital twin...");

        try {

            const planner = new PlannerService();
            const engineer = new EngineerService();

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

            ctx.logger.error(`create_digital_twin failed: ${e.message}`);

            return {
                success: false,
                message: e.message
            };
        }
    }

    @Tool({
        name: "plan_digital_twin",
        description: "Analyzes a natural language description of a digital twin and generates a structured Twin Specification JSON. MUST be called first to generate the plan before building or creating any digital twin resources on ThingsBoard. Requires Gemini API Key to be configured.",
        inputSchema: z.object({
            prompt: z.string().describe("Natural language description of the required digital twin.")
        })
    })
    async planDigitalTwin(
        input: {
            prompt: string;
        },
        ctx: ExecutionContext
    ) {
        ctx.logger.info("Planning digital twin...");
        try {
            const planner = new PlannerService();
            const specification = await planner.analyze(input.prompt);
            ctx.logger.info("===== PLANNER OUTPUT =====");
            ctx.logger.info(JSON.stringify(specification, null, 2));
            return {
                success: true,
                specification
            };
        } catch (e: any) {
            ctx.logger.error(`plan_digital_twin failed: ${e.message}`);
            return {
                success: false,
                message: e.message
            };
        }
    }

    @Tool({
        name: "build_digital_twin_from_spec",
        description: "Takes a planned digital twin specification JSON (generated by plan_digital_twin) and builds/provisions all corresponding resources (devices, alarms, rule chains, dashboards, users, customers, and emulators) on ThingsBoard.",
        inputSchema: z.object({
            specification: z.any().describe("The JSON digital twin specification object generated by plan_digital_twin.")
        })
    })
    async buildDigitalTwinFromSpec(
        input: {
            specification: any;
        },
        ctx: ExecutionContext
    ) {
        if (!ThingsBoardConfig.hasConfig()) {
            return {
                success: false,
                message: "Error: ThingsBoard connection is not configured. Please use the 'configure_credentials' tool first to configure your ThingsBoard URL and API Key before creating or building anything."
            };
        }

        ctx.logger.info("Provisioning digital twin from specification...");
        try {
            const parsedSpec = TwinSpecificationSchema.parse(input.specification);
            const engineer = new EngineerService();
            const graph = await engineer.build(parsedSpec);
            ctx.logger.info("===== ENGINEER OUTPUT =====");
            ctx.logger.info(JSON.stringify(graph, null, 2));
            return {
                success: true,
                graph
            };
        } catch (e: any) {
            ctx.logger.error(`build_digital_twin_from_spec failed: ${e.message}`);
            return {
                success: false,
                message: e.message
            };
        }
    }
}