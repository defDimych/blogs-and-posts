import {ExtendedPostViewModel} from "../types/posts-types/PostViewModel";
import {PostInputModel} from "../types/posts-types/PostInputModel";
import {postsCollection} from "./db";

export const postsRepository = {
    async getAllPosts(): Promise<ExtendedPostViewModel[]> {
        return await postsCollection.find().toArray();
    },

    async createPost({ title, shortDescription, content, blogId }: PostInputModel): Promise<ExtendedPostViewModel> {
        const newPost = {
            id: Date.now() + Math.random() + '',
            title,
            shortDescription,
            content,
            blogId,
            blogName: 'IT-INCUBATOR',
            createdAt: new Date().toISOString()
        }
        await postsCollection.insertOne(newPost);

        return newPost;
    },

    async findPostById(id: string): Promise<ExtendedPostViewModel | null> {
        return await postsCollection.findOne({ id });
    },

    async updatePost(id: string, { title, shortDescription, content, blogId }: PostInputModel): Promise<boolean> {
        const result = await postsCollection.updateOne(
            { id }, { $set: {title, shortDescription, content, blogId} }
        );

        return result.modifiedCount === 1;
    },

    async deletePost(id: string): Promise<boolean> {
        const result = await postsCollection.deleteOne({ id });

        return result.deletedCount === 1;
    }
}