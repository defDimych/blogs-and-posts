import {NextFunction, Request, Response} from "express";
import {rateLimiterRepository} from "../../repositories/db-repo/rate-limiter-db-repository";
import {HTTP_STATUSES} from "../../utils/http-statuses";
import {RequestInfoDTO} from "../../types/DTO-types";

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const requestInfoDTO: RequestInfoDTO = {
        IP: req.ip || "",
        URL: req.originalUrl,
        date: new Date()
    }

    await rateLimiterRepository.saveAppeal(requestInfoDTO);

    const limiter = await rateLimiterRepository.countDocumentsByIpUrlAndDate(requestInfoDTO);

    if (limiter > 5) {
        res.sendStatus(HTTP_STATUSES.TOO_MANY_REQUESTS_429);
        return
    }

    next()
}