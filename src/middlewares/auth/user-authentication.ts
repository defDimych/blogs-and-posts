import {NextFunction, Request, Response} from "express";
import {jwtService} from "../../composition-root";

export const userAuthentication = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']

    if (authHeader) {
        const token = authHeader.split(' ')[1]
        const payload = jwtService.getPayloadFromToken(token);

        req.userId = payload.userId
    }
    next()
}