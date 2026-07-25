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

    // --- Existing Device Method ---
    async createDevice(deviceName: string, deviceType: string, label?: string) {
        const response = await axios.post(
            `${this.TB_URL}/api/device`,
            { name: deviceName, type: deviceType, label: label ?? deviceType },
            { headers: this.headers }
        );
        return response.data;
    }

    // --- Alarm Methods ---
    async saveAlarm(alarmData: any) {
        const response = await axios.post(
            `${this.TB_URL}/api/alarm`,
            alarmData,
            { headers: this.headers }
        );
        return response.data;
    }

    async deleteAlarm(alarmId: string) {
        const response = await axios.delete(
            `${this.TB_URL}/api/alarm/${alarmId}`,
            { headers: this.headers }
        );
        return response.data || { status: "OK", id: alarmId };
    }

    async ackAlarm(alarmId: string) {
        const response = await axios.post(
            `${this.TB_URL}/api/alarm/${alarmId}/ack`,
            {},
            { headers: this.headers }
        );
        return response.data || { status: "OK", id: alarmId };
    }

    async clearAlarm(alarmId: string) {
        const response = await axios.post(
            `${this.TB_URL}/api/alarm/${alarmId}/clear`,
            {},
            { headers: this.headers }
        );
        return response.data || { status: "OK", id: alarmId };
    }

    async getAlarmInfoById(alarmId: string) {
        const response = await axios.get(
            `${this.TB_URL}/api/alarm/info/${alarmId}`,
            { headers: this.headers }
        );
        return response.data;
    }

    async getAlarms(entityType: string, entityId: string, params: any) {
        const response = await axios.get(
            `${this.TB_URL}/api/alarm/${entityType}/${entityId}`,
            { headers: this.headers, params }
        );
        return response.data;
    }

    async getAllAlarms(params: any) {
        const response = await axios.get(
            `${this.TB_URL}/api/alarms`,
            { headers: this.headers, params }
        );
        return response.data;
    }

    async getHighestAlarmSeverity(entityType: string, entityId: string, params: any) {
        const response = await axios.get(
            `${this.TB_URL}/api/alarm/highestSeverity/${entityType}/${entityId}`,
            { headers: this.headers, params }
        );
        return response.data;
    }

    async getAlarmTypes(params: any) {
        const response = await axios.get(
            `${this.TB_URL}/api/alarm/types`,
            { headers: this.headers, params }
        );
        return response.data;
    }

    // --- Device Profile & Alarm Rule Methods ---
    
    async getDeviceProfileById(profileId: string) {
        const response = await axios.get(
            `${this.TB_URL}/api/deviceProfile/${profileId}`,
            { headers: this.headers }
        );
        return response.data;
    }

    async getDeviceProfileByName(profileName: string) {
        // Fetches default/existing profiles using a tenant page query
        const response = await axios.get(
            `${this.TB_URL}/api/deviceProfiles`,
            { 
                headers: this.headers, 
                params: { pageSize: 10, page: 0, textSearch: profileName } 
            }
        );
        return response.data;
    }

    async saveDeviceProfile(profileData: any) {
        const response = await axios.post(
            `${this.TB_URL}/api/deviceProfile`,
            profileData,
            { headers: this.headers }
        );
        return response.data;
    }   
}