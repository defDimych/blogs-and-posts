import {BlogInputModel} from "../types/blogs-types/BlogInputModel";
import {blogsRepository} from "../repositories/db-repo/blogs-db-repository";

export const blogsService = {
    async createBlog({ name, description, websiteUrl }: BlogInputModel): Promise<string> {
        const newBlog = {
            name,
            description,
            websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        return await blogsRepository.createBlog(newBlog);
    },

    async updateBlog(id: string, inputData: BlogInputModel): Promise<boolean> {
        return await blogsRepository.updateBlog(id, inputData);
    },

    async deleteBlog(id: string): Promise<boolean> {
        return await blogsRepository.deleteBlog(id);
    }
}