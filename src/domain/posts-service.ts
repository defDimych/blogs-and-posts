import {ExtendedPostViewModel} from "../types/posts-types/PostViewModel";
import {PostInputModel} from "../types/posts-types/PostInputModel";
import {postsRepository} from "../repositories/posts-db-repository";

export const postsService = {
    async getAllPosts(): Promise<ExtendedPostViewModel[]> {
        return await postsRepository.getAllPosts();
    },

    async createPost({ title, shortDescription, content, blogId }: PostInputModel): Promise<ExtendedPostViewModel | null> {
        const newPost = {
            title,
            shortDescription,
            content,
            blogId,
            blogName: 'IT-INCUBATOR',
            createdAt: new Date().toISOString()
        }
        return await postsRepository.createPost(newPost);
    },

    async findPostById(id: string): Promise<ExtendedPostViewModel | null> {
        return await postsRepository.findPostById(id);
    },

    async updatePost(id: string, inputData: PostInputModel): Promise<boolean> {
        return await postsRepository.updatePost(id, inputData);
    },

    async deletePost(id: string): Promise<boolean> {
        return await postsRepository.deletePost(id);
    }
}