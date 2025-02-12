import {UsersService} from "../../domain/users-service";
import {UsersQueryRepository} from "../../repositories/query-repo/users-query-repository";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../../types/request-types";
import {PaginationQueryType} from "../../types/PaginationQueryType";
import {Response} from "express";
import {getDefaultPaginationOptions} from "../helpers/pagination-helper";
import {HTTP_STATUSES} from "../../utils/http-statuses";
import {UserInputModel} from "../../types/users-types/UserInputModel";
import {DomainStatusCode, handleError} from "../../utils/object-result";
import {inject, injectable} from "inversify";

@injectable()
export class UsersController {
    constructor(@inject(UsersService) private usersService: UsersService,
                @inject(UsersQueryRepository) private usersQueryRepository: UsersQueryRepository) {}

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