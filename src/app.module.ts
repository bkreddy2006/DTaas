import { McpApp, Module, ConfigModule } from "@nitrostack/core";

import { CalculatorModule } from "./modules/calculator/calculator.module.js";
import { ThingsBoardModule } from "./modules/thingsboard/thingsboard.module.js";

import { SystemHealthCheck } from "./health/system.health.js";

@McpApp({
    module: AppModule,

    server: {
        name: "dtaas-server",
        version: "1.0.0"
    },

    logging: {
        level: "info"
    }
})

@Module({
    name: "app",

    description: "DTaaS MCP Server",

    imports: [
        ConfigModule.forRoot(),
        CalculatorModule,
        ThingsBoardModule
    ],

    providers: [
        SystemHealthCheck
    ]
})

export class AppModule {}