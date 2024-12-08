import {WithId} from "mongodb";
import {UserDbModel} from "../types/users-types/UserDbModel";
import jwt from "jsonwebtoken";
import {SETTINGS} from "../utils/settings";

interface TokenInterface {
    userId: string;
    iat: number;
    exp: number;
    deviceId:string
}

export const jwtService = {
    createJWTs(user: WithId<UserDbModel>) {
        const accessToken = jwt.sign(
            {userId: user._id}, SETTINGS.ACCESS_TOKEN_SECRET, {expiresIn: 10}
        );
        const refreshToken = jwt.sign(
            {userId: user._id,deviceId:crypto.randomUUID()}, SETTINGS.REFRESH_TOKEN_SECRET, {expiresIn: 20}
        );

        return {
            accessToken: {
                accessToken
            },
            refreshToken
        }
    },

    getPayloadFromToken(token: string) {
        return jwt.decode(token ) as TokenInterface;
    },

    verifyRefreshToken(refreshToken: string) {
        try {
            const result = jwt.verify(refreshToken, SETTINGS.REFRESH_TOKEN_SECRET);

            return result as TokenInterface
        } catch (err) {
            return null;
        }
    },

    getUserIdByToken(token: string) {
        try {
            const result = jwt.verify(token, SETTINGS.ACCESS_TOKEN_SECRET);

            return (result as TokenInterface).userId

        } catch (error) {
            return null;
        }
    }
}