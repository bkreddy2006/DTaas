export interface TBConfig {
    tbUrl?: string;
    tbApiKey?: string;
}
export declare class ThingsBoardConfig {
    private static configPath;
    static get(): TBConfig;
    static save(config: TBConfig): void;
    static hasConfig(): boolean;
    static getUrl(): string;
    static getApiKey(): string;
}
//# sourceMappingURL=tb-config.d.ts.map