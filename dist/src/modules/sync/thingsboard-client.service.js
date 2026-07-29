var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import axios from "axios";
import { Injectable } from "@nitrostack/core";
import * as dotenv from "dotenv";
import { ThingsBoardConfig } from "../thingsboard/tb-config.js";
dotenv.config();
let ThingsBoardClientService = class ThingsBoardClientService {
    get TB_URL() {
        if (!ThingsBoardConfig.hasConfig()) {
            throw new Error("ThingsBoard connection is not configured. Ask the user in the chat for their ThingsBoard URL and API Key (or Tenant Admin JWT token) so you can configure it on their own cloud instance using the 'configure_credentials' tool.");
        }
        return ThingsBoardConfig.getUrl();
    }
    get API_KEY() {
        if (!ThingsBoardConfig.hasConfig()) {
            throw new Error("ThingsBoard connection is not configured. Ask the user in the chat for their ThingsBoard URL and API Key (or Tenant Admin JWT token) so you can configure it on their own cloud instance using the 'configure_credentials' tool.");
        }
        return ThingsBoardConfig.getApiKey() || undefined;
    }
    USERNAME = process.env.TB_USERNAME;
    PASSWORD = process.env.TB_PASSWORD;
    jwtToken = null;
    client;
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
    async getHeaders() {
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
    async login() {
        if (!this.USERNAME || !this.PASSWORD) {
            throw new Error("ThingsBoard credentials (TB_USERNAME/TB_PASSWORD) not configured for JWT auth.");
        }
        try {
            const response = await axios.post(`${this.TB_URL}/api/auth/login`, {
                username: this.USERNAME,
                password: this.PASSWORD,
            });
            this.jwtToken = response.data.token;
        }
        catch (error) {
            console.error("Failed to authenticate with ThingsBoard:", error.message);
            throw new Error(`ThingsBoard login failed: ${error.message}`);
        }
    }
    /**
     * Execute a request with automatic JWT refresh and retry logic
     */
    async executeWithRetry(requestFn) {
        let headers = await this.getHeaders();
        try {
            return await requestFn(headers);
        }
        catch (error) {
            // Check if error is 401 (Unauthorized) and we are using username/password
            if (error.response?.status === 401 && this.USERNAME && this.PASSWORD) {
                console.warn("ThingsBoard JWT expired or invalid. Refreshing token...");
                this.jwtToken = null; // Clear cached token
                headers = await this.getHeaders(); // Trigger login/refresh
                try {
                    return await requestFn(headers); // Retry once
                }
                catch (retryError) {
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
    async getDeviceById(deviceId) {
        return this.executeWithRetry(async (headers) => {
            const response = await this.client.get(`/api/device/${deviceId}`, { headers });
            return response.data;
        });
    }
    /**
     * Get all telemetry keys for a device
     */
    async getTelemetryKeys(deviceId) {
        return this.executeWithRetry(async (headers) => {
            const response = await this.client.get(`/api/plugins/telemetry/DEVICE/${deviceId}/keys/timeseries`, { headers });
            return response.data || [];
        });
    }
    /**
     * Fetch historical telemetry for a range of timestamps
     */
    async getTelemetryRange(deviceId, keys, startTs, endTs) {
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
    async getDeviceByName(deviceName) {
        return this.executeWithRetry(async (headers) => {
            const response = await this.client.get(`/api/tenant/devices`, {
                headers,
                params: { deviceName }
            });
            return response.data;
        });
    }
};
ThingsBoardClientService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], ThingsBoardClientService);
export { ThingsBoardClientService };
export const thingsboardClientService = new ThingsBoardClientService();
//# sourceMappingURL=thingsboard-client.service.js.map