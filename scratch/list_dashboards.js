import axios from "axios";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const TB_URL = process.env.TB_URL;
const API_KEY = process.env.TB_API_KEY;

async function run() {
    const res = await axios.get(
        `${TB_URL}/api/user/dashboards?pageSize=50&page=0`,
        {
            headers: {
                "Content-Type": "application/json",
                "X-Authorization": `ApiKey ${API_KEY}`
            }
        }
    );
    console.log("Dashboards:");
    for (const d of res.data.data) {
        console.log(`- ${d.title}: ${d.id.id}`);
    }
}

run().catch(console.error);
