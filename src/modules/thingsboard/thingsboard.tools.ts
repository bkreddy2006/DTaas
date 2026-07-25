import {
    ToolDecorator as Tool,
    ExecutionContext,
    z
} from "@nitrostack/core";

import { ThingsBoardService } from "./thingsboard.service.js";
import * as crypto from 'crypto';
const service = new ThingsBoardService();

export class ThingsBoardTools {

    // --- Existing Device Tool ---
    @Tool({
        name: "create_device",
        description: "Create any device in ThingsBoard Cloud",
        inputSchema: z.object({
            deviceName: z.string().describe("Name of the device"),
            deviceType: z.string().describe("Device type (Smart Light, Smart Plug, Smart Meter, CCTV, etc.)"),
            label: z.string().optional().describe("Optional label")
        })
    })
    async createDevice(
        input: { deviceName: string; deviceType: string; label?: string; },
        ctx: ExecutionContext
    ) {
        ctx.logger.info(`Creating ${input.deviceType}: ${input.deviceName}`);
        try {
            const device = await service.createDevice(input.deviceName, input.deviceType, input.label);
            return { success: true, message: `${input.deviceType} created successfully.`, device };
        } catch (e: any) {
            return { success: false, message: e.response?.data ?? e.message };
        }
    }

    // --- Alarm Tools ---
    @Tool({
        name: "save_alarm",
        description: "Create or update an alarm. Deduplicated by originator + type.",
        inputSchema: z.object({
            originatorId: z.string().describe("The UUID of the originator entity"),
            originatorType: z.enum(["DEVICE", "ASSET"]).describe("The type of the originator"),
            type: z.string().describe("Alarm type/name (e.g., 'High Temperature')"),
            severity: z.enum(["CRITICAL", "MAJOR", "MINOR", "WARNING", "INDETERMINATE"]).describe("Urgency of the alarm"),
            propagate: z.boolean().optional().describe("Whether to propagate alarm to related entities"),
            details: z.record(z.any()).optional().describe("Optional JSON context details")
        })
    })
    async saveAlarm(
        input: { originatorId: string; originatorType: string; type: string; severity: string; propagate?: boolean; details?: Record<string, any>; },
        ctx: ExecutionContext
    ) {
        ctx.logger.info(`Saving alarm: ${input.type} for ${input.originatorType} ${input.originatorId}`);
        try {
            const alarmData = {
                originator: { id: input.originatorId, entityType: input.originatorType },
                type: input.type,
                severity: input.severity,
                propagate: input.propagate ?? false,
                details: input.details ?? {}
            };
            const alarm = await service.saveAlarm(alarmData);
            return { success: true, message: "Alarm saved successfully", alarm };
        } catch (e: any) {
            return { success: false, message: e.response?.data ?? e.message };
        }
    }

    @Tool({
        name: "delete_alarm",
        description: "Permanently delete an alarm by its id.",
        inputSchema: z.object({
            alarmId: z.string().describe("The UUID of the alarm")
        })
    })
    async deleteAlarm(input: { alarmId: string; }, ctx: ExecutionContext) {
        ctx.logger.info(`Deleting alarm: ${input.alarmId}`);
        try {
            const result = await service.deleteAlarm(input.alarmId);
            return { success: true, message: "Alarm deleted successfully", result };
        } catch (e: any) {
            return { success: false, message: e.response?.data ?? e.message };
        }
    }

    @Tool({
        name: "ack_alarm",
        description: "Acknowledge an alarm. Sets 'ack_ts' and triggers ALARM_ACK event.",
        inputSchema: z.object({
            alarmId: z.string().describe("The UUID of the alarm")
        })
    })
    async ackAlarm(input: { alarmId: string; }, ctx: ExecutionContext) {
        ctx.logger.info(`Acknowledging alarm: ${input.alarmId}`);
        try {
            const result = await service.ackAlarm(input.alarmId);
            return { success: true, message: "Alarm acknowledged successfully", result };
        } catch (e: any) {
            return { success: false, message: e.response?.data ?? e.message };
        }
    }

    @Tool({
        name: "clear_alarm",
        description: "Clear an alarm. Sets 'clear_ts' and triggers ALARM_CLEAR event.",
        inputSchema: z.object({
            alarmId: z.string().describe("The UUID of the alarm")
        })
    })
    async clearAlarm(input: { alarmId: string; }, ctx: ExecutionContext) {
        ctx.logger.info(`Clearing alarm: ${input.alarmId}`);
        try {
            const result = await service.clearAlarm(input.alarmId);
            return { success: true, message: "Alarm cleared successfully", result };
        } catch (e: any) {
            return { success: false, message: e.response?.data ?? e.message };
        }
    }

    @Tool({
        name: "get_alarm_info_by_id",
        description: "Get alarm details by id, including originator name.",
        inputSchema: z.object({
            alarmId: z.string().describe("The UUID of the alarm")
        })
    })
    async getAlarmInfoById(input: { alarmId: string; }, ctx: ExecutionContext) {
        ctx.logger.info(`Fetching alarm info for: ${input.alarmId}`);
        try {
            const alarm = await service.getAlarmInfoById(input.alarmId);
            return { success: true, alarm };
        } catch (e: any) {
            return { success: false, message: e.response?.data ?? e.message };
        }
    }

    @Tool({
        name: "get_alarms",
        description: "Get a paginated list of alarms for a specific entity.",
        inputSchema: z.object({
            entityType: z.enum(["DEVICE", "ASSET"]).describe("Type of the entity"),
            entityId: z.string().describe("UUID of the entity"),
            pageSize: z.number().default(10).describe("Number of alarms per page"),
            page: z.number().default(0).describe("Page number"),
            searchStatus: z.enum(["ANY", "ACTIVE", "CLEARED", "ACK", "UNACK"]).optional(),
            status: z.enum(["ACTIVE_UNACK", "ACTIVE_ACK", "CLEARED_UNACK", "CLEARED_ACK"]).optional()
        })
    })
    async getAlarms(
        input: { entityType: string; entityId: string; pageSize: number; page: number; searchStatus?: string; status?: string; },
        ctx: ExecutionContext
    ) {
        ctx.logger.info(`Fetching alarms for ${input.entityType} ${input.entityId}`);
        try {
            const params: any = { pageSize: input.pageSize, page: input.page };
            if (input.searchStatus) params.searchStatus = input.searchStatus;
            if (input.status) params.status = input.status;
            
            const alarms = await service.getAlarms(input.entityType, input.entityId, params);
            return { success: true, alarms };
        } catch (e: any) {
            return { success: false, message: e.response?.data ?? e.message };
        }
    }

    @Tool({
        name: "get_all_alarms",
        description: "Get all alarms visible to the current user.",
        inputSchema: z.object({
            pageSize: z.number().default(10).describe("Number of alarms per page"),
            page: z.number().default(0).describe("Page number"),
            searchStatus: z.enum(["ANY", "ACTIVE", "CLEARED", "ACK", "UNACK"]).optional(),
            status: z.enum(["ACTIVE_UNACK", "ACTIVE_ACK", "CLEARED_UNACK", "CLEARED_ACK"]).optional()
        })
    })
    async getAllAlarms(
        input: { pageSize: number; page: number; searchStatus?: string; status?: string; },
        ctx: ExecutionContext
    ) {
        ctx.logger.info(`Fetching all alarms, page: ${input.page}`);
        try {
            const params: any = { pageSize: input.pageSize, page: input.page };
            if (input.searchStatus) params.searchStatus = input.searchStatus;
            if (input.status) params.status = input.status;
            
            const alarms = await service.getAllAlarms(params);
            return { success: true, alarms };
        } catch (e: any) {
            return { success: false, message: e.response?.data ?? e.message };
        }
    }

    @Tool({
        name: "get_highest_alarm_severity",
        description: "Get the highest active alarm severity for an entity.",
        inputSchema: z.object({
            entityType: z.enum(["DEVICE", "ASSET"]).describe("Type of the entity"),
            entityId: z.string().describe("UUID of the entity"),
            searchStatus: z.enum(["ANY", "ACTIVE", "CLEARED", "ACK", "UNACK"]).optional(),
            status: z.enum(["ACTIVE_UNACK", "ACTIVE_ACK", "CLEARED_UNACK", "CLEARED_ACK"]).optional()
        })
    })
    async getHighestAlarmSeverity(
        input: { entityType: string; entityId: string; searchStatus?: string; status?: string; },
        ctx: ExecutionContext
    ) {
        ctx.logger.info(`Fetching highest alarm severity for ${input.entityType} ${input.entityId}`);
        try {
            const params: any = {};
            if (input.searchStatus) params.searchStatus = input.searchStatus;
            if (input.status) params.status = input.status;
            
            const severity = await service.getHighestAlarmSeverity(input.entityType, input.entityId, params);
            return { success: true, severity };
        } catch (e: any) {
            return { success: false, message: e.response?.data ?? e.message };
        }
    }

    @Tool({
        name: "get_alarm_types",
        description: "List unique alarm type names visible to the current user.",
        inputSchema: z.object({
            pageSize: z.number().default(10).describe("Number of alarms per page"),
            page: z.number().default(0).describe("Page number")
        })
    })
    async getAlarmTypes(
        input: { pageSize: number; page: number; },
        ctx: ExecutionContext
    ) {
        ctx.logger.info(`Fetching alarm types`);
        try {
            const types = await service.getAlarmTypes({ pageSize: input.pageSize, page: input.page });
            return { success: true, types };
        } catch (e: any) {
            return { success: false, message: e.response?.data ?? e.message };
        }
    }

    // --- Device Profile & Alarm Rules Tools ---

    @Tool({
        name: "get_device_profile",
        description: "Fetch a Device Profile to view its configuration, including existing Alarm Rules.",
        inputSchema: z.object({
            profileId: z.string().describe("The UUID of the device profile")
        })
    })
    async getDeviceProfile(input: { profileId: string; }, ctx: ExecutionContext) {
        ctx.logger.info(`Fetching Device Profile: ${input.profileId}`);
        try {
            const profile = await service.getDeviceProfileById(input.profileId);
            return { success: true, profile };
        } catch (e: any) {
            return { success: false, message: e.response?.data ?? e.message };
        }
    }

    @Tool({
        name: "add_alarm_rule_to_profile",
        description: "Safely injects a new Alarm Rule into an existing Device Profile.",
        inputSchema: z.object({
            profileId: z.string().describe("The UUID of the device profile to update"),
            alarmType: z.string().describe("The name of the alarm (e.g., 'Motion Detected')"),
            severity: z.enum(["CRITICAL", "MAJOR", "MINOR", "WARNING", "INDETERMINATE"]).describe("Alarm severity"),
            conditionKey: z.string().describe("The telemetry key to monitor (e.g., 'motion')"),
            conditionValueType: z.enum(["NUMERIC", "STRING", "BOOLEAN"]).describe("Type of the telemetry value"),
            conditionOperation: z.enum(["EQUAL", "NOT_EQUAL", "GREATER", "LESS", "GREATER_OR_EQUAL", "LESS_OR_EQUAL"]),
            conditionThreshold: z.any().describe("The threshold value that triggers the alarm (e.g., true, 50, 'active')")
        })
    })
    async addAlarmRuleToProfile(
        input: { 
            profileId: string; 
            alarmType: string; 
            severity: string; 
            conditionKey: string;
            conditionValueType: string;
            conditionOperation: string;
            conditionThreshold: any;
        },
        ctx: ExecutionContext
    ) {
        ctx.logger.info(`Adding Alarm Rule '${input.alarmType}' to Profile: ${input.profileId}`);
        try {
            // 1. Fetch existing profile
            const profile = await service.getDeviceProfileById(input.profileId);
            
            // 2. Initialize alarms array if it doesn't exist
            if (!profile.profileData) profile.profileData = {};
            if (!profile.profileData.alarms) profile.profileData.alarms = [];

            // 3. ThingsBoard requires a valid UUID for the internal rule ID
            const ruleId = crypto.randomUUID();

            // 4. Construct the structured ThingsBoard JSON
            const newAlarmRule = {
                id: ruleId,
                alarmType: input.alarmType,
                createRules: {
                    [input.severity]: {
                        condition: {
                            condition: [
                                {
                                    key: { type: "TIME_SERIES", key: input.conditionKey },
                                    valueType: input.conditionValueType,
                                    value: null,
                                    predicate: {
                                        type: input.conditionValueType, // Matches NUMERIC, STRING, or BOOLEAN
                                        operation: input.conditionOperation,
                                        value: {
                                            defaultValue: input.conditionThreshold,
                                            dynamicValue: null
                                        }
                                    }
                                }
                            ],
                            spec: { type: "SIMPLE" }
                        },
                        schedule: null,
                        alarmDetails: null
                    }
                },
                clearRule: null,
                propagate: false,
                propagateToOwner: false,
                propagateToTenant: false,
                propagateRelationTypes: null
            };

            // 5. Append and Save
            profile.profileData.alarms.push(newAlarmRule);
            const updatedProfile = await service.saveDeviceProfile(profile);

            return { success: true, message: `Alarm rule '${input.alarmType}' added to profile.`, profile: updatedProfile };
        } catch (e: any) {
            return { success: false, message: e.response?.data ?? e.message };
        }
    }
}