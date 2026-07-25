import {
    ToolDecorator as Tool,
    ExecutionContext,
    z
} from "@nitrostack/core";

import { DashboardService } from "./dashboard.service.js";

const service = new DashboardService();

export class DashboardTools {

    @Tool({

        name: "create_dashboard",

        description: "Create a new (empty) dashboard in ThingsBoard Cloud",

        inputSchema: z.object({

            title: z.string()
                .describe("Title of the dashboard")

        })

    })

    async createDashboard(

        input: {
            title: string;
        },

        ctx: ExecutionContext

    ) {

        ctx.logger.info(
            `Creating dashboard: ${input.title}`
        );

        try {

            const dashboard = await service.createDashboard(

                input.title

            );

            return {

                success: true,

                message: `Dashboard "${input.title}" created successfully.`,

                dashboard

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

        name: "get_dashboard",

        description: "Get a dashboard's full configuration by its ID",

        inputSchema: z.object({

            dashboardId: z.string()
                .describe("The dashboard's UUID")

        })

    })

    async getDashboard(

        input: {
            dashboardId: string;
        },

        ctx: ExecutionContext

    ) {

        ctx.logger.info(
            `Fetching dashboard: ${input.dashboardId}`
        );

        try {

            const dashboard = await service.getDashboard(
                input.dashboardId
            );

            return {

                success: true,

                dashboard

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

        name: "list_dashboards",

        description: "List dashboards visible to the current user",

        inputSchema: z.object({

            pageSize: z.number()
                .optional()
                .describe("Number of dashboards per page (default 10)"),

            page: z.number()
                .optional()
                .describe("Page number, zero-indexed (default 0)")

        })

    })

    async listDashboards(

        input: {
            pageSize?: number;
            page?: number;
        },

        ctx: ExecutionContext

    ) {

        ctx.logger.info("Listing dashboards");

        try {

            const dashboards = await service.listDashboards(
                input.pageSize,
                input.page
            );

            return {

                success: true,

                dashboards

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

        name: "delete_dashboard",

        description: "Delete a dashboard by its ID",

        inputSchema: z.object({

            dashboardId: z.string()
                .describe("The dashboard's UUID")

        })

    })

    async deleteDashboard(

        input: {
            dashboardId: string;
        },

        ctx: ExecutionContext

    ) {

        ctx.logger.info(
            `Deleting dashboard: ${input.dashboardId}`
        );

        try {

            await service.deleteDashboard(
                input.dashboardId
            );

            return {

                success: true,

                message: `Dashboard ${input.dashboardId} deleted successfully.`

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

}