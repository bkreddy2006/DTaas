import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

export class DashboardService {

    private readonly TB_URL = process.env.TB_URL!;
    private readonly API_KEY = process.env.TB_API_KEY!;

    private readonly headers = {
        "Content-Type": "application/json",
        "X-Authorization": `ApiKey ${this.API_KEY}`
    };

    async createDashboard(
        title: string
    ) {

        // Optional authentication check
        const user = await axios.get(
            `${this.TB_URL}/api/auth/user`,
            {
                headers: this.headers
            }
        );

        console.log("Logged in as:", user.data.email);

        // Minimal empty dashboard — widgets can be added later
        // via the UI or a follow-up call.
        const configuration = {
            widgets: {},
            states: {
                default: {
                    name: "Default",
                    root: true,
                    layouts: {
                        main: {
                            widgets: {},
                            gridSettings: {
                                backgroundColor: "#eeeeee",
                                columns: 24,
                                margin: 10,
                                backgroundSizeMode: "100%"
                            }
                        }
                    }
                }
            }
        };

        const response = await axios.post(

            `${this.TB_URL}/api/dashboard`,

            {
                title,
                configuration
            },

            {
                headers: this.headers
            }

        );

        return response.data;

    }

    async getDashboard(
        dashboardId: string
    ) {

        const response = await axios.get(

            `${this.TB_URL}/api/dashboard/${dashboardId}`,

            {
                headers: this.headers
            }

        );

        return response.data;

    }

    async listDashboards(
        pageSize: number = 10,
        page: number = 0
    ) {

        const response = await axios.get(

            `${this.TB_URL}/api/user/dashboards?pageSize=${pageSize}&page=${page}`,

            {
                headers: this.headers
            }

        );

        return response.data;

    }

    async deleteDashboard(
        dashboardId: string
    ) {

        const response = await axios.delete(

            `${this.TB_URL}/api/dashboard/${dashboardId}`,

            {
                headers: this.headers
            }

        );

        return response.data;

    }

}