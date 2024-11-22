import {usersCollection} from "../db";
import {UserDbModel} from "../../types/users-types/UserDbModel";
import {ObjectId} from "mongodb";

export const usersDbRepository = {
    async findUserById(userId: string) {
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            throw new Error(`user by id: ${userId} not found`)
        }
        return user;
    },

    async findLoginOrEmail(loginOrEmail: string) {
        return usersCollection.findOne({
            $or: [
                {login: loginOrEmail},
                {email: loginOrEmail}
            ]
        })
    },

    async findLogin(login: string) {
        return await usersCollection.findOne({ login });
    },

    async findEmail(email: string) {
        return await usersCollection.findOne({ email });
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