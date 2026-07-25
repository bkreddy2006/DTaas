import axios from "axios";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const TB_URL = process.env.TB_URL;
const API_KEY = process.env.TB_API_KEY;
const dashboardId = "e10a5430-8814-11f1-a40e-2ba7ae4918b3";

async function run() {
    const res = await axios.get(
        `${TB_URL}/api/dashboard/${dashboardId}`,
        {
            headers: {
                "Content-Type": "application/json",
                "X-Authorization": `ApiKey ${API_KEY}`
            }
        }
    );
    fs.writeFileSync("c:/Nitrostack/DTaas/scratch/dashboard_dump.json", JSON.stringify(res.data, null, 2));
    console.log("Dumped dashboard successfully.");
}

run().catch(console.error);
