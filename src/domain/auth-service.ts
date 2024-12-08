import {usersService} from "./users-service";
import {WithId} from "mongodb";
import {UserDbModel} from "../types/users-types/UserDbModel";
import {jwtService} from "../application/jwt-service";
import {authRepository} from "../repositories/db-repo/auth-db-repository";
import {domainStatusResponse} from "../utils/object-result";
import {usersDbRepository} from "../repositories/db-repo/users-db-repository";

export const authService = {
    async checkCredentials(loginOrEmail: string, password: string) {
        return await usersService.checkCredentials(loginOrEmail, password);
    },

    async getTokens(user: WithId<UserDbModel>) {
        const tokens = jwtService.createJWTs(user);
        const refreshPayload = jwtService.getPayloadFromToken(tokens.refreshToken);

        await authRepository.saveRefreshTokenVersion(refreshPayload.iat, refreshPayload.userId,refreshPayload.deviceId);

        return domainStatusResponse.success(tokens);
    },

    async updateTokens(refreshToken: string) {
        const decodedPayload = jwtService.verifyRefreshToken(refreshToken);

        if (!decodedPayload) {
            return domainStatusResponse.unauthorized()
        }

        const result = await authRepository.checkRefreshTokenVersion(decodedPayload.iat, decodedPayload.userId,decodedPayload.deviceId);

        if (!result) {
            return domainStatusResponse.unauthorized()
        }

        const user = await usersDbRepository.findUserById(decodedPayload.userId);

        const tokens = jwtService.createJWTs(user);
        const refreshPayload = jwtService.getPayloadFromToken(tokens.refreshToken);

        await authRepository.updateRefreshTokenVersion(refreshPayload.iat, refreshPayload.userId,refreshPayload.deviceId);

        return domainStatusResponse.success(tokens);
    },

    async logout(refreshToken: string) {
        const decodedPayload = jwtService.verifyRefreshToken(refreshToken);

        if (!decodedPayload) {
            return domainStatusResponse.unauthorized()
        }

        const result = await authRepository.checkRefreshTokenVersion(decodedPayload.iat, decodedPayload.userId,decodedPayload.deviceId);

        if (!result) {
            return domainStatusResponse.unauthorized()
        }

        await authRepository.deleteRefreshTokenVersion(decodedPayload.userId);

        return domainStatusResponse.success(null);
    }
}