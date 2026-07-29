import axios, { AxiosInstance } from "axios";
import { Injectable } from "@nitrostack/core";
import * as dotenv from "dotenv";
import { ThingsBoardConfig } from "../thingsboard/tb-config.js";

dotenv.config();

@Injectable()
export class ThingsBoardClientService {
    private get TB_URL(): string {
        if (!ThingsBoardConfig.hasConfig()) {
            throw new Error("ThingsBoard connection is not configured. Ask the user in the chat for their ThingsBoard URL and API Key (or Tenant Admin JWT token) so you can configure it on their own cloud instance using the 'configure_credentials' tool.");
        }
        return ThingsBoardConfig.getUrl();
    }

    private get API_KEY(): string | undefined {
        if (!ThingsBoardConfig.hasConfig()) {
            throw new Error("ThingsBoard connection is not configured. Ask the user in the chat for their ThingsBoard URL and API Key (or Tenant Admin JWT token) so you can configure it on their own cloud instance using the 'configure_credentials' tool.");
        }
        return ThingsBoardConfig.getApiKey() || undefined;
    }

    private readonly USERNAME = process.env.TB_USERNAME;
    private readonly PASSWORD = process.env.TB_PASSWORD;

    private jwtToken: string | null = null;
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Intercept requests to dynamically set baseURL from config
        this.client.interceptors.request.use((config) => {
            config.baseURL = this.TB_URL;
            return config;
        });
    }

    /**
     * Get request headers with authentication
     */
    private async getHeaders(): Promise<Record<string, string>> {
        // If ApiKey is provided and no username/password, use ApiKey auth
        if (this.API_KEY && !this.USERNAME) {
            return {
                "X-Authorization": ThingsBoardConfig.getAuthHeaderValue(),
            };
        }

        // Otherwise use JWT token
        if (!this.jwtToken && this.USERNAME && this.PASSWORD) {
            await this.login();
        }

        if (this.jwtToken) {
            return {
                "X-Authorization": `Bearer ${this.jwtToken}`,
            };
        }

        // Fallback to ApiKey if available, else empty
        if (this.API_KEY) {
            return {
                "X-Authorization": ThingsBoardConfig.getAuthHeaderValue(),
            };
        }

        return {};
    }

    /**
     * Login to ThingsBoard to retrieve a JWT token
     */
    private async login(): Promise<void> {
        if (!this.USERNAME || !this.PASSWORD) {
            throw new Error("ThingsBoard credentials (TB_USERNAME/TB_PASSWORD) not configured for JWT auth.");
        }

        try {
            const response = await axios.post(`${this.TB_URL}/api/auth/login`, {
                username: this.USERNAME,
                password: this.PASSWORD,
            });
            this.jwtToken = response.data.token;
        } catch (error: any) {
            console.error("Failed to authenticate with ThingsBoard:", error.message);
            throw new Error(`ThingsBoard login failed: ${error.message}`);
        }
    }

    /**
     * Execute a request with automatic JWT refresh and retry logic
     */
    private async executeWithRetry<T>(requestFn: (headers: Record<string, string>) => Promise<T>): Promise<T> {
        let headers = await this.getHeaders();
        try {
            return await requestFn(headers);
        } catch (error: any) {
            // Check if error is 401 (Unauthorized) and we are using username/password
            if (error.response?.status === 401 && this.USERNAME && this.PASSWORD) {
                console.warn("ThingsBoard JWT expired or invalid. Refreshing token...");
                this.jwtToken = null; // Clear cached token
                headers = await this.getHeaders(); // Trigger login/refresh
                try {
                    return await requestFn(headers); // Retry once
                } catch (retryError: any) {
                    console.error("ThingsBoard request failed after token refresh retry.");
                    throw retryError;
                }
            }
            throw error;
        }
    }

    /**
     * Verify a device exists in ThingsBoard
     */
    async getDeviceById(deviceId: string): Promise<any> {
        return this.executeWithRetry(async (headers) => {
            const response = await this.client.get(`/api/device/${deviceId}`, { headers });
            return response.data;
        });
    }

    /**
     * Get all telemetry keys for a device
     */
    async getTelemetryKeys(deviceId: string): Promise<string[]> {
        return this.executeWithRetry(async (headers) => {
            const response = await this.client.get(`/api/plugins/telemetry/DEVICE/${deviceId}/keys/timeseries`, { headers });
            return response.data || [];
        });
    }

    /**
     * Fetch historical telemetry for a range of timestamps
     */
    async getTelemetryRange(deviceId: string, keys: string[], startTs: number, endTs: number): Promise<Record<string, Array<{ ts: number; value: any }>>> {
        if (keys.length === 0) {
            return {};
        }
        return this.executeWithRetry(async (headers) => {
            const response = await this.client.get(`/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries`, {
                headers,
                params: {
                    keys: keys.join(","),
                    startTs,
                    endTs,
                    limit: 50000,
                },
            });
            return response.data || {};
        });
    }

    /**
     * Search for a device by name in ThingsBoard
     */
    async getDeviceByName(deviceName: string): Promise<any> {
        return this.executeWithRetry(async (headers) => {
            const response = await this.client.get(`/api/tenant/devices`, {
                headers,
                params: { deviceName }
            });
            return response.data;
        });
    }
}

export const thingsboardClientService = new ThingsBoardClientService();
