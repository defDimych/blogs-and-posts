import {ExtendedBlogViewModel} from "../types/blogs-types/BlogViewModel";
import {BlogInputModel} from "../types/blogs-types/BlogInputModel";
import {blogsRepository} from "../repositories/blogs-db-repository";

export const blogsService = {
    async getAllBlogs(): Promise<ExtendedBlogViewModel[]> {
        return await blogsRepository.getAllBlogs();
    },

    async createBlog({ name, description, websiteUrl }: BlogInputModel): Promise<ExtendedBlogViewModel | null> {
        const newBlog = {
            name,
            description,
            websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        return await blogsRepository.createBlog(newBlog);
    },

    async findBlogById(id: string): Promise<ExtendedBlogViewModel | null> {
        return await blogsRepository.findBlogById(id);
    },

    async updateBlog(id: string, inputData: BlogInputModel): Promise<boolean> {
        return await blogsRepository.updateBlog(id, inputData);
    },

    async deleteBlog(id: string): Promise<boolean> {
        return await blogsRepository.deleteBlog(id);
    }
}