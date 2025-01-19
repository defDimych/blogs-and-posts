import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils/http-statuses";
import {jwtService} from "../../composition-root";

export const accessTokenValidator = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return
    }

    const token = authHeader.split(' ')[1]
    const userId = jwtService.verifyAccessToken(token);

    if (!userId) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return
    }

    req.userId = userId;
    next();
}