import express, {Request, Response} from "express";
import {RequestWithBody} from "../types/request-types";
import {LoginInputModel} from "../types/auth-types/LoginInputModel";
import {loginInputValidationMiddleware} from "../middlewares/validation/login-input-validation-middleware";
import {checkInputErrorsMiddleware} from "../middlewares/check-input-errors-middleware";
import {usersService} from "../domain/users-service";
import {DomainStatusCode, handleError} from "../utils/object-result";
import {jwtService} from "../application/jwt-service";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {authentication} from "../middlewares/auth/authentication ";
import {usersQueryRepository} from "../repositories/query-repo/users-query-repository";
import {userInputValidationMiddleware} from "../middlewares/validation/user-input-validation-middleware";
import {UserInputModel} from "../types/users-types/UserInputModel";
import {emailInputValidationMiddleware} from "../middlewares/validation/email-input-validation-middleware";

export const getAuthRouter = () => {
    const router = express.Router();

    router.get('/me', authentication, async (req: Request, res: Response)=> {
        const infoCurrentUser = await usersQueryRepository.getInfoById(req.userId!);

        res.status(HTTP_STATUSES.SUCCESS_200).send(infoCurrentUser);
    })
    router.post('/login', loginInputValidationMiddleware, checkInputErrorsMiddleware,
        async (req: RequestWithBody<LoginInputModel>, res: Response) => {
            const result = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password);

            if (result.status === DomainStatusCode.Success) {
                const token = await jwtService.createJWT(result.data!);

                res.status(HTTP_STATUSES.SUCCESS_200).send(token);
                return;
            }
            res.sendStatus(handleError(result.status));
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