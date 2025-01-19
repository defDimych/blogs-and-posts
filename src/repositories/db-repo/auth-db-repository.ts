import {SessionDocument, SessionModel} from "../../routes/auth/session.entity";
import {WithId} from "mongodb";
import {SessionDbModel} from "../../types/auth-types/SessionDbModel";

export class AuthRepository {
    async findSession(userId: string, deviceId: string): Promise<SessionDocument | null> {
        return SessionModel.findOne({userId, deviceId});
    }

    async save(session: SessionDocument) {
        await session.save()
    }

    async checkRefreshTokenVersion(iat: number, userId: string, deviceId: string): Promise<WithId<SessionDbModel> | null> {
        return SessionModel.findOne({iat, userId, deviceId}).lean();
    }
}