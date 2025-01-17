import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils/http-statuses";
import {authRepository, jwtService} from "../../composition-root";

export const refreshTokenValidator = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    const decodedPayload = jwtService.verifyRefreshToken(refreshToken);

    if (!decodedPayload) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return
    }

    const isChecked = await authRepository.checkRefreshTokenVersion(decodedPayload.iat, decodedPayload.userId,decodedPayload.deviceId);

    if (!isChecked) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        return
    }

    req.userId = decodedPayload.userId
    next()
}