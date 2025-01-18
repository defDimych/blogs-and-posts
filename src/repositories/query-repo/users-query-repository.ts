import {PaginationType} from "../../routes/helpers/pagination-helper";
import {PaginationModel} from "../../types/PaginationModel";
import {ObjectId, WithId} from "mongodb";
import {meInfoMapper, userMapper} from "../../utils/mappers";
import {UserViewModel} from "../../types/users-types/UserViewModel";
import {UserDbModel} from "../../types/users-types/UserDbModel";
import {UserModel} from "../../routes/users/user.entity";
import {MeInfoViewModel} from "../../types/users-types/MeInfoViewModel";

class UsersQueryRepository {
    async getAllUsers(options: PaginationType): Promise<PaginationModel<UserViewModel[]>> {
        const filter = {
            $or: [
                {login: { $regex: options.searchLoginTerm ?? '', $options: 'i'}},
                {email: { $regex: options.searchEmailTerm ?? '', $options: 'i'}},
                {}
            ]
        }

        const sortDirection = options.sortDirection === 'asc' ? 1 : -1

        try {
            const items: WithId<UserDbModel>[] = await UserModel
                .find(filter)
                .sort({[options.sortBy]: sortDirection})
                .skip((options.pageNumber - 1) * options.pageSize)
                .limit(options.pageSize)
                .lean()

            const totalCount = await UserModel.countDocuments(filter);

            return {
                pagesCount: Math.ceil(totalCount / options.pageSize),
                page: options.pageNumber,
                pageSize: options.pageSize,
                totalCount: totalCount,
                items: items.map(userMapper)
            }
        } catch (e) {
            console.log(`GET query repository, getAllUsers : ${JSON.stringify(e, null, 2)}`)
            throw new Error(`some error`)
        }
    }

    async getInfoById(id: string): Promise<MeInfoViewModel | null> {
        const user: WithId<UserDbModel> | null = await UserModel.findOne({ _id: new ObjectId(id) }).lean();

        if (user) {
            return meInfoMapper(user);
        } else {
            return null;
        }
    }

    async findUserById(id: string): Promise<UserViewModel | null> {
        const user: WithId<UserDbModel> | null = await UserModel.findOne({ _id: new ObjectId(id) }).lean();

        if (user) {
            return userMapper(user);
        } else {
            return null;
        }
    }
}

export const usersQueryRepository = new UsersQueryRepository()