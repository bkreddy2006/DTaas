import { McpApp, Module, ConfigModule } from "@nitrostack/core";

import { ThingsBoardModule } from "./modules/thingsboard/thingsboard.module.js";
import { DashboardModule } from "./modules/dashboard/dashboard.module.js";
import { RuleChainModule } from "./modules/rule-chain/rule-chain.module.js";

import { SystemHealthCheck } from "./health/system.health.js";

@Module({
    name: "app",
    description: "DTaaS MCP Server",

    imports: [
        ConfigModule.forRoot(),
        ThingsBoardModule,
        DashboardModule,
        RuleChainModule
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
export class AppModule { }
