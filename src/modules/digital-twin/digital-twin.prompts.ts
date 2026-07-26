import { PromptDecorator as Prompt, ExecutionContext } from "@nitrostack/core";

export class DigitalTwinPrompts {

    @Prompt({
        name: "smart_hospital",
        description: "Creates a complete Smart Hospital digital twin with ICU devices, patient monitoring dashboards, hospital staff users, monitoring rule chains, and clinical alarms.",
        arguments: []
    })
    async getSmartHospitalPrompt(
        args: Record<string, never>,
        ctx: ExecutionContext
    ) {
        return [
            {
                role: "user" as const,
                content: `Create a digital twin named "Smart Hospital".

Create the following devices:
- 1 ICU Monitor
- 1 Ventilator
- 1 Smart Bed
- 1 Nurse Station
- 1 Power Meter

Create three dashboards:
- ICU Dashboard
- Patient Monitoring
- Hospital Utilities

Create one customer named "City Hospital".

Create two users:
- admin@hospital.com (Tenant Administrator)
- nurse@hospital.com (Customer User)

Create a rule chain named "Hospital Monitoring".

Create two alarms:
- Patient Emergency (CRITICAL)
- Device Offline (WARNING)`
            }
        ];
    }

    @Prompt({
        name: "smart_warehouse",
        description: "Creates a complete Smart Warehouse digital twin with RFID, environmental sensors, security devices, logistics dashboards, automation rule chains, and security alarms.",
        arguments: []
    })
    async getSmartWarehousePrompt(
        args: Record<string, never>,
        ctx: ExecutionContext
    ) {
        return [
            {
                role: "user" as const,
                content: `Create a digital twin named "Smart Warehouse".

Create the following devices:
- 1 RFID Reader
- 1 Temperature Sensor
- 1 Door Sensor
- 1 CCTV Camera
- 1 Smart Light

Create three dashboards:
- Warehouse Overview
- Inventory Monitoring
- Security Dashboard

Create one customer named "Warehouse Logistics".

Create two users:
- admin@warehouse.com (Tenant Administrator)
- supervisor@warehouse.com (Customer User)

Create a rule chain named "Warehouse Automation".

Create two alarms:
- Unauthorized Door Access (CRITICAL)
- High Temperature (MAJOR)`
            }
        ];
    }
}
