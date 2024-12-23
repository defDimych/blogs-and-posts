import {jwtService} from "../application/jwt-service";
import {sessionsRepository} from "../repositories/db-repo/sessions-db-repository";
import {responseFactory} from "../utils/object-result";

export const sessionsService = {
    async endSessionsExcludingCurrentOne(refreshToken: string) {
        const decodedPayload = jwtService.getPayloadFromToken(refreshToken);

        const refreshTokenMeta = {
            userId: decodedPayload.userId,
            deviceId: decodedPayload.deviceId,
            iat: decodedPayload.iat
        }

        await sessionsRepository.endSessionsExcludingCurrentOneOrThrow(refreshTokenMeta);

        return responseFactory.success(null);
    },

    async endSpecifiedSession(requestInfo: {deviceId: string, refreshToken: string}) {
        const decodedPayload = jwtService.getPayloadFromToken(requestInfo.refreshToken);

        const foundSession = await sessionsRepository.findSessionByDeviceId(requestInfo.deviceId);

        if (!foundSession) {
            return responseFactory.notFound();
        }

        if (foundSession.userId !== decodedPayload.userId) {
            return responseFactory.forbidden();
        }

        await sessionsRepository.deleteSessionByIdOrThrow(foundSession._id.toString());

        return responseFactory.success(null);
    }
}