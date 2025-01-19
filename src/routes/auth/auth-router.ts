import express, {Request, Response} from "express";
import {RequestWithBody} from "../../types/request-types";
import {LoginInputModel} from "../../types/auth-types/LoginInputModel";
import {loginInputValidationMiddleware} from "../../middlewares/validation/login-input-validation-middleware";
import {checkInputErrorsMiddleware} from "../../middlewares/check-input-errors-middleware";
import {UsersService, usersService} from "../../domain/users-service";
import {DomainStatusCode, handleError} from "../../utils/object-result";
import {HTTP_STATUSES} from "../../utils/http-statuses";
import {UsersQueryRepository, usersQueryRepository} from "../../repositories/query-repo/users-query-repository";
import {userInputValidationMiddleware} from "../../middlewares/validation/user-input-validation-middleware";
import {UserInputModel} from "../../types/users-types/UserInputModel";
import {emailInputValidationMiddleware} from "../../middlewares/validation/email-input-validation-middleware";
import {AuthService, authService} from "../../domain/auth-service";
import {refreshTokenValidator} from "../../middlewares/auth/refresh-token-validator";
import {accessTokenValidator} from "../../middlewares/auth/access-token-validator";
import {rateLimiter} from "../../middlewares/auth/rate-limiter";
import {passRecoveryInputValidation} from "../../middlewares/validation/pass-recovery-input-validation";
import {NewPasswordRecoveryInputModel} from "../../types/auth-types/NewPasswordRecoveryInputModel";

export const authRouter = express.Router()

class AuthController {
    constructor(private authService: AuthService,
                private usersQueryRepository: UsersQueryRepository,
                private usersService: UsersService) {}

    async getInfoUser(req: Request, res: Response){
        const infoCurrentUser = await this.usersQueryRepository.getInfoById(req.userId!);

        res.status(HTTP_STATUSES.SUCCESS_200).send(infoCurrentUser);
    }

    async login(req: RequestWithBody<LoginInputModel>, res: Response){
        const requestInfo = {
            loginOrEmail: req.body.loginOrEmail,
            password: req.body.password,
            IP: req.ip || "",
            deviceName: req.headers["user-agent"] || ""
        }

        const result = await this.authService.login(requestInfo);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status));
            return
        }

        res.cookie('refreshToken', result.data!.refreshToken, {httpOnly: true, secure: true});
        res.status(HTTP_STATUSES.SUCCESS_200).send(result.data!.accessToken);
    }

    async refreshToken(req: Request, res: Response){
        const refreshToken = req.cookies.refreshToken;

        const result = await this.authService.updateTokens(refreshToken);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status))
            return
        }

        res.cookie('refreshToken', result.data!.refreshToken, {httpOnly: true, secure: true});
        res.status(HTTP_STATUSES.SUCCESS_200).send(result.data!.accessToken);
    }

    async logout(req: Request, res: Response){
        const refreshToken = req.cookies.refreshToken;

        const result = await this.authService.logout(refreshToken);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status));
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }

    async registration(req: RequestWithBody<UserInputModel>, res: Response){
        const result = await this.usersService.createUserWithEmailConfirmation(req.body);

        if (result.status !== DomainStatusCode.Success) {
            res.status(handleError(result.status)).send(result.extensions);
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }

    async registrationConfirmation(req: RequestWithBody<{ code: string }>, res: Response){
        const result = await this.usersService.emailConfirmation(req.body.code);

        if (result.status !== DomainStatusCode.Success) {
            res.status(handleError(result.status)).send(result.extensions);
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }

    async registrationEmailResending(req: RequestWithBody<{ email: string }>, res: Response){
        const result = await this.usersService.emailResending(req.body.email);

        if (result.status !== DomainStatusCode.Success) {
            res.status(handleError(result.status)).send(result.extensions);
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }

    async passwordRecovery(req: RequestWithBody<{ email: string }>, res: Response){
        const result = await this.authService.passwordRecovery(req.body.email);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status))
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }

    async passwordRecoveryConfirmation(req: RequestWithBody<NewPasswordRecoveryInputModel>, res: Response){
        const result = await this.authService.confirmPasswordRecovery(req.body.newPassword, req.body.recoveryCode);

        if (result.status !== DomainStatusCode.Success) {
            res.status(handleError(result.status)).send(result.extensions);
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }
}

const authController = new AuthController(
    authService,
    usersQueryRepository,
    usersService
);

authRouter.get('/me',accessTokenValidator, authController.getInfoUser.bind(authController))
authRouter.post('/login',rateLimiter, ...loginInputValidationMiddleware, checkInputErrorsMiddleware, authController.login.bind(authController))
authRouter.post('/refresh-token',refreshTokenValidator, authController.refreshToken.bind(authController))
authRouter.post('/logout',refreshTokenValidator, authController.logout.bind(authController))
authRouter.post('/registration',rateLimiter, ...userInputValidationMiddleware, checkInputErrorsMiddleware, authController.registration.bind(authController))
authRouter.post('/registration-confirmation',rateLimiter, authController.registrationConfirmation.bind(authController))
authRouter.post('/password-recovery',rateLimiter, emailInputValidationMiddleware, checkInputErrorsMiddleware, authController.passwordRecovery.bind(authController))
authRouter.post('/new-password',rateLimiter, ...passRecoveryInputValidation, checkInputErrorsMiddleware, authController.passwordRecoveryConfirmation.bind(authController))
authRouter.post('/registration-email-resending',rateLimiter, emailInputValidationMiddleware, checkInputErrorsMiddleware, authController.registrationEmailResending.bind(authController))