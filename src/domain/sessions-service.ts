import {jwtService} from "../application/jwt-service";
import {sessionsRepository} from "../repositories/db-repo/sessions-db-repository";
import {responseFactory} from "../utils/object-result";

class SessionsService {
    async endSessionsExcludingCurrentOne(refreshToken: string) {
        const decodedPayload = jwtService.getPayloadFromToken(refreshToken);

        const refreshTokenMeta = {
            userId: decodedPayload.userId,
            deviceId: decodedPayload.deviceId,
            iat: decodedPayload.iat
        }

        await sessionsRepository.endSessionsExcludingCurrentOneOrThrow(refreshTokenMeta);

        return responseFactory.success(null);
    }

    async endSpecifiedSession(requestInfo: {deviceId: string, refreshToken: string}) {
        const decodedPayload = jwtService.getPayloadFromToken(requestInfo.refreshToken);

        const session = await sessionsRepository.findSessionByDeviceId(requestInfo.deviceId);

        if (!session) {
            return responseFactory.notFound();
        }

        if (session.userId !== decodedPayload.userId) {
            return responseFactory.forbidden();
        }

        await session.deleteOne();

        return responseFactory.success(null);
    }
}

export const sessionsService = new SessionsService()