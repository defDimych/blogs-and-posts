import {usersRepository} from "../repositories/db-repo/users-db-repository";
import bcrypt from 'bcrypt';
import {DomainStatusCode, responseFactory, Result} from "../utils/object-result";
import {uuid} from "uuidv4";
import {add} from "date-fns/add";
import {emailManager} from "../application/email-manager";
import {generateErrorMessage} from "../utils/mappers";

export const usersService = {
    async checkUnique(login: string, email: string): Promise<Result<null>> {
        const foundLogin = await usersRepository.findLogin(login);
        const foundEmail = await usersRepository.findEmail(email);

        if (foundLogin) {
            return responseFactory.badRequest(generateErrorMessage('already exists', 'login'));
        }

        if (foundEmail) {
            return responseFactory.badRequest(generateErrorMessage('already exists', 'email'));
        }

        return responseFactory.success(null);
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
        const createdUserId = await usersRepository.saveUser(newUser);

        const resultSending = await emailManager.sendEmailForConfirmation(email, newUser.emailConfirmation.confirmationCode);

        if (!resultSending) {
            await usersRepository.deleteUser(createdUserId);
        }

        return responseFactory.success(createdUserId);
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
        const createdUserId =  await usersRepository.saveUser(newUser);

        return responseFactory.success<string>(createdUserId);
    },

    async deleteUser(id: string): Promise<boolean> {
        return await usersRepository.deleteUser(id);
    },

    async _generateHash(password: string) {
        const passwordSalt = await bcrypt.genSalt(10);

        return await bcrypt.hash(password, passwordSalt);
    },

    async emailConfirmation(code: string) {
        const user = await usersRepository.findUserByConfirmationCode(code);

        if (!user) {
            return responseFactory.badRequest(generateErrorMessage('confirmation code is incorrect', 'code'));
        }

        if (user.emailConfirmation.isConfirmed) {
            return responseFactory.badRequest(generateErrorMessage('The account has already been activated', 'code'));
        }

        if (user.emailConfirmation.expirationDate < new Date()) {
            return responseFactory.badRequest(generateErrorMessage('expired confirmation code', 'code'));
        }

        await usersRepository.updateConfirmation(user._id.toString());

        return responseFactory.success(null);
    },

    async emailResending(email: string) {
        const user = await usersRepository.findEmail(email);

        if (!user) {
            return responseFactory.badRequest(generateErrorMessage('Check your email is correct', 'email'));
        }

        if (user.emailConfirmation.isConfirmed) {
            return responseFactory.badRequest(generateErrorMessage('The account has already been activated', 'email'));
        }

        const newConfirmationCode = uuid();

        await usersRepository.updateConfirmationCode(user._id.toString(), newConfirmationCode);
        await emailManager.sendEmailForConfirmation(email, newConfirmationCode);

        return responseFactory.success(null);
    }
}