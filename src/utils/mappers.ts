import {WithId} from "mongodb";
import {BlogDbModel} from "../types/blogs-types/BlogDbModel";
import {BlogViewModel} from "../types/blogs-types/BlogViewModel";
import {PostDbModel} from "../types/posts-types/PostDbModel";
import {PostViewModel} from "../types/posts-types/PostViewModel";
import {UserDbModel} from "../types/users-types/UserDbModel";
import {UserViewModel} from "../types/users-types/UserViewModel";
import {MeInfoViewModel} from "../types/users-types/MeInfoViewModel";
import {CommentDbModel} from "../types/comments-type/CommentDbModel";
import {CommentViewModel} from "../types/comments-type/CommentViewModel";

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

export const postMapper = (post: WithId<PostDbModel>): PostViewModel => {
    return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt.toISOString()
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

export const commentMapper = (comment: WithId<CommentDbModel>): CommentViewModel => {
    return {
        id: comment._id.toString(),
        commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin
        },
        content: comment.content,
        createdAt: comment.createdAt.toISOString()
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