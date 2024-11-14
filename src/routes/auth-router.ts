import express, {Response} from "express";
import {RequestWithBody} from "../types/request-types";
import {LoginInputModel} from "../types/auth-types/LoginInputModel";
import {loginInputValidationMiddleware} from "../middlewares/auth/login-input-validation-middleware";
import {checkInputErrorsMiddleware} from "../middlewares/check-input-errors-middleware";
import {usersService} from "../domain/users-service";
import {HTTP_STATUSES} from "../utils/http-statuses";

export const getAuthRouter = () => {
    const router = express.Router();

    router.post('/login', loginInputValidationMiddleware, checkInputErrorsMiddleware,
        async (req: RequestWithBody<LoginInputModel>, res: Response) => {
        const user = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password);

        if (user) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
            return
        }
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    })

    return router;
}