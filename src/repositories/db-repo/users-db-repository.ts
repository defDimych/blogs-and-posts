import {ObjectId, WithId} from "mongodb";
import {UserDocument, UserModel} from "../../routes/users/user.entity";
import {UserDbModel} from "../../types/users-types/UserDbModel";

export class UsersRepository {
    async findUserById(userId: string): Promise<WithId<UserDbModel>> {
        const user = await UserModel.findOne({ _id: new ObjectId(userId) }).lean();

        if (!user) {
            throw new Error(`user by id: ${userId} not found`)
        }
        return user;
    }

    async findUserByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDbModel> | null> {
        return UserModel.findOne({
            $or: [
                {"accountData.login": loginOrEmail},
                {"accountData.email": loginOrEmail}
            ]
        }).lean();
    }

    async findUserByConfirmationCode(code: string): Promise<UserDocument | null> {
        return UserModel.findOne({"emailConfirmation.confirmationCode": code})
    }

    async findUserByPasswordRecoveryCode(code: string): Promise<UserDocument | null> {
        return UserModel.findOne({"passwordRecovery.recoveryCode": code})
    }

    async findLogin(login: string): Promise<UserDocument | null> {
        return UserModel.findOne({"accountData.login": login})
    }

    async findEmail(email: string): Promise<UserDocument | null> {
        return UserModel.findOne({"accountData.email": email})
    }

    async save(user: UserDocument): Promise<string> {
        const createdUser = await user.save()
        return createdUser._id.toString()
    }

    async deleteUser(id: string): Promise<boolean> {
        const user = await UserModel.findByIdAndDelete(id);
        return !!user
    }
}