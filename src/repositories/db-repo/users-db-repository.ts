import {usersCollection} from "../db";
import {UserDbModel} from "../../types/users-types/UserDbModel";
import {ObjectId} from "mongodb";

export const usersRepository = {
    async findUserById(userId: string) {
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            throw new Error(`user by id: ${userId} not found`)
        }
        return user;
    },

    async findUserByLoginOrEmail(loginOrEmail: string) {
        return await usersCollection.findOne({
            $or: [
                {"accountData.login": loginOrEmail},
                {"accountData.email": loginOrEmail}
            ]
        })
    },

    async findUserByConfirmationCode(code: string) {
        return await usersCollection.findOne({"emailConfirmation.confirmationCode": code});
    },

    async findLogin(login: string) {
        return await usersCollection.findOne({"accountData.login": login});
    },

    async findEmail(email: string) {
        return await usersCollection.findOne({"accountData.email": email});
    },

    async updateConfirmation(id: string) {
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: {"emailConfirmation.isConfirmed": true} }
        );
        return result.modifiedCount === 1;
    },

    async updateConfirmationCode(id: string, newConfirmationCode: string) {
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: {"emailConfirmation.confirmationCode": newConfirmationCode} }
        );
        return result.modifiedCount === 1;
    },

    async saveUser(user: UserDbModel) {
        const result = await usersCollection.insertOne(user);

        return result.insertedId.toString();
    },

    async deleteUser(id: string): Promise<boolean> {
        const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

        return result.deletedCount === 1;
    }
}