import { McpApp, Module, ConfigModule } from "@nitrostack/core";

import { ThingsBoardModule } from "./modules/thingsboard/thingsboard.module.js";
import { SystemHealthCheck } from "./health/system.health.js";

@Module({
    name: "app",
    description: "DTaaS MCP Server",

    imports: [
        ConfigModule.forRoot(),
        ThingsBoardModule
    ],

    providers: [
        SystemHealthCheck
    ]
})
class AppModuleBase {}

export const AppModule = McpApp({
    module: AppModuleBase,

    server: {
        name: "dtaas-server",
        version: "1.0.0"
    },

    logging: {
        level: "info"
    }
})(AppModuleBase);