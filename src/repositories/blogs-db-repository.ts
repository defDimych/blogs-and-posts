import {ExtendedBlogViewModel} from "../types/blogs-types/BlogViewModel";
import {BlogInputModel} from "../types/blogs-types/BlogInputModel";
import {blogsCollection} from "./db";

export const blogsRepository = {
    async getAllBlogs(): Promise<ExtendedBlogViewModel[]> {
        return await blogsCollection.find().toArray();
    },

    async createBlog({ name, description, websiteUrl }: BlogInputModel): Promise<ExtendedBlogViewModel> {
        const newBlog = {
            id: Date.now() + Math.random() + '',
            name,
            description,
            websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        await blogsCollection.insertOne(newBlog);
        return newBlog;
    },

    async findBlogById(id: string): Promise<ExtendedBlogViewModel | null> {
        return await blogsCollection.findOne({ id });
    },

    async updateBlog(id: string, {name, description, websiteUrl}: BlogInputModel): Promise<boolean> {
        const result = await blogsCollection.updateOne(
            { id }, { $set: { name, description, websiteUrl } }
        )

        return result.modifiedCount === 1;
    },

    async deleteBlog(id: string): Promise<boolean> {
        const result = await blogsCollection.deleteOne({ id });

        return result.deletedCount === 1;
    },
 }