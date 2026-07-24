import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const TB_URL = process.env.TB_URL!;
const API_KEY = process.env.TB_API_KEY!;

export class ThingsBoardService {

    async createSmartLight(deviceName: string, label?: string) {

        const response = await axios.post(

            `${TB_URL}/api/device`,

            {
                name: deviceName,
                type: "Smart Light",
                label: label ?? "Smart Light"
            },

            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Authorization": `ApiKey ${API_KEY}`
                }
            }

        );

        return response.data;

    }

}