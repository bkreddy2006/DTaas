import { ToolDecorator as Tool, ExecutionContext, z } from "@nitrostack/core";
import { ThingsBoardService } from "./thingsboard.service.js";

const service = new ThingsBoardService();

export class ThingsBoardTools {

    // --- Device Tools ---

    @Tool({
        name: "create_device",
        description: "Create any device in ThingsBoard Cloud",
        inputSchema: z.object({
            deviceName: z.string().describe("Name of the device"),
            deviceType: z.string().describe("Device type (Smart Light, Smart Plug, Smart Meter, CCTV, etc.)"),
            label: z.string().optional().describe("Optional label")
        })
    })
    async createDevice(input: { deviceName: string; deviceType: string; label?: string; }, ctx: ExecutionContext) {
        ctx.logger.info(`Creating ${input.deviceType}: ${input.deviceName}`);
        try {
            const device = await service.createDevice(input.deviceName, input.deviceType, input.label);
            return { success: true, message: `${input.deviceType} created successfully.`, device };
        } catch (e: any) {
            return { success: false, message: e.response?.data ?? e.message };
        }
    }

    @Tool({
        name: "delete_device",
        description: "Delete an existing device by its name from ThingsBoard Cloud",
        inputSchema: z.object({
            deviceName: z.string().describe("The name of the device to delete")
        })
    })
    async deleteDevice(input: { deviceName: string; }, ctx: ExecutionContext) {
        ctx.logger.info(`Attempting to delete device named: ${input.deviceName}`);
        try {
            const device = await service.getDeviceByName(input.deviceName);
            if (!device || !device.id || !device.id.id) {
                return { status: "ERROR", message: `Device with name '${input.deviceName}' not found.` };
            }
            await service.deleteDevice(device.id.id);
            return { status: "OK", message: `Device '${input.deviceName}' deleted successfully.` };
        } catch (e: any) {
            return { status: "ERROR", message: e.response?.data?.message ?? e.response?.data ?? e.message };
        }
    }

    // --- Customer Tools ---

    @Tool({
        name: "create_customer",
        description: "Create a new customer in ThingsBoard Cloud",
        inputSchema: z.object({
            title: z.string().describe("Title or business name of the customer"),
            email: z.string().email().optional().describe("Customer email address"),
            phone: z.string().optional().describe("Customer phone number"),
            address: z.string().optional().describe("Customer street address"),
            city: z.string().optional().describe("Customer city"),
            country: z.string().optional().describe("Customer country")
        })
    })
    async createCustomer(input: { title: string; email?: string; phone?: string; address?: string; city?: string; country?: string; }, ctx: ExecutionContext) {
        ctx.logger.info(`Creating customer: ${input.title}`);
        try {
            const customer = await service.createCustomer(input.title, input.email, input.phone, input.address, input.city, input.country);
            return { success: true, message: `Customer '${input.title}' created successfully.`, customer };
        } catch (e: any) {
            return { success: false, message: e.response?.data?.message ?? e.response?.data ?? e.message };
        }
    }

    @Tool({
        name: "delete_customer",
        description: "Delete an existing customer by its title from ThingsBoard Cloud",
        inputSchema: z.object({
            customerTitle: z.string().describe("The title of the customer to delete")
        })
    })
    async deleteCustomer(input: { customerTitle: string; }, ctx: ExecutionContext) {
        ctx.logger.info(`Attempting to delete customer: ${input.customerTitle}`);
        try {
            const customer = await service.getCustomerByTitle(input.customerTitle);
            if (!customer || !customer.id || !customer.id.id) {
                return { status: "ERROR", message: `Customer with title '${input.customerTitle}' not found.` };
            }
            await service.deleteCustomer(customer.id.id);
            return { status: "OK", message: `Customer '${input.customerTitle}' deleted successfully.` };
        } catch (e: any) {
            return { status: "ERROR", message: e.response?.data?.message ?? e.response?.data ?? e.message };
        }
    }

    // --- Entity Group Tools ---

    @Tool({
        name: "create_entity_group",
        description: "Create a new entity group in ThingsBoard Cloud",
        inputSchema: z.object({
            name: z.string().describe("Name of the entity group (e.g., 'Water meters')"),
            type: z.string().describe("Type of the entity group (e.g., 'DEVICE', 'ASSET', 'CUSTOMER')")
        })
    })
    async createEntityGroup(input: { name: string; type: string; }, ctx: ExecutionContext) {
        const sanitizedType = input.type.toUpperCase();
        ctx.logger.info(`Creating Entity Group: ${input.name} of type ${sanitizedType}`);
        try {
            const entityGroup = await service.createEntityGroup(input.name, sanitizedType);
            return { success: true, message: `Entity Group '${input.name}' created successfully.`, entityGroup };
        } catch (e: any) {
            return { success: false, message: e.response?.data?.message ?? e.response?.data ?? e.message };
        }
    }

    @Tool({
        name: "delete_entity_group",
        description: "Delete an existing entity group by its name from ThingsBoard Cloud",
        inputSchema: z.object({
            groupName: z.string().describe("The name of the entity group to delete"),
            groupType: z.string().describe("The type of the entity group (e.g., 'DEVICE', 'ASSET')")
        })
    })
    async deleteEntityGroup(input: { groupName: string; groupType: string; }, ctx: ExecutionContext) {
        const sanitizedType = input.groupType.toUpperCase();
        ctx.logger.info(`Attempting to delete Entity Group: ${input.groupName} of type ${sanitizedType}`);
        try {
            // Fetch all groups of this type and filter by name to get the UUID
            const groups = await service.getEntityGroupsByType(sanitizedType);
            const group = groups.find((g: any) => g.name === input.groupName);
            
            if (!group || !group.id || !group.id.id) {
                return { status: "ERROR", message: `Entity Group with name '${input.groupName}' of type '${sanitizedType}' not found.` };
            }
            
            await service.deleteEntityGroup(group.id.id);
            return { status: "OK", message: `Entity Group '${input.groupName}' deleted successfully.` };
        } catch (e: any) {
            return { status: "ERROR", message: e.response?.data?.message ?? e.response?.data ?? e.message };
        }
    }

    @Tool({
        name: "add_entities_to_group",
        description: "Add one or more entities to an entity group using their names",
        inputSchema: z.object({
            groupName: z.string().describe("The name of the target entity group"),
            entityType: z.string().describe("Type of the entities and group (e.g., 'DEVICE', 'CUSTOMER')"),
            entityNames: z.string().describe("Comma-separated list of entity names to add")
        })
    })
    async addEntitiesToGroup(input: { groupName: string; entityType: string; entityNames: string; }, ctx: ExecutionContext) {
        const sanitizedType = input.entityType.toUpperCase();
        ctx.logger.info(`Adding entities to group '${input.groupName}' of type ${sanitizedType}`);
        try {
            // 1. Get Group UUID by Name
            const groups = await service.getEntityGroupsByType(sanitizedType);
            const group = groups.find((g: any) => g.name === input.groupName);
            if (!group) throw new Error(`Entity Group '${input.groupName}' not found.`);
            const groupId = group.id.id;

            // 2. Map Entity Names to UUIDs
            const namesArray = input.entityNames.split(',').map(n => n.trim()).filter(n => n);
            const entityIds: string[] = [];

            for (const name of namesArray) {
                if (sanitizedType === 'DEVICE') {
                    const d = await service.getDeviceByName(name);
                    if (d && d.id?.id) entityIds.push(d.id.id);
                } else if (sanitizedType === 'CUSTOMER') {
                    const c = await service.getCustomerByTitle(name);
                    if (c && c.id?.id) entityIds.push(c.id.id);
                } else {
                    throw new Error(`Resolving names for entity type '${sanitizedType}' is currently not supported in this tool.`);
                }
            }

            if (entityIds.length === 0) {
                return { status: "ERROR", message: "No valid entity IDs could be resolved from the provided names." };
            }

            // 3. Execute Add Operation
            await service.addEntitiesToGroup(groupId, entityIds);
            return { status: "OK", message: `Successfully added ${entityIds.length} entities to group '${input.groupName}'.` };
        } catch (e: any) {
            return { status: "ERROR", message: e.response?.data?.message ?? e.response?.data ?? e.message };
        }
    }

    @Tool({
        name: "remove_entities_from_group",
        description: "Remove one or more entities from an entity group using their names",
        inputSchema: z.object({
            groupName: z.string().describe("The name of the target entity group"),
            entityType: z.string().describe("Type of the entities and group (e.g., 'DEVICE', 'CUSTOMER')"),
            entityNames: z.string().describe("Comma-separated list of entity names to remove")
        })
    })
    async removeEntitiesFromGroup(input: { groupName: string; entityType: string; entityNames: string; }, ctx: ExecutionContext) {
        const sanitizedType = input.entityType.toUpperCase();
        ctx.logger.info(`Removing entities from group '${input.groupName}'`);
        try {
            // 1. Get Group UUID by Name
            const groups = await service.getEntityGroupsByType(sanitizedType);
            const group = groups.find((g: any) => g.name === input.groupName);
            if (!group) throw new Error(`Entity Group '${input.groupName}' not found.`);
            const groupId = group.id.id;

            // 2. Map Entity Names to UUIDs
            const namesArray = input.entityNames.split(',').map(n => n.trim()).filter(n => n);
            const entityIds: string[] = [];

            for (const name of namesArray) {
                if (sanitizedType === 'DEVICE') {
                    const d = await service.getDeviceByName(name);
                    if (d && d.id?.id) entityIds.push(d.id.id);
                } else if (sanitizedType === 'CUSTOMER') {
                    const c = await service.getCustomerByTitle(name);
                    if (c && c.id?.id) entityIds.push(c.id.id);
                }
            }

            if (entityIds.length === 0) {
                return { status: "ERROR", message: "No valid entity IDs could be resolved from the provided names." };
            }

            // 3. Execute Remove Operation
            await service.removeEntitiesFromGroup(groupId, entityIds);
            return { status: "OK", message: `Successfully removed ${entityIds.length} entities from group '${input.groupName}'.` };
        } catch (e: any) {
            return { status: "ERROR", message: e.response?.data?.message ?? e.response?.data ?? e.message };
        }
    }
}