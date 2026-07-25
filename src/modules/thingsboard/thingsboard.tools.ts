import {
    ToolDecorator as Tool,
    ExecutionContext,
    z
} from "@nitrostack/core";

import { ThingsBoardService } from "./thingsboard.service.js";

const service = new ThingsBoardService();

export class ThingsBoardTools {

    // --- Device Tools ---

    @Tool({

        name: "create_device",

        description: "Create any device in ThingsBoard Cloud",

        inputSchema: z.object({

            deviceName: z.string()
                .describe("Name of the device"),

            deviceType: z.string()
                .describe("Device type (Smart Light, Smart Plug, Smart Meter, CCTV, etc.)"),

            label: z.string()
                .optional()
                .describe("Optional label")

        })

    })

    async createDevice(

        input: {
            deviceName: string;
            deviceType: string;
            label?: string;
        },

        ctx: ExecutionContext

    ) {

        ctx.logger.info(
            `Creating ${input.deviceType}: ${input.deviceName}`
        );

        try {

            const device = await service.createDevice(

                input.deviceName,

                input.deviceType,

                input.label

            );

            return {

                success: true,

                message: `${input.deviceType} created successfully.`,

                device

            };

        } catch (e: any) {

            return {

                success: false,

                message:
                    e.response?.data ??
                    e.message

            };

        }

    }

    @Tool({

        name: "delete_device",

        description: "Delete an existing device by its name from ThingsBoard Cloud",

        inputSchema: z.object({

            deviceName: z.string()
                .describe("The name of the device to delete")

        })

    })

    async deleteDevice(

        input: {
            deviceName: string;
        },

        ctx: ExecutionContext

    ) {

        ctx.logger.info(
            `Attempting to delete device named: ${input.deviceName}`
        );

        try {

            // Step 1: Find the device by name to get its ID
            const device = await service.getTenantDevice(input.deviceName);

            if (!device || !device.id || !device.id.id) {
                return {
                    status: "ERROR",
                    message: `Device with name '${input.deviceName}' not found.`,
                    deviceName: input.deviceName
                };
            }

            const deviceId = device.id.id;

            // Step 2: Delete using the retrieved ID
            await service.deleteDevice(deviceId);

            return {

                status: "OK",

                message: `Device '${input.deviceName}' (ID: ${deviceId}) deleted successfully.`,

                deviceName: input.deviceName

            };

        } catch (e: any) {

            return {

                status: "ERROR",

                message:
                    e.response?.data?.message ??
                    e.response?.data ??
                    e.message,

                deviceName: input.deviceName

            };

        }

    }

    // --- Customer Tools ---

    @Tool({

        name: "create_customer",

        description: "Create a new customer in ThingsBoard Cloud",

        inputSchema: z.object({

            title: z.string()
                .describe("Title or business name of the customer"),

            email: z.string()
                .email()
                .optional()
                .describe("Customer email address"),

            phone: z.string()
                .optional()
                .describe("Customer phone number"),

            address: z.string()
                .optional()
                .describe("Customer street address"),

            city: z.string()
                .optional()
                .describe("Customer city"),

            country: z.string()
                .optional()
                .describe("Customer country")

        })

    })

    async createCustomer(

        input: {
            title: string;
            email?: string;
            phone?: string;
            address?: string;
            city?: string;
            country?: string;
        },

        ctx: ExecutionContext

    ) {

        ctx.logger.info(
            `Creating customer: ${input.title}`
        );

        try {

            const customer = await service.createCustomer(

                input.title,

                input.email,

                input.phone,

                input.address,

                input.city,

                input.country

            );

            return {

                success: true,

                message: `Customer '${input.title}' created successfully.`,

                customer

            };

        } catch (e: any) {

            return {

                success: false,

                message:
                    e.response?.data?.message ??
                    e.response?.data ??
                    e.message

            };

        }

    }

    @Tool({

        name: "delete_customer",

        description: "Delete an existing customer by title or ID from ThingsBoard Cloud",

        inputSchema: z.object({

            customerTitle: z.string()
                .optional()
                .describe("The title of the customer to delete"),

            customerId: z.string()
                .uuid()
                .optional()
                .describe("The UUID string of the customer to delete")

        })

    })

    async deleteCustomer(

        input: {
            customerTitle?: string;
            customerId?: string;
        },

        ctx: ExecutionContext

    ) {

        ctx.logger.info(
            `Attempting to delete customer: ${input.customerTitle || input.customerId}`
        );

        try {

            let targetId = input.customerId;

            // Step 1: If title is given instead of ID, resolve ID first
            if (!targetId && input.customerTitle) {

                const customer = await service.getTenantCustomer(input.customerTitle);

                if (!customer || !customer.id || !customer.id.id) {
                    return {
                        status: "ERROR",
                        message: `Customer with title '${input.customerTitle}' not found.`
                    };
                }

                targetId = customer.id.id;

            }

            if (!targetId) {

                return {

                    status: "ERROR",

                    message: "Either customerTitle or customerId must be provided."

                };

            }

            // Step 2: Delete using customerId
            await service.deleteCustomer(targetId);

            return {

                status: "OK",

                message: `Customer (ID: ${targetId}) deleted successfully.`,

                customerId: targetId

            };

        } catch (e: any) {

            return {

                status: "ERROR",

                message:
                    e.response?.data?.message ??
                    e.response?.data ??
                    e.message

            };

        }

    }

}