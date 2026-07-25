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

    // --- Device Operations ---

    async createDevice(deviceName: string, deviceType: string, label?: string) {
        const response = await axios.post(
            `${this.TB_URL}/api/device`,
            { name: deviceName, type: deviceType, label: label ?? deviceType },
            { headers: this.headers }
        );
        return response.data;
    }

    async getDeviceByName(deviceName: string) {
        const response = await axios.get(
            `${this.TB_URL}/api/tenant/devices`,
            { headers: this.headers, params: { deviceName } }
        );
        return response.data;
    }

    async deleteDevice(deviceId: string) {
        const response = await axios.delete(
            `${this.TB_URL}/api/device/${deviceId}`,
            { headers: this.headers }
        );
        return response.data;
    }

    // --- Customer Operations ---

    async createCustomer(title: string, email?: string, phone?: string, address?: string, city?: string, country?: string) {
        const response = await axios.post(
            `${this.TB_URL}/api/customer`,
            { title, email, phone, address, city, country },
            { headers: this.headers }
        );
        return response.data;
    }

    async getCustomerByTitle(customerTitle: string) {
        const response = await axios.get(
            `${this.TB_URL}/api/tenant/customers`,
            { headers: this.headers, params: { customerTitle } }
        );
        return response.data;
    }

    async deleteCustomer(customerId: string) {
        const response = await axios.delete(
            `${this.TB_URL}/api/customer/${customerId}`,
            { headers: this.headers }
        );
        return response.data;
    }

    // --- Entity Group Operations ---

    async createEntityGroup(name: string, type: string) {
        const response = await axios.post(
            `${this.TB_URL}/api/entityGroup`,
            { name, type },
            { headers: this.headers }
        );
        return response.data;
    }

    async getEntityGroupsByType(entityType: string) {
        // Fetch all entity groups for a specific type (e.g., 'DEVICE')
        const response = await axios.get(
            `${this.TB_URL}/api/entityGroups/${entityType}`,
            { headers: this.headers }
        );
        return response.data; 
    }

    async deleteEntityGroup(groupId: string) {
        const response = await axios.delete(
            `${this.TB_URL}/api/entityGroup/${groupId}`,
            { headers: this.headers }
        );
        return response.data;
    }

    async addEntitiesToGroup(groupId: string, entityIds: string[]) {
        const response = await axios.post(
            `${this.TB_URL}/api/entityGroup/${groupId}/addEntities`,
            entityIds,
            { headers: this.headers }
        );
        return response.data;
    }

    async removeEntitiesFromGroup(groupId: string, entityIds: string[]) {
        // FIX: The correct ThingsBoard endpoint for removing entities ends in /deleteEntities, not /removeEntities
        const response = await axios.post(
            `${this.TB_URL}/api/entityGroup/${groupId}/deleteEntities`,
            entityIds,
            { headers: this.headers }
        );
        return response.data;
    }
}