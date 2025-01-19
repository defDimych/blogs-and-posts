import {SessionsService} from "../../domain/sessions-service";
import {SecurityDevicesQueryRepository} from "../../repositories/query-repo/security-devices-query-repository";
import {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils/http-statuses";
import {DomainStatusCode, handleError} from "../../utils/object-result";
import {RequestWithParams} from "../../types/request-types";

export class SecurityDevicesController {
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