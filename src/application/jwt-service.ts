import jwt from "jsonwebtoken";
import {SETTINGS} from "../utils/settings";

interface TokenInterface {
    userId: string;
    iat: number;
    exp: number;
    deviceId:string
}

export class JwtService {
    createAccessToken(userId: string) {
        return jwt.sign(
            {userId}, SETTINGS.ACCESS_TOKEN_SECRET, {expiresIn: 10}
        );
    }

    createRefreshTokenWithGenerateDeviceId(userId: string) {
        return jwt.sign(
            {userId, deviceId: crypto.randomUUID(), iat: Date.now(), exp: Date.now() + (20 * 1000)}, SETTINGS.REFRESH_TOKEN_SECRET
        );
    }

    createRefreshToken(userId: string, deviceId: string) {
        return jwt.sign(
            {userId, deviceId, iat: Date.now(), exp: Date.now() + (20 * 1000)}, SETTINGS.REFRESH_TOKEN_SECRET
        );
    }

    getPayloadFromToken(token: string) {
        return jwt.decode(token ) as TokenInterface;
    }

    verifyRefreshToken(refreshToken: string) {
        try {
            const result = jwt.verify(refreshToken, SETTINGS.REFRESH_TOKEN_SECRET);

            return result as TokenInterface
        } catch (err) {
            return null;
        }
    }

    verifyAccessToken(token: string) {
        try {
            const result = jwt.verify(token, SETTINGS.ACCESS_TOKEN_SECRET);

            return (result as TokenInterface).userId

        } catch (error) {
            return null;
        }
    }
}

export const jwtService = new JwtService()