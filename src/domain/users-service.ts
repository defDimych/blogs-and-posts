import {usersRepository} from "../repositories/db-repo/users-db-repository";
import bcrypt from 'bcrypt';
import {DomainStatusCode, responseFactory, Result} from "../utils/object-result";
import {uuid} from "uuidv4";
import {add} from "date-fns/add";
import {emailManager} from "../application/email-manager";
import {generateErrorMessage} from "../utils/mappers";
import {CreateUserDto} from "../routes/CreateUserDto";
import {UserModel} from "../routes/users/user.entity";

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

    async createUserWithEmailConfirmation(dto: CreateUserDto): Promise<Result<string | null>> {
        const result = await this.checkUnique(dto.login, dto.email);

        if (result.status !== DomainStatusCode.Success) {
            return result;
        }

        const passwordHash = await this._generateHash(dto.password);

        const newUser = {
            accountData: {
                login: dto.login,
                email: dto.email,
                passwordHash,
                createdAt: new Date().toISOString()
            },
            emailConfirmation: {
                confirmationCode: uuid(),
                expirationDate: add(new Date(), {
                    minutes: 15
                }),
                isConfirmed: false
            },
            passwordRecovery: {
                recoveryCode: uuid(),
                expirationDate: add(new Date(), {
                    minutes: 15
                })
            }
        }

        const user = new UserModel(newUser)

        const userId = await usersRepository.save(user);
        const resultSending = await emailManager.sendEmailForConfirmation(dto.email, newUser.emailConfirmation.confirmationCode);

        if (!resultSending) {
            await usersRepository.deleteUser(userId);
        }

        return responseFactory.success(userId);
    },

    async createUser(dto: CreateUserDto): Promise<Result<string | null>> {
        const result = await this.checkUnique(dto.login, dto.email)

        if (result.status !== DomainStatusCode.Success) {
            return result
        }

        const passwordHash = await this._generateHash(dto.password);

        const newUser = {
            accountData: {
                login: dto.login,
                email: dto.email,
                passwordHash,
                createdAt: new Date().toISOString()
            },
            emailConfirmation: {
                confirmationCode: uuid(),
                expirationDate: add(new Date(), {
                    minutes: 15
                }),
                isConfirmed: true
            },
            passwordRecovery: {
                recoveryCode: uuid(),
                expirationDate: add(new Date(), {
                    minutes: 15
                })
            }
        }

        const user = new UserModel(newUser);
        const userId = await usersRepository.save(user);

        return responseFactory.success<string>(userId);
    },

    async deleteUser(id: string): Promise<boolean> {
        return usersRepository.deleteUser(id);
    },

    async _generateHash(password: string) {
        const passwordSalt = await bcrypt.genSalt(10);

        return bcrypt.hash(password, passwordSalt);
    },

    async emailConfirmation(code: string): Promise<Result<null>> {
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

        user.emailConfirmation.isConfirmed = true

        await usersRepository.save(user);

        return responseFactory.success(null);
    },

    async emailResending(email: string): Promise<Result<null>> {
        const user = await usersRepository.findEmail(email);

        if (!user) {
            return responseFactory.badRequest(generateErrorMessage('Check your email is correct', 'email'));
        }

        if (user.emailConfirmation.isConfirmed) {
            return responseFactory.badRequest(generateErrorMessage('The account has already been activated', 'email'));
        }

        const newConfirmationCode = uuid();
        user.emailConfirmation.confirmationCode = newConfirmationCode

        await usersRepository.save(user);
        await emailManager.sendEmailForConfirmation(email, newConfirmationCode);

        return responseFactory.success(null);
    }
}