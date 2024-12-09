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

    async login(loginOrEmail: string, password: string) {
        const result = await this.checkCredentials(loginOrEmail, password);

        if (result.status !== DomainStatusCode.Success) {
            return result as Result<null>
        }

        const userId = result.data!.userId;
        const tokens = jwtService.createJWTs(userId);
        const decodedPayload = jwtService.getPayloadFromToken(tokens.refreshToken);

        await authRepository.saveRefreshTokenVersion(decodedPayload.iat, decodedPayload.userId,decodedPayload.deviceId);

        return responseFactory.success(tokens);
    },

    async updateTokens(refreshToken: string) {
        const decodedPayload = jwtService.getPayloadFromToken(refreshToken);

        const tokens = jwtService.createJWTs(decodedPayload.userId);
        const refreshPayload = jwtService.getPayloadFromToken(tokens.refreshToken);

        await authRepository.updateRefreshTokenVersion(refreshPayload.iat, refreshPayload.userId,refreshPayload.deviceId);

        return responseFactory.success(tokens);
    },

    async logout(refreshToken: string) {
        const decodedPayload = jwtService.getPayloadFromToken(refreshToken);

        await authRepository.deleteRefreshTokenVersion(decodedPayload.userId);

        return responseFactory.success(null);
    }
}