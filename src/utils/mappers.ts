import {WithId} from "mongodb";
import {BlogDbModel} from "../types/blogs-types/BlogDbModel";
import {BlogViewModel} from "../types/blogs-types/BlogViewModel";
import {UserDbModel} from "../types/users-types/UserDbModel";
import {UserViewModel} from "../types/users-types/UserViewModel";
import {MeInfoViewModel} from "../types/users-types/MeInfoViewModel";

export const blogMapper = (blog: WithId<BlogDbModel>): BlogViewModel => {
    return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership
    }
}

export const userMapper = (user: WithId<UserDbModel>): UserViewModel => {
    return {
        id: user._id.toString(),
        login: user.accountData.login,
        email: user.accountData.email,
        createdAt: user.accountData.createdAt
    }
}

export const meInfoMapper = (user: WithId<UserDbModel>): MeInfoViewModel => {
    return {
        userId: user._id.toString(),
        email: user.accountData.email,
        login: user.accountData.login
    }
}

export const generateErrorMessage = (message: string, field?: string) => {
    return {
        errorsMessages: [
            {
                message,
                field
            }
        ]
    };
}