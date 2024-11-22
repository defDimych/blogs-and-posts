import {WithId} from "mongodb";
import {UserDbModel} from "../types/users-types/UserDbModel";
import jwt from "jsonwebtoken";
import {SETTINGS} from "../utils/settings";

interface tokenInterface {
    userId: string;
    iat: number;
    exp: number;
}

export const jwtService = {
    async createJWT(user: WithId<UserDbModel>) {
        const token = jwt.sign(
            {userId: user._id}, SETTINGS.JWT_SECRET, {expiresIn: '30d'}
        );

        return {
            accessToken: token
        }
    },

    async getUserIdByToken(token: string) {
        try {
            const result = jwt.verify(token, SETTINGS.JWT_SECRET);

            return (result as tokenInterface).userId

        } catch (error) {
            return null;
        }
    }
}