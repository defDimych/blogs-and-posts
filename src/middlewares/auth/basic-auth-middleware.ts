import {NextFunction, Request, Response} from "express";
import {SETTINGS} from "../../utils/settings";
import {HTTP_STATUSES} from "../../utils/http-statuses";

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const buffer1 = Buffer.from(SETTINGS.CREDENTIALS, 'utf8');
    const codedAuth = buffer1.toString('base64');

    const inputAuth = req.headers['authorization'] as string;

    if (!inputAuth) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return;
    }

    if ('Basic ' + codedAuth === inputAuth) {
        next();
    } else {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    }
}