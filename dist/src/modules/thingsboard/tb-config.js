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
        fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), "utf8");
    }
    static hasConfig() {
        const config = this.get();
        return !!(config.tbUrl && config.tbApiKey);
    }
    static getUrl() {
        const config = this.get();
        return config.tbUrl || process.env.TB_URL || "https://thingsboard.cloud";
    }
    static getApiKey() {
        const config = this.get();
        return config.tbApiKey || process.env.TB_API_KEY || "";
    }
}
//# sourceMappingURL=tb-config.js.map