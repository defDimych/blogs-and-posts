import {SessionDocument, SessionModel} from "../../routes/auth/session.entity";
import {injectable} from "inversify";

@injectable()
export class SessionsRepository {
    async findSessionByDeviceId(deviceId: string): Promise<SessionDocument | null> {
        return SessionModel.findOne({deviceId})
    }

    async endSessionsExcludingCurrentOneOrThrow(refreshTokenMeta: {userId: string, deviceId: string, iat: number}) {
        const result = await SessionModel.deleteMany(
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
    }
}