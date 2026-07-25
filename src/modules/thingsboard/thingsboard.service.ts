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
        const user = await axios.get(
            `${this.TB_URL}/api/auth/user`,
            { headers: this.headers }
        );

        console.log("Logged in as:", user.data.email);

        const response = await axios.post(
            `${this.TB_URL}/api/device`,
            {
                name: deviceName,
                type: deviceType,
                label: label ?? deviceType
            },
            { headers: this.headers }
        );

        return response.data;
    }

    // ---------- ASSET METHODS ----------

    async createAsset(
        assetName: string,
        assetType: string,
        label?: string
    ) {
        const response = await axios.post(
            `${this.TB_URL}/api/asset`,
            {
                name: assetName,
                type: assetType,
                label: label ?? assetType
            },
            { headers: this.headers }
        );

        return response.data;
    }

    /**
     * ThingsBoard's delete endpoint needs an assetId, not a name.
     * This resolves the name -> id first.
     */
    async getAssetByName(assetName: string) {
        const response = await axios.get(
            `${this.TB_URL}/api/tenant/assets`,
            {
                headers: this.headers,
                params: { assetName }
            }
        );

        return response.data; // contains id.id
    }

    async deleteAsset(assetName: string) {
        const asset = await this.getAssetByName(assetName);

        if (!asset?.id?.id) {
            throw new Error(`Asset "${assetName}" not found.`);
        }

        const assetId = asset.id.id;

        const response = await axios.delete(
            `${this.TB_URL}/api/asset/${assetId}`,
            { headers: this.headers }
        );

        return {
            deletedAssetId: assetId,
            status: response.status
        };
    }

}