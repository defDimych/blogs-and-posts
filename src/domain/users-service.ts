import {usersDbRepository} from "../repositories/db-repo/users-db-repository";
import bcrypt from 'bcrypt';
import {WithId} from "mongodb";
import {UserDbModel} from "../types/users-types/UserDbModel";
import {DomainStatusCode, domainStatusResponse, Result} from "../utils/object-result";
import {uuid} from "uuidv4";
import {add} from "date-fns/add";
import {emailManager} from "../managers/email-manager";

const generateErrorMessage = (message: string, field?: string) => {
    return {
        errorsMessages: [
            {
                message,
                field
            }
        ]
    };
}

export const usersService = {
    async checkUnique(login: string, email: string): Promise<Result<null>> {
        const foundLogin = await usersDbRepository.findLogin(login);
        const foundEmail = await usersDbRepository.findEmail(email);

        if (foundLogin) {
            return domainStatusResponse.badRequest(generateErrorMessage('already exists', 'login'));
        }

        if (foundEmail) {
            return domainStatusResponse.badRequest(generateErrorMessage('already exists', 'email'));
        }

        return domainStatusResponse.success(null);
    },

    async createUserWithEmailConfirmation(login: string, password: string, email: string) {
        const result = await this.checkUnique(login, email);

        if (result.status !== DomainStatusCode.Success) {
            return result;
        }

        const passwordHash = await this._generateHash(password);

        const newUser = {
            accountData: {
                login,
                email,
                passwordHash,
                createdAt: new Date().toISOString()
            },
            emailConfirmation: {
                confirmationCode: uuid(),
                expirationDate: add(new Date(), {
                    minutes: 15
                }),
                isConfirmed: false
            }
        }
        const createdUserId =  await usersDbRepository.saveUser(newUser);

        const resultSending = await emailManager.sendEmailForConfirmation(email, newUser.emailConfirmation.confirmationCode);

        if (!resultSending) {
            await usersDbRepository.deleteUser(createdUserId);
        }

        return domainStatusResponse.success(createdUserId);
    },

    async createUser(login: string, password: string, email: string): Promise<Result<string | null>> {
        const result = await this.checkUnique(login, email)

        if (result.status !== DomainStatusCode.Success) {
            return result
        }

        const passwordHash = await this._generateHash(password);

        const newUser = {
            accountData: {
                login,
                email,
                passwordHash,
                createdAt: new Date().toISOString()
            },
            emailConfirmation: {
                confirmationCode: uuid(),
                expirationDate: add(new Date(), {
                    minutes: 15
                }),
                isConfirmed: true
            }
        }
        const createdUserId =  await usersDbRepository.saveUser(newUser);

        return domainStatusResponse.success<string>(createdUserId);
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
            return domainStatusResponse.unauthorized();
        }

        if (!foundUser.emailConfirmation.isConfirmed) {
            return domainStatusResponse.unauthorized(generateErrorMessage('Check your email'));
        }

        const match = await bcrypt.compare(password, foundUser.accountData.passwordHash);

        if (!match) {
            return domainStatusResponse.unauthorized();
        }
        return domainStatusResponse.success<WithId<UserDbModel>>(foundUser);
    },

    async emailConfirmation(code: string) {
        const user = await usersDbRepository.findUserByConfirmationCode(code);

        if (!user) {
            return domainStatusResponse.badRequest(generateErrorMessage('confirmation code is incorrect', 'code'));
        }

        if (user.emailConfirmation.isConfirmed) {
            return domainStatusResponse.badRequest(generateErrorMessage('The account has already been activated', 'code'));
        }

        if (user.emailConfirmation.expirationDate < new Date()) {
            return domainStatusResponse.badRequest(generateErrorMessage('expired confirmation code', 'code'));
        }

        await usersDbRepository.updateConfirmation(user._id.toString());

        return domainStatusResponse.success(null);
    },

    async emailResending(email: string) {
        const user = await usersDbRepository.findEmail(email);

        if (!user) {
            return domainStatusResponse.badRequest(generateErrorMessage('Check your email is correct', 'email'));
        }

        if (user.emailConfirmation.isConfirmed) {
            return domainStatusResponse.badRequest(generateErrorMessage('The account has already been activated', 'email'));
        }

        const newConfirmationCode = uuid();

        await usersDbRepository.updateConfirmationCode(user._id.toString(), newConfirmationCode);
        await emailManager.sendEmailForConfirmation(email, newConfirmationCode);

        return domainStatusResponse.success(null);
    }
}