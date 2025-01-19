import express, {Request, Response} from "express";
import {refreshTokenValidator} from "../middlewares/auth/refresh-token-validator";
import {
    SecurityDevicesQueryRepository,
    securityDevicesQueryRepository
} from "../repositories/query-repo/security-devices-query-repository";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {DomainStatusCode, handleError} from "../utils/object-result";
import {SessionsService, sessionsService} from "../domain/sessions-service";
import {RequestWithParams} from "../types/request-types";

export const securityDevicesRouter = express.Router()

class SecurityDevicesController {
    constructor(private sessionsService: SessionsService,
                private securityDevicesQueryRepository: SecurityDevicesQueryRepository) {}

    async getActiveSessions(req: Request, res: Response){
        const activeSessions = await this.securityDevicesQueryRepository.getAllActiveSessions(req.userId!);

        res.status(HTTP_STATUSES.SUCCESS_200).send(activeSessions);
    }

    async deleteSessionsExcludingCurrentOne(req: Request, res: Response){
        const result = await this.sessionsService.endSessionsExcludingCurrentOne(req.cookies.refreshToken);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status));
            return
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }

    async deleteSpecificSession(req: RequestWithParams<{ deviceId: string }>, res: Response){
        const requestInfo = {
            deviceId: req.params.deviceId,
            refreshToken: req.cookies.refreshToken
        }

        const result = await this.sessionsService.endSpecifiedSession(requestInfo)

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status));
            return
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }
}

const securityDevicesController = new SecurityDevicesController(
    sessionsService,
    securityDevicesQueryRepository
);

securityDevicesRouter.get('/',refreshTokenValidator, securityDevicesController.getActiveSessions.bind(securityDevicesController))
securityDevicesRouter.delete('/',refreshTokenValidator, securityDevicesController.deleteSessionsExcludingCurrentOne.bind(securityDevicesController))
securityDevicesRouter.delete('/:deviceId',refreshTokenValidator, securityDevicesController.deleteSpecificSession.bind(securityDevicesController))