import * as fs from "fs";
import * as path from "path";

export interface TBConfig {
    tbUrl?: string;
    tbApiKey?: string;
    geminiApiKey?: string;
}

export class ThingsBoardConfig {
    private static configPath = path.resolve("scratch/thingsboard_config.json");

    static get(): TBConfig {
        try {
            if (fs.existsSync(this.configPath)) {
                const raw = fs.readFileSync(this.configPath, "utf8");
                return JSON.parse(raw);
            }
        } catch (e) {
            console.error("Failed to read user thingsboard config:", e);
        }
        return {};
    }

    static save(config: TBConfig): void {
        const dir = path.dirname(this.configPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // Preserve any existing fields if we do partial updates
        const existing = this.get();
        const merged = { ...existing, ...config };
        fs.writeFileSync(this.configPath, JSON.stringify(merged, null, 2), "utf8");
    }

    static hasConfig(): boolean {
        const config = this.get();
        return !!(config.tbUrl && config.tbApiKey);
    }

    static hasGeminiConfig(): boolean {
        const config = this.get();
        return !!(config.geminiApiKey || process.env.GEMINI_API_KEY);
    }

    static getUrl(): string {
        const config = this.get();
        return config.tbUrl || process.env.TB_URL || "https://thingsboard.cloud";
    }

    static getApiKey(): string {
        const config = this.get();
        return config.tbApiKey || process.env.TB_API_KEY || "";
    }

    static getGeminiApiKey(): string {
        const config = this.get();
        return config.geminiApiKey || process.env.GEMINI_API_KEY || "";
    }
}
