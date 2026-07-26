import { Module } from "@nitrostack/core";

import { DigitalTwinTools } from "./digital-twin.tools.js";

@Module({
    name: "digital-twin",
    description: "AI powered Digital Twin creation",

    controllers: [
        DigitalTwinTools
    ]
})
export class DigitalTwinModule {}