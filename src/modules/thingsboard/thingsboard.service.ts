import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

export class ThingsBoardService {

    private readonly TB_URL = process.env.TB_URL!;
    private readonly API_KEY = process.env.TB_API_KEY!;

    private readonly headers = {
        "Content-Type": "application/json",
        "X-Authorization": `ApiKey ${this.API_KEY}`
    };

    async createDevice(
        deviceName: string,
        deviceType: string,
        label?: string
    ) {

        // Optional authentication check
        const user = await axios.get(
            `${this.TB_URL}/api/auth/user`,
            {
                headers: this.headers
            }
        );

        console.log("Logged in as:", user.data.email);

        const response = await axios.post(

            `${this.TB_URL}/api/device`,

            {
                name: deviceName,
                type: deviceType,
                label: label ?? deviceType
            },

            {
                headers: this.headers
            }

        );

        return response.data;

    }

}