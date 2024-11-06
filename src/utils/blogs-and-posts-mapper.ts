import {WithId} from "mongodb";
import {BlogDbModel} from "../types/blogs-types/BlogDbModel";
import {ExtendedBlogViewModel} from "../types/blogs-types/BlogViewModel";
import {PostDbModel} from "../types/posts-types/PostDbModel";
import {ExtendedPostViewModel} from "../types/posts-types/PostViewModel";

export const blogMapper = (blog: WithId<BlogDbModel>): ExtendedBlogViewModel => {
    return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership
    }
}

export const postMapper = (post: WithId<PostDbModel>): ExtendedPostViewModel => {
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