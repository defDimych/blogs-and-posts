import express, {Response} from "express";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../../types/request-types";
import {PaginationQueryType} from "../../types/PaginationQueryType";
import {basicAuthMiddleware} from "../../middlewares/auth/basic-auth-middleware";
import {UsersQueryRepository, usersQueryRepository} from "../../repositories/query-repo/users-query-repository";
import {getDefaultPaginationOptions} from "../helpers/pagination-helper";
import {HTTP_STATUSES} from "../../utils/http-statuses";
import {UserInputModel} from "../../types/users-types/UserInputModel";
import {userInputValidationMiddleware} from "../../middlewares/validation/user-input-validation-middleware";
import {checkInputErrorsMiddleware} from "../../middlewares/check-input-errors-middleware";
import {UsersService, usersService} from "../../domain/users-service";
import {DomainStatusCode, handleError} from "../../utils/object-result";

export const usersRouter = express.Router()

class UsersController {
    constructor(private usersService: UsersService,
                private usersQueryRepository: UsersQueryRepository) {}

    async getUsers(req: RequestWithQuery<PaginationQueryType>, res: Response){
        const receivedUsers = await this.usersQueryRepository.getAllUsers(getDefaultPaginationOptions(req.query));

        res.status(HTTP_STATUSES.SUCCESS_200).send(receivedUsers);
    }

    async createUser(req: RequestWithBody<UserInputModel>, res: Response){
        const result = await this.usersService.createUser(req.body);

        if (result.status !== DomainStatusCode.Success) {
            res.status(handleError(result.status)).send(result.extensions)
            return
        }

        const createdUser = await this.usersQueryRepository.findUserById(result.data!);

        if (!createdUser) throw new Error('sww');

        res.status(HTTP_STATUSES.CREATED_201).send(createdUser);
    }

    async deleteUser(req: RequestWithParams<{ id: string }>, res: Response){
        const foundUser = await this.usersQueryRepository.findUserById(req.params.id);

        if (!foundUser) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return
        }

        const isDeleted = await this.usersService.deleteUser(req.params.id);

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
            return
        }
    }
}

const usersController = new UsersController(usersService, usersQueryRepository)

usersRouter.get('/', basicAuthMiddleware, usersController.getUsers.bind(usersController))
usersRouter.post('/', basicAuthMiddleware, ...userInputValidationMiddleware, checkInputErrorsMiddleware, usersController.createUser.bind(usersController))
usersRouter.delete('/:id', basicAuthMiddleware, usersController.deleteUser.bind(usersController))