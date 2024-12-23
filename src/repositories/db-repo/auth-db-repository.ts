import {activeSessionsCollection} from "../db";

export const authRepository = {
    async saveSession(session: {
        userId: string,
        iat: number,
        deviceId: string,
        deviceName: string,
        IP: string,
        exp: number
    }) {
        await activeSessionsCollection.insertOne(session);
    },

    async checkRefreshTokenVersion(iat: number, userId: string, deviceId: string) {
        return await activeSessionsCollection.findOne({iat, userId, deviceId});
    },

    async updateRefreshTokenVersion(version: { iat: number, userId: string, deviceId: string }) {
        await activeSessionsCollection.updateOne(
            {userId: version.userId, deviceId: version.deviceId},
            {$set: {iat: version.iat}}
        );
    },

    async deleteSession(refreshTokenMeta: {userId: string, deviceId: string}) {
        return await activeSessionsCollection.deleteOne(
            {userId: refreshTokenMeta.userId, deviceId: refreshTokenMeta.deviceId}
        );
    }
}