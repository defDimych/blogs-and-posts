import express, {Request, Response} from "express";
import {RequestWithBody} from "../types/request-types";
import {LoginInputModel} from "../types/auth-types/LoginInputModel";
import {loginInputValidationMiddleware} from "../middlewares/validation/login-input-validation-middleware";
import {checkInputErrorsMiddleware} from "../middlewares/check-input-errors-middleware";
import {usersService} from "../domain/users-service";
import {DomainStatusCode, handleError} from "../utils/object-result";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {authentication} from "../middlewares/auth/authentication ";
import {usersQueryRepository} from "../repositories/query-repo/users-query-repository";
import {userInputValidationMiddleware} from "../middlewares/validation/user-input-validation-middleware";
import {UserInputModel} from "../types/users-types/UserInputModel";
import {emailInputValidationMiddleware} from "../middlewares/validation/email-input-validation-middleware";
import {authService} from "../domain/auth-service";

export const getAuthRouter = () => {
    const router = express.Router();

    router.get('/me', authentication, async (req: Request, res: Response)=> {
        const infoCurrentUser = await usersQueryRepository.getInfoById(req.userId!);

        res.status(HTTP_STATUSES.SUCCESS_200).send(infoCurrentUser);
    })
    router.post('/login', loginInputValidationMiddleware, checkInputErrorsMiddleware,
        async (req: RequestWithBody<LoginInputModel>, res: Response) => {
            const result = await authService.checkCredentials(req.body.loginOrEmail, req.body.password);

            if (result.status !== DomainStatusCode.Success) {
                res.sendStatus(handleError(result.status));
                return
            }

            const tokens = await authService.getTokens(result.data!);

            res.cookie('refreshToken', tokens.data!.refreshToken, {httpOnly: true, secure: true});
            res.status(HTTP_STATUSES.SUCCESS_200).send(tokens.data!.accessToken);
        })
    router.post('/refresh-token', async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;

        const result = await authService.updateTokens(refreshToken);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status));
            return
        }
        res.cookie('refreshToken', result.data!.refreshToken, {httpOnly: true, secure: true});
        res.status(HTTP_STATUSES.SUCCESS_200).send(result.data!.accessToken);
    })
    router.post('/logout', async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;

        const result = await authService.logout(refreshToken);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status));
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    })
    router.post('/registration', ...userInputValidationMiddleware, checkInputErrorsMiddleware,
        async (req: RequestWithBody<UserInputModel>, res: Response) => {
            const result = await usersService.createUserWithEmailConfirmation(req.body.login, req.body.password, req.body.email);

            if (result.status !== DomainStatusCode.Success) {
                res.status(handleError(result.status)).send(result.extensions);
                return
            }
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        })
    router.post('/registration-confirmation', async (req: RequestWithBody<{ code: string }>, res: Response) => {
        const result = await usersService.emailConfirmation(req.body.code);

        if (result.status !== DomainStatusCode.Success) {
            res.status(handleError(result.status)).send(result.extensions);
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    })
    router.post('/registration-email-resending',
        emailInputValidationMiddleware,
        checkInputErrorsMiddleware,
        async (req: RequestWithBody<{ email: string }>, res: Response) => {
            const result = await usersService.emailResending(req.body.email);

            if (result.status !== DomainStatusCode.Success) {
                res.status(handleError(result.status)).send(result.extensions);
                return
            }
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        })

    return router;
}