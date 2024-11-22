import {usersDbRepository} from "../repositories/db-repo/users-db-repository";
import bcrypt from 'bcrypt';
import {WithId} from "mongodb";
import {UserDbModel} from "../types/users-types/UserDbModel";
import {DomainStatusCode, objectResult, Result} from "../utils/object-result";

export const usersService = {
    async checkUnique(login: string, email: string): Promise<Result<null>> {
        const foundLogin = await usersDbRepository.findLogin(login);
        const foundEmail = await usersDbRepository.findEmail(email);

        if (foundLogin) {
            return {
                status: DomainStatusCode.BadRequest,
                data: null,
                extensions: {
                    errorsMessages: [
                        {
                            message: 'already exists',
                            field: 'login'
                        }
                    ]
                }
            }
        }

        if (foundEmail) {
            return {
                status: DomainStatusCode.BadRequest,
                data: null,
                extensions: {
                    errorsMessages: [
                        {
                            message: 'already exists',
                            field: 'email'
                        }
                    ]
                }
            }
        }

        return {
            status: DomainStatusCode.Success,
            data: null,
            extensions: []
        };
    },

    async createUser(login: string, password: string, email: string): Promise<Result<string | null>> {
        const result = await this.checkUnique(login, email)

        if (result.status !== DomainStatusCode.Success) {
            return result
        }

        const passwordHash = await this._generateHash(password);

        const newUser = {
            login,
            email,
            passwordHash,
            createdAt: new Date().toISOString()
        }
        const createdId =  await usersDbRepository.saveUser(newUser);

        return objectResult.success<string>(createdId);
    },

    async deleteUser(id: string): Promise<boolean> {
        return await usersDbRepository.deleteUser(id);
    },

    async _generateHash(password: string) {
        const passwordSalt = await bcrypt.genSalt(10);

        return await bcrypt.hash(password, passwordSalt);
    },

    async checkCredentials(loginOrEmail: string, password: string): Promise<Result<WithId<UserDbModel> | null>> {
        const foundUser = await usersDbRepository.findLoginOrEmail(loginOrEmail);
        if (!foundUser) {
            return objectResult.unauthorized();
        }

        const match = await bcrypt.compare(password, foundUser.passwordHash);

        if (match) {
            return objectResult.success<WithId<UserDbModel>>(foundUser)
        }
        return objectResult.unauthorized();
    }
}