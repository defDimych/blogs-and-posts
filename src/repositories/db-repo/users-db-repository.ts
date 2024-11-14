import {usersCollection} from "../db";
import {UserDbModel} from "../../types/users-types/UserDbModel";
import {ObjectId} from "mongodb";

export const usersDbRepository = {
    async findLoginOrEmail(loginOrEmail: string) {
        return await usersCollection.findOne({
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