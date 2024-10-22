import {BlogViewModel} from "../types/blogs-types/BlogViewModel";
import {BlogInputModel} from "../types/blogs-types/BlogInputModel";

let collectionBlogs: BlogViewModel[] = [];

export const blogsInMemoryRepository = {
    async getAllBlogs(): Promise<BlogViewModel[]> {
        return collectionBlogs;
    },

    async createBlog(name: string, description: string, websiteUrl: string): Promise<BlogViewModel> {
        const newBlog = {
            id: Date.now() + Math.random() + '',
            name,
            description,
            websiteUrl
        }
        collectionBlogs.push(newBlog);
        return newBlog;
    },

    async findBlogById(id: string): Promise<BlogViewModel | undefined> {
        return collectionBlogs.find(b => b.id === id);
    },

    async updateBlog(id: string, data: BlogInputModel): Promise<boolean> {
        const foundBlog = collectionBlogs.find(b => b.id === id);

        if (foundBlog) {
            foundBlog.name = data.name;
            foundBlog.description = data.description;
            foundBlog.websiteUrl = data.websiteUrl;

            return true;
        }
        return false;
    },

    async deleteBlog(id: string): Promise<boolean> {
        const foundBlogIndex = collectionBlogs.findIndex(b => b.id === id);

        if (foundBlogIndex !== -1) {
            collectionBlogs.splice(foundBlogIndex, 1);

            return true;
        }
        return false;
    },

    deleteAllData() {
        collectionBlogs = [];
    }
}