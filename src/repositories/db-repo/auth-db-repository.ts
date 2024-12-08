import {refreshTokenVersionCollection} from "../db";

export const authRepository = {
    async saveRefreshTokenVersion(iat: number, userId: string,deviceId:string) {
        const refreshTokenVersion = {
            iat,
            userId,
            deviceId
        }

        const result = await refreshTokenVersionCollection.insertOne(refreshTokenVersion)
        return result.insertedId.toString();
    },

    async checkRefreshTokenVersion(iat: number, userId: string,deviceId:string) {
        return await refreshTokenVersionCollection.findOne({iat, userId, deviceId});
    },

    async updateRefreshTokenVersion(iat: number, userId: string,deviceId:string) {
        const result = await refreshTokenVersionCollection.updateMany({ userId }, { $set: {iat,deviceId} });

        return result.modifiedCount === 1
    },

    async deleteRefreshTokenVersion(userId: string) {
        const result = await refreshTokenVersionCollection.deleteMany({userId})

        return result.deletedCount === 1
    }
}