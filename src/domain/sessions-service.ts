import {JwtService} from "../application/jwt-service";
import {SessionsRepository} from "../repositories/db-repo/sessions-db-repository";
import {responseFactory} from "../utils/object-result";
import {inject, injectable} from "inversify";

@injectable()
export class SessionsService {
    constructor(@inject(SessionsRepository) private sessionsRepository: SessionsRepository,
                @inject(JwtService) private jwtService: JwtService) {}

    async endSessionsExcludingCurrentOne(refreshToken: string) {
        const decodedPayload = this.jwtService.getPayloadFromToken(refreshToken);

        const refreshTokenMeta = {
            userId: decodedPayload.userId,
            deviceId: decodedPayload.deviceId,
            iat: decodedPayload.iat
        }

        await this.sessionsRepository.endSessionsExcludingCurrentOneOrThrow(refreshTokenMeta);

        return responseFactory.success(null);
    }

    async endSpecifiedSession(requestInfo: {deviceId: string, refreshToken: string}) {
        const decodedPayload = this.jwtService.getPayloadFromToken(requestInfo.refreshToken);

        const session = await this.sessionsRepository.findSessionByDeviceId(requestInfo.deviceId);

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