// src/agents/planner/gemini.service.ts

import { GoogleGenAI } from "@google/genai";
import { ThingsBoardConfig } from "../../modules/thingsboard/tb-config.js";

export class GeminiService {
    async generate(prompt: string): Promise<string> {
        const apiKey = ThingsBoardConfig.getGeminiApiKey();
        if (!apiKey) {
            throw new Error("Gemini API key is not configured. Please use the 'configure_credentials' tool first to configure your Gemini API Key before creating or building anything.");
        }

        const ai = new GoogleGenAI({ apiKey });
        const models = [
            "gemini-2.5-flash",
            "gemini-3.5-flash"
        ];

    for (const model of models) {

        try {

            const response =
                await ai.models.generateContent({

                    model,

                    contents: prompt

                });

            return response.text ?? "";

        } catch (err) {

            console.error(`${model} failed`);

        }

    }

    throw new Error("All Gemini models failed.");

}

}