import {BlogViewModel} from "../types/blogs-types/BlogViewModel";
import {BlogInputModel} from "../types/blogs-types/BlogInputModel";

let collectionBlogs: BlogViewModel[] = [];

export const blogsRepository = {
    getAllBlogs() {
        return collectionBlogs;
    },

    createBlog(name: string, description: string, websiteUrl: string): BlogViewModel {
        const newBlog = {
            id: Date.now() + Math.random() + '',
            name,
            description,
            websiteUrl
        }
        collectionBlogs.push(newBlog);
        return newBlog;
    },

    findBlogById(id: string) {
        return collectionBlogs.find(b => b.id === id);
    },

    updateBlog(id: string, data: BlogInputModel) {
        const foundBlog = collectionBlogs.find(b => b.id === id);

        if (foundBlog) {
            foundBlog.name = data.name;
            foundBlog.description = data.description;
            foundBlog.websiteUrl = data.websiteUrl;

            return true;
        }
        return false;
    },

    deleteBlog(id: string) {
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