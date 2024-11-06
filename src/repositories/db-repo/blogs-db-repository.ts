import {BlogInputModel} from "../../types/blogs-types/BlogInputModel";
import {blogsCollection} from "../db";
import {BlogDbModel} from "../../types/blogs-types/BlogDbModel";
import {ObjectId, WithId} from "mongodb";
import {ExtendedBlogViewModel} from "../../types/blogs-types/BlogViewModel";
import {blogMapper} from "../../utils/blogs-and-posts-mapper";

export const blogsRepository = {
    async findBlogById(id: string): Promise<WithId<BlogDbModel> | null> {
        return blogsCollection.findOne({ _id: new ObjectId(id) });
    },

    async createBlog(newBlog: BlogDbModel): Promise<string> {
        const result = await blogsCollection.insertOne(newBlog);

        return result.insertedId.toString();
    },

    async updateBlog(id: string, {name, description, websiteUrl}: BlogInputModel): Promise<boolean> {
        const result = await blogsCollection.updateOne(
            { _id: new ObjectId(id) }, { $set: { name, description, websiteUrl } }
        )

        return result.modifiedCount === 1;
    },

    async deleteBlog(id: string): Promise<boolean> {
        const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) });

        return result.deletedCount === 1;
    },

}