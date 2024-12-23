import {activeSessionsCollection} from "../db";
import {DeviceViewModel} from "../../types/devices-types/DeviceViewModel";

export const securityDevicesQueryRepository = {
    async getAllActiveSessions(userId: string): Promise<DeviceViewModel[]> {
        const listDevices = await activeSessionsCollection.find({userId}).toArray()

        return listDevices.map(device => {
            return {
                deviceId: device.deviceId,
                ip: device.IP,
                lastActiveDate: new Date(device.iat).toISOString(),
                title: device.deviceName
            }
        })
    }
}