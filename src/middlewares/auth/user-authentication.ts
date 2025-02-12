import {NextFunction, Request, Response} from "express";
import {container} from "../../composition-root";
import {JwtService} from "../../application/jwt-service";

const jwtService = container.resolve(JwtService)

export const userAuthentication = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']

    if (authHeader) {
        const token = authHeader.split(' ')[1]
        const payload = jwtService.getPayloadFromToken(token);

        req.userId = payload.userId
    }
    next()
}