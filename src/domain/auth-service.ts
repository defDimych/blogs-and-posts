import {jwtService} from "../application/jwt-service";
import {authRepository} from "../repositories/db-repo/auth-db-repository";
import {DomainStatusCode, responseFactory, Result} from "../utils/object-result";
import {usersRepository} from "../repositories/db-repo/users-db-repository";
import bcrypt from "bcrypt";
import {generateErrorMessage} from "../utils/mappers";

export const authService = {
    async checkCredentials(loginOrEmail: string, password: string) {
        const foundUser = await usersRepository.findUserByLoginOrEmail(loginOrEmail);

        if (!foundUser) {
            return responseFactory.unauthorized();
        }

        if (!foundUser.emailConfirmation.isConfirmed) {
            return responseFactory.unauthorized(generateErrorMessage('Check your email'));
        }

        const match = await bcrypt.compare(password, foundUser.accountData.passwordHash);

        if (!match) {
            return responseFactory.unauthorized();
        }
        return responseFactory.success<{userId: string}>({userId:foundUser._id.toString()});
    },

    async login(requestInfo: {loginOrEmail: string, password: string, IP: string, deviceName: string}) {
        const result = await this.checkCredentials(requestInfo.loginOrEmail, requestInfo.password);

        if (result.status !== DomainStatusCode.Success) {
            return result as Result<null>
        }

        const userId = result.data!.userId;
        // const tokens = jwtService.createJWTs(userId);
        const accessToken = jwtService.createAccessToken(userId);
        const refreshToken = jwtService.createRefreshTokenWithGenerateDeviceId(userId);

        const decodedPayload = jwtService.getPayloadFromToken(refreshToken);

        const newSession = {
            userId: decodedPayload.userId,
            iat: decodedPayload.iat,
            deviceId: decodedPayload.deviceId,
            deviceName: requestInfo.deviceName,
            IP: requestInfo.IP,
            exp: decodedPayload.exp
        }

        await authRepository.saveSession(newSession);

        const tokens = {
            accessToken: {
                accessToken
            },
            refreshToken
        }

        return responseFactory.success(tokens);
    },

    async updateTokens(refreshToken: string) {
        const decodedPayload = jwtService.getPayloadFromToken(refreshToken);

        // const tokens = jwtService.createJWTs(decodedPayload.userId);
        const newAccessToken = jwtService.createAccessToken(decodedPayload.userId);
        const newRefreshToken = jwtService.createRefreshToken(decodedPayload.userId, decodedPayload.deviceId);

        const refreshPayload = jwtService.getPayloadFromToken(newRefreshToken);

        const newVersion = {
            iat: refreshPayload.iat,
            userId: refreshPayload.userId,
            deviceId: decodedPayload.deviceId
        }

        await authRepository.updateRefreshTokenVersion(newVersion);

        const tokens = {
            accessToken: {
                accessToken: newAccessToken
            },
            refreshToken: newRefreshToken
        }

        return responseFactory.success(tokens);
    },

    async logout(refreshToken: string) {
        const decodedPayload = jwtService.getPayloadFromToken(refreshToken);

        const refreshTokenMeta = {
            userId: decodedPayload.userId,
            deviceId: decodedPayload.deviceId
        }

        await authRepository.deleteSession(refreshTokenMeta);

        return responseFactory.success(null);
    }
}