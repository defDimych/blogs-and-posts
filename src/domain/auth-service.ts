import {JwtService, jwtService} from "../application/jwt-service";
import {AuthRepository, authRepository} from "../repositories/db-repo/auth-db-repository";
import {DomainStatusCode, responseFactory, Result} from "../utils/object-result";
import {UsersRepository, usersRepository} from "../repositories/db-repo/users-db-repository";
import bcrypt from "bcrypt";
import {generateErrorMessage} from "../utils/mappers";
import {SessionModel} from "../routes/auth/session.entity";
import {EmailManager, emailManager} from "../application/email-manager";
import {uuid} from "uuidv4";
import {add} from "date-fns/add";

export class AuthService {
    constructor(private authRepository: AuthRepository,
                private usersRepository: UsersRepository,
                private jwtService: JwtService,
                private emailManager: EmailManager) {}

    async checkCredentials(loginOrEmail: string, password: string) {
        const foundUser = await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);

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
    }

    async login(requestInfo: {loginOrEmail: string, password: string, IP: string, deviceName: string}) {
        const result = await this.checkCredentials(requestInfo.loginOrEmail, requestInfo.password);

        if (result.status !== DomainStatusCode.Success) {
            return result as Result<null>
        }

        const userId = result.data!.userId;
        const accessToken = this.jwtService.createAccessToken(userId);
        const refreshToken = this.jwtService.createRefreshTokenWithGenerateDeviceId(userId);

        const decodedPayload = this.jwtService.getPayloadFromToken(refreshToken);

        const newSession = {
            userId: decodedPayload.userId,
            iat: decodedPayload.iat,
            deviceId: decodedPayload.deviceId,
            deviceName: requestInfo.deviceName,
            IP: requestInfo.IP,
            exp: decodedPayload.exp
        }

        const session = new SessionModel(newSession);
        await this.authRepository.save(session);

        const tokens = {
            accessToken: {
                accessToken
            },
            refreshToken
        }

        return responseFactory.success(tokens);
    }

    async updateTokens(refreshToken: string) {
        const decodedPayload = this.jwtService.getPayloadFromToken(refreshToken);

        const newAccessToken = this.jwtService.createAccessToken(decodedPayload.userId);
        const newRefreshToken = this.jwtService.createRefreshToken(decodedPayload.userId, decodedPayload.deviceId);

        const refreshPayload = this.jwtService.getPayloadFromToken(newRefreshToken);

        const session = await this.authRepository.findSession(refreshPayload.userId, refreshPayload.deviceId);
        if (!session) throw new Error('session not found')

        session.iat = refreshPayload.iat
        await this.authRepository.save(session)

        const tokens = {
            accessToken: {
                accessToken: newAccessToken
            },
            refreshToken: newRefreshToken
        }

        return responseFactory.success(tokens);
    }

    async _generateHash(password: string) {
        const passwordSalt = await bcrypt.genSalt(10);

        return bcrypt.hash(password, passwordSalt);
    }

    async passwordRecovery(email: string): Promise<Result<null>> {
        const user = await this.usersRepository.findEmail(email);
        if (!user) return responseFactory.success(null);

        user.passwordRecovery.recoveryCode = uuid()
        user.passwordRecovery.expirationDate = add(new Date(), {minutes: 15});

        await this.usersRepository.save(user);
        await this.emailManager.sendEmailForPasswordRecovery(email, user.passwordRecovery.recoveryCode);

        return responseFactory.success(null)
    }

    async confirmPasswordRecovery(newPassword: string, recoveryCode: string): Promise<Result<null>> {
        const user = await this.usersRepository.findUserByPasswordRecoveryCode(recoveryCode);

        if (!user) {
            return responseFactory.badRequest(generateErrorMessage('recovery code is incorrect', 'recoveryCode'))
        }

        if (user.passwordRecovery.expirationDate < new Date()) {
            return responseFactory.badRequest()
        }

        user.accountData.passwordHash = await this._generateHash(newPassword);
        await this.usersRepository.save(user);

        return responseFactory.success(null);
    }

    async logout(refreshToken: string) {
        const decodedPayload = this.jwtService.getPayloadFromToken(refreshToken);

        const session = await this.authRepository.findSession(decodedPayload.userId, decodedPayload.deviceId);
        if (!session) throw new Error('session not found')

        await session.deleteOne()

        return responseFactory.success(null);
    }
}

export const authService = new AuthService(
    authRepository,
    usersRepository,
    jwtService,
    emailManager
);