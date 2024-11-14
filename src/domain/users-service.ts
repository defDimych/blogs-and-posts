import {usersDbRepository} from "../repositories/db-repo/users-db-repository";
import {ErrorsViewModel} from "../types/ErrorsViewModel";
import bcrypt from 'bcrypt';

type Extension = {
    message: string,
    field?: string,
}

export type Result<Data> = {
    status: DomainStatusCode;
    extensions: Extension[];
    data: Data | null
}

export enum DomainStatusCode {
    Success = 0,
    NotFound = 1,
    Forbidden = 2,
    Unauthorized = 3,
    BadRequest  = 4,
    EmailNotSend = 50
}

const successResult = <T>(data: T): Result<T> => {
    return {
        status: DomainStatusCode.Success,
        data,
        extensions: []
    }
}

export const usersService = {
    async checkUnique(login: string, email: string): Promise<Result<null>> {
        const errorObject: ErrorsViewModel = { errorsMessages: [] };

        const foundLogin = await usersDbRepository.findLogin(login);
        const foundEmail = await usersDbRepository.findEmail(email);

        if (foundLogin) {
            return {
                status: DomainStatusCode.BadRequest,
                data: null,
                extensions: [{message: 'already exists', field: 'login'}]
            }
            //errorObject.errorsMessages.push({ message: 'This login already exists', field: 'login'});
        }

        if (foundEmail) {
            return {
                status: DomainStatusCode.BadRequest,
                data: null,
                extensions: [{message: 'already exists', field: 'email'}]
            }
            //errorObject.errorsMessages.push({ message: 'The email address is busy', field: 'email'});
        }

        return {
            status: DomainStatusCode.Success,
            data: null,
            extensions: []
        } ;
    },

    async createUser(login: string, password: string, email: string): Promise<Result<string | null>> {
        const result = await this.checkUnique(login, email)

        if(result.status !== DomainStatusCode.Success) {
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

        return successResult<string>(createdId)
    },

    async deleteUser(id: string): Promise<boolean> {
        return await usersDbRepository.deleteUser(id);
    },

    async _generateHash(password: string) {
        const passwordSalt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, passwordSalt);

        return hash;
    },

    async checkCredentials(loginOrEmail: string, password: string): Promise<boolean> {
        const foundUser = await usersDbRepository.findLoginOrEmail(loginOrEmail);
        if (!foundUser) return false;

        const match = await bcrypt.compare(password, foundUser.passwordHash);

        if (match) {
            return true
        }
        return false
    }
}