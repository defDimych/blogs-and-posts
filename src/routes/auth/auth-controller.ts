import {AuthService} from "../../domain/auth-service";
import {UsersQueryRepository} from "../../repositories/query-repo/users-query-repository";
import {UsersService} from "../../domain/users-service";
import {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils/http-statuses";
import {RequestWithBody} from "../../types/request-types";
import {LoginInputModel} from "../../types/auth-types/LoginInputModel";
import {DomainStatusCode, handleError} from "../../utils/object-result";
import {UserInputModel} from "../../types/users-types/UserInputModel";
import {NewPasswordRecoveryInputModel} from "../../types/auth-types/NewPasswordRecoveryInputModel";

export class AuthController {
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