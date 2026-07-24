import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { CalculatorModule } from './modules/calculator/calculator.module.js';
import { SystemHealthCheck } from './health/system.health.js';
import { ThingsBoardModule } from "./modules/thingsboard/thingsboard.module.js";
/**
 * Root Application Module
 * 
 * This is the main module that bootstraps the MCP server.
 * It registers all feature modules and health checks.
 */
@McpApp({
  module: AppModule,
  server: {
    name: "calculator-server",
    version: "1.0.0"
  },
  logging: {
    level: "info"
  }
})

@Module({
  name: "app",
  description: "Root application module",

  imports: [
    ConfigModule.forRoot(),
    CalculatorModule,
    ThingsBoardModule      // <-- Add this
  ],

  providers: [
    SystemHealthCheck
  ]
})

export class AppModule {}
