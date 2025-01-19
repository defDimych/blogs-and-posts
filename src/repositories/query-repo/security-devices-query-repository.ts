import {DeviceViewModel} from "../../types/devices-types/DeviceViewModel";
import {SessionModel} from "../../routes/auth/session.entity";

export class SecurityDevicesQueryRepository {
    async getAllActiveSessions(userId: string): Promise<DeviceViewModel[]> {
        const listDevices = await SessionModel.find({userId}).lean()

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

export const securityDevicesQueryRepository = new SecurityDevicesQueryRepository()