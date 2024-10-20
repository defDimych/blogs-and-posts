import {NextFunction, Request, Response} from "express";
import {SETTINGS} from "../../utils/settings";
import {HTTP_STATUSES} from "../../utils/http-statuses";

export const fromUTF8ToBase64 = (credentials: string) => {
    const buffer1 = Buffer.from(credentials, 'utf8');
    return buffer1.toString('base64');
}

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const inputAuth = req.headers['authorization'] as string;

    if (!inputAuth) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return;
    }

    const codedAuth = fromUTF8ToBase64(SETTINGS.CREDENTIALS);

    if ('Basic ' + codedAuth === inputAuth) {
        next();
    } else {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    }
}