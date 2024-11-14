import {WithId} from "mongodb";
import {BlogDbModel} from "../types/blogs-types/BlogDbModel";
import {BlogViewModel} from "../types/blogs-types/BlogViewModel";
import {PostDbModel} from "../types/posts-types/PostDbModel";
import {PostViewModel} from "../types/posts-types/PostViewModel";
import {UserDbModel} from "../types/users-types/UserDbModel";
import {UserViewModel} from "../types/users-types/UserViewModel";

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
        createdAt: post.createdAt
    }
}

export const userMapper = (user: WithId<UserDbModel>): UserViewModel => {
    return {
        id: user._id.toString(),
        login: user.login,
        email: user.email,
        createdAt: user.createdAt
    }
}