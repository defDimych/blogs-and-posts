import express, {Response} from "express";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../types/request-types";
import {PaginationQueryType} from "../types/PaginationQueryType";
import {basicAuthMiddleware} from "../middlewares/auth/basic-auth-middleware";
import {usersQueryRepository} from "../repositories/query-repo/users-query-repository";
import {getDefaultPaginationOptions} from "./helpers/pagination-helper";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {UserInputModel} from "../types/users-types/UserInputModel";
import {userInputValidationMiddleware} from "../middlewares/user-input-validation-middleware";
import {checkInputErrorsMiddleware} from "../middlewares/check-input-errors-middleware";
import {DomainStatusCode, usersService} from "../domain/users-service";

// const isSuccess = <T>(result: Result<T | null>): result is Result<T> => {
//     return true
// }

const handleError = (status: DomainStatusCode): number => {
    switch (status) {
        case DomainStatusCode.BadRequest:
        case DomainStatusCode.EmailNotSend:
            return HTTP_STATUSES.BAD_REQUEST_400
        default:
            return 500
    }
}

export const getUsersRouter = () => {
    const router = express.Router();

    router.get('/', basicAuthMiddleware, async (req: RequestWithQuery<PaginationQueryType>, res: Response) => {
        const receivedUsers = await usersQueryRepository.getAllUsers(getDefaultPaginationOptions(req.query));

        res.status(HTTP_STATUSES.SUCCESS_200).send(receivedUsers);
    })
    router.post('/', basicAuthMiddleware, ...userInputValidationMiddleware, checkInputErrorsMiddleware,
        async (req: RequestWithBody<UserInputModel>, res: Response, next) => {
        try{
            //const checkResult = await usersService.checkUnique(req.body.login, req.body.email);

            // if (checkResult.errorsMessages.length) {
            //     res.status(HTTP_STATUSES.BAD_REQUEST_400).send(checkResult);
            //     return;
            // }

            const result = await usersService.createUser(req.body.login, req.body.password, req.body.email);

            if(result.status !== DomainStatusCode.Success) {
                res.status(handleError(result.status)).send(result.extensions)

                return
            }

            const createdUser = await usersQueryRepository.findUserById(result.data!);

            if (!createdUser) throw new Error('sww');

            res.status(HTTP_STATUSES.CREATED_201).send(createdUser);
        } catch (e) {
            next(e)
        }

    })
    router.delete('/:id', basicAuthMiddleware, async (req: RequestWithParams<{id: string}>, res: Response) => {
        const foundUser = await usersQueryRepository.findUserById(req.params.id);

        if (!foundUser) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return
        }

        const isDeleted = await usersService.deleteUser(req.params.id);

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
            return
        }
    })

    return router;
}

