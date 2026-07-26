import { ExecutionContext } from "@nitrostack/core";
export declare class DigitalTwinTools {
    createDigitalTwin(input: {
        prompt: string;
    }, ctx: ExecutionContext): Promise<{
        success: boolean;
        specification: {
            twinName: string;
            twinType: string;
            devices: {
                type: string;
                count: number;
                namePrefix?: string | undefined;
                label?: string | undefined;
            }[];
            dashboards: {
                name: string;
            }[];
            ruleChains: {
                name: string;
            }[];
            alarms: {
                type: string;
                severity: "CRITICAL" | "MAJOR" | "MINOR" | "WARNING" | "INDETERMINATE";
                condition?: any;
            }[];
            users: {
                email: string;
                authority: "TENANT_ADMIN" | "CUSTOMER_USER";
                firstName?: string | undefined;
                lastName?: string | undefined;
            }[];
            customers: {
                title: string;
                email?: string | undefined;
                phone?: string | undefined;
                address?: string | undefined;
                city?: string | undefined;
                country?: string | undefined;
            }[];
            emulators: {
                deviceName: string;
                emulatorType: string;
                scenario: string;
                telemetryRateSeconds: number;
            }[];
        };
        graph: import("../../agents/twin-graph.js").TwinGraph;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        specification?: undefined;
        graph?: undefined;
    }>;
}
//# sourceMappingURL=digital-twin.tools.d.ts.map