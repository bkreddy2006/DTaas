import {
    ToolDecorator as Tool,
    ExecutionContext,
    z
} from "@nitrostack/core";
import { ModelStoreService } from "./model-store.service.js";
import { ModelBuilderAgentService } from "./model-builder-agent.service.js";
import { validateModel } from "./validate.js";
import { runSimulation } from "./engine.js";

export class SimulationTools {
    private readonly modelStore: ModelStoreService;
    private readonly modelBuilderAgent: ModelBuilderAgentService;

    constructor(
        modelStore?: ModelStoreService,
        modelBuilderAgent?: ModelBuilderAgentService
    ) {
        this.modelStore = modelStore ?? new ModelStoreService();
        this.modelBuilderAgent = modelBuilderAgent ?? new ModelBuilderAgentService();
    }

    @Tool({
        name: "generate_simulation_model",
        description: "Uses AI to draft a simulation model (equations/rates/rules) from a plain-language requirement. Returns a modelId; does not run the simulation.",
        inputSchema: z.object({
            requirement: z.string().describe("Requirement text"),
            domain: z.string().optional().describe("Optional domain hint")
        })
    })
    async generateSimulationModel(
        input: { requirement: string; domain?: string },
        ctx: ExecutionContext
    ) {
        ctx.logger.info(`Generating simulation model for requirement: "${input.requirement}"`);
        try {
            const model = await this.modelBuilderAgent.generateModel(input.requirement, input.domain);
            validateModel(model);
            model.status = "draft";
            const modelId = this.modelStore.save(model);
            return {
                success: true,
                modelId,
                ...model
            };
        } catch (e: any) {
            return {
                success: false,
                message: e.message
            };
        }
    }

    @Tool({
        name: "run_simulation",
        description: "Runs a previously generated simulation model and returns the time-series result.",
        inputSchema: z.object({
            modelId: z.string().describe("UUID of the simulation model"),
            steps: z.number().default(24).describe("Number of simulation steps to run"),
            dt: z.number().default(1).describe("Time step increment (dt)"),
            paramOverrides: z.record(z.number()).optional().describe("Optional parameter overrides")
        })
    })
    async runSimulationTool(
        input: {
            modelId: string;
            steps: number;
            dt: number;
            paramOverrides?: Record<string, number>;
        },
        ctx: ExecutionContext
    ) {
        ctx.logger.info(`Running simulation for model ${input.modelId}`);
        try {
            const model = this.modelStore.get(input.modelId);
            if (!model) {
                throw new Error(`Model with ID ${input.modelId} not found.`);
            }

            if (model.requiresExpertReview && model.status === "draft") {
                return {
                    success: false,
                    message: "This model requires expert review before running. Current status: draft. Call approve_simulation_model first."
                };
            }

            let overrides = input.paramOverrides;
            if (typeof overrides === "string") {
                try {
                    overrides = JSON.parse(overrides);
                } catch {
                    overrides = undefined;
                }
            }

            const stepsNum = isNaN(Number(input.steps)) ? 24 : Number(input.steps);
            const dtNum = isNaN(Number(input.dt)) ? 1 : Number(input.dt);

            const resultHistory = runSimulation(model, stepsNum, dtNum, overrides);
            const paramsUsed = { ...model.params, ...(overrides ?? {}) };

            return {
                success: true,
                modelId: input.modelId,
                modelStatus: model.status,
                paramsUsed,
                resultHistory
            };
        } catch (e: any) {
            return {
                success: false,
                message: e.message
            };
        }
    }

    @Tool({
        name: "approve_simulation_model",
        description: "Marks a simulation model as reviewed/trusted, optionally correcting its equations.",
        inputSchema: z.object({
            modelId: z.string().describe("UUID of the simulation model"),
            reviewedBy: z.string().describe("Name of the expert reviewer"),
            equationOverrides: z.record(z.string()).optional().describe("Optional overrides for equations or rates (maps variable name to mathematical expression)")
        })
    })
    async approveSimulationModel(
        input: {
            modelId: string;
            reviewedBy: string;
            equationOverrides?: Record<string, string>;
        },
        ctx: ExecutionContext
    ) {
        ctx.logger.info(`Approving simulation model ${input.modelId} by ${input.reviewedBy}`);
        try {
            const model = this.modelStore.get(input.modelId);
            if (!model) {
                throw new Error(`Model with ID ${input.modelId} not found.`);
            }

            if (input.equationOverrides) {
                if (model.mode === "equations") {
                    model.equations = {
                        ...(model.equations ?? {}),
                        ...input.equationOverrides
                    };
                } else if (model.mode === "rates") {
                    model.rates = {
                        ...(model.rates ?? {}),
                        ...input.equationOverrides
                    };
                } else {
                    throw new Error("Equation overrides are only supported for 'equations' or 'rates' mode.");
                }
            }

            // re-run validation
            validateModel(model);

            this.modelStore.update(input.modelId, {
                status: "trusted",
                reviewedBy: input.reviewedBy,
                equations: model.equations,
                rates: model.rates
            });

            return {
                success: true,
                message: `Simulation model ${input.modelId} approved and status set to trusted by ${input.reviewedBy}.`
            };
        } catch (e: any) {
            return {
                success: false,
                message: e.message
            };
        }
    }
}
