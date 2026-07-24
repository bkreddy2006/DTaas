import { Module } from "@nitrostack/core";

import { ThingsBoardTools } from "./thingsboard.tools.js";
import { ThingsBoardService } from "./thingsboard.service.js";

@Module({

    name: "thingsboard",

    description: "ThingsBoard Tools",

    controllers: [

        ThingsBoardTools

    ],

    providers: [

        ThingsBoardService

    ]

})

export class ThingsBoardModule {}