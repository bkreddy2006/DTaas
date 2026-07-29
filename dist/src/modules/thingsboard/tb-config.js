import * as fs from "fs";
import * as path from "path";
export class ThingsBoardConfig {
    static configPath = path.resolve("scratch/thingsboard_config.json");
    static get() {
        try {
            if (fs.existsSync(this.configPath)) {
                const raw = fs.readFileSync(this.configPath, "utf8");
                return JSON.parse(raw);
            }
        }
        catch (e) {
            console.error("Failed to read user thingsboard config:", e);
        }
        return {};
    }
    static save(config) {
        const dir = path.dirname(this.configPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // Preserve any existing fields if we do partial updates
        const existing = this.get();
        const merged = { ...existing, ...config };
        fs.writeFileSync(this.configPath, JSON.stringify(merged, null, 2), "utf8");
    }
    static hasConfig() {
        return !!(this.getUrl() && this.getApiKey());
    }
    static hasGeminiConfig() {
        const config = this.get();
        return !!(config.geminiApiKey || process.env.GEMINI_API_KEY);
    }
    static getUrl() {
        const config = this.get();
        return config.tbUrl || process.env.TB_URL || "https://thingsboard.cloud";
    }
    static getApiKey() {
        const config = this.get();
        return config.tbApiKey || process.env.TB_API_KEY || "";
    }
    static getAuthHeaderValue() {
        const key = this.getApiKey();
        if (key.startsWith("eyJ")) {
            return `Bearer ${key}`;
        }
        return `ApiKey ${key}`;
    }
    static getGeminiApiKey() {
        const config = this.get();
        return config.geminiApiKey || process.env.GEMINI_API_KEY || "";
    }
}
//# sourceMappingURL=tb-config.js.map