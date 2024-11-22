import express, {Request, Response} from "express";
import {RequestWithBody} from "../types/request-types";
import {LoginInputModel} from "../types/auth-types/LoginInputModel";
import {loginInputValidationMiddleware} from "../middlewares/auth/login-input-validation-middleware";
import {checkInputErrorsMiddleware} from "../middlewares/check-input-errors-middleware";
import {usersService} from "../domain/users-service";
import {DomainStatusCode, handleError} from "../utils/object-result";
import {jwtService} from "../application/jwt-service";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {authentication} from "../middlewares/auth/authentication ";
import {usersQueryRepository} from "../repositories/query-repo/users-query-repository";

export const getAuthRouter = () => {
    const router = express.Router();

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
    router.get('/me', authentication, async (req: Request, res: Response)=> {
        const infoCurrentUser = await usersQueryRepository.getInfoById(req.userId!);

        res.status(HTTP_STATUSES.SUCCESS_200).send(infoCurrentUser);
    })

    return router;
}