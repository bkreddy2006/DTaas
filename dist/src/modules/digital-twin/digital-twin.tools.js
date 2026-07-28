var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ToolDecorator as Tool, PromptDecorator as Prompt, z } from "@nitrostack/core";
import { PlannerService } from "../../agents/planner/planner.service.js";
import { EngineerService } from "../../agents/engineer/engineer.service.js";
import { ThingsBoardConfig } from "../thingsboard/tb-config.js";
import { TwinSpecificationSchema } from "../../agents/planner/planner.schema.js";
export class DigitalTwinTools {
    async getSmartHomePrompt(args, ctx) {
        ctx.logger.info("Executing smart_home prompt template");
        return [
            {
                role: "user",
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
    async getSmartFactoryPrompt(args, ctx) {
        ctx.logger.info("Executing smart_factory prompt template");
        return [
            {
                role: "user",
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
    async createDigitalTwin(input, ctx) {
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
            const specification = await planner.analyze(input.prompt);
            ctx.logger.info("===== PLANNER OUTPUT =====");
            ctx.logger.info(JSON.stringify(specification, null, 2));
            ctx.logger.info("Provisioning digital twin...");
            const graph = await engineer.build(specification);
            ctx.logger.info("===== ENGINEER OUTPUT =====");
            ctx.logger.info(JSON.stringify(graph, null, 2));
            return {
                success: true,
                specification,
                graph
            };
        }
        catch (e) {
            ctx.logger.error(`create_digital_twin failed: ${e.message}`);
            return {
                success: false,
                message: e.message
            };
        }
    }
    async planDigitalTwin(input, ctx) {
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
        }
        catch (e) {
            ctx.logger.error(`plan_digital_twin failed: ${e.message}`);
            return {
                success: false,
                message: e.message
            };
        }
    }
    async buildDigitalTwinFromSpec(input, ctx) {
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
        }
        catch (e) {
            ctx.logger.error(`build_digital_twin_from_spec failed: ${e.message}`);
            return {
                success: false,
                message: e.message
            };
        }
    }
}
__decorate([
    Prompt({
        name: "smart_home",
        description: "Creates a digital twin specification for a Smart Home including lights, plugs, camera, meter, dashboards, customer, users, rule chain, and alarms."
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DigitalTwinTools.prototype, "getSmartHomePrompt", null);
__decorate([
    Prompt({
        name: "smart_factory",
        description: "Creates a digital twin specification for a Smart Factory including temperature sensors, conveyor motor, PLC controller, power meter, dashboards, customer, users, rule chain, and alarms."
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DigitalTwinTools.prototype, "getSmartFactoryPrompt", null);
__decorate([
    Tool({
        name: "create_digital_twin",
        description: "Creates a complete ThingsBoard Digital Twin from a natural language description. Note: For two-step verification/planning, call 'plan_digital_twin' first to review the spec, then call 'build_digital_twin_from_spec'.",
        inputSchema: z.object({
            prompt: z
                .string()
                .describe("Natural language description of the required digital twin.")
        })
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DigitalTwinTools.prototype, "createDigitalTwin", null);
__decorate([
    Tool({
        name: "plan_digital_twin",
        description: "Analyzes a natural language description of a digital twin and generates a structured Twin Specification JSON. MUST be called first to generate the plan before building or creating any digital twin resources on ThingsBoard. Requires Gemini API Key to be configured.",
        inputSchema: z.object({
            prompt: z.string().describe("Natural language description of the required digital twin.")
        })
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DigitalTwinTools.prototype, "planDigitalTwin", null);
__decorate([
    Tool({
        name: "build_digital_twin_from_spec",
        description: "Takes a planned digital twin specification JSON (generated by plan_digital_twin) and builds/provisions all corresponding resources (devices, alarms, rule chains, dashboards, users, customers, and emulators) on ThingsBoard.",
        inputSchema: z.object({
            specification: z.any().describe("The JSON digital twin specification object generated by plan_digital_twin.")
        })
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DigitalTwinTools.prototype, "buildDigitalTwinFromSpec", null);
//# sourceMappingURL=digital-twin.tools.js.map