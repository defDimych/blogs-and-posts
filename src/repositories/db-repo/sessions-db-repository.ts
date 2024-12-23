import {activeSessionsCollection} from "../db";
import {ObjectId} from "mongodb";

export const sessionsRepository = {
    async endSessionsExcludingCurrentOneOrThrow(refreshTokenMeta: {userId: string, deviceId: string, iat: number}) {
        const result = await activeSessionsCollection.deleteMany(
            {
                userId: refreshTokenMeta.userId,
                deviceId: {$ne: refreshTokenMeta.deviceId},
                iat: {$ne: refreshTokenMeta.iat}
            }
        );

        if (!result.deletedCount) {
            throw new Error('[endSessionsExcludingCurrentOneOrThrow]: failed to delete')
        }
        return true
    },

    async findSessionByDeviceId(deviceId: string) {
        return await activeSessionsCollection.findOne({deviceId})
    },

    async deleteSessionByIdOrThrow(id: string) {
        const result = await activeSessionsCollection.deleteOne({_id: new ObjectId(id)})

        if (!result.deletedCount) {
            throw new Error('[deleteSessionByIdOrThrow]: failed to delete')
        }
        return true
    }
}