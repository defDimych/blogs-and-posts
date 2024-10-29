import {ExtendedBlogViewModel} from "../types/blogs-types/BlogViewModel";
import {BlogInputModel} from "../types/blogs-types/BlogInputModel";
import {blogsCollection} from "./db";
import {BlogDbModel} from "../types/blogs-types/BlogDbModel";
import {ObjectId, WithId} from "mongodb";

const blogMapper = (blog: WithId<BlogDbModel>): ExtendedBlogViewModel => {
    return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership
    }
}


export const blogsRepository = {
    async getAllBlogs(): Promise<ExtendedBlogViewModel[]> {
        const blogs: WithId<BlogDbModel>[] = await blogsCollection.find({}).toArray();
        return blogs.map(blogMapper)
    },

    async createBlog(newBlog: BlogDbModel): Promise<ExtendedBlogViewModel | null> {
        const result = await blogsCollection.insertOne(newBlog);
        const blogId = result.insertedId.toString();

        const createdBlog = blogsRepository.findBlogById(blogId);

        if(createdBlog) {
            return createdBlog;
        } else {
            throw new Error(`при создани блога с данными ${newBlog}, он почему то не вернулся`)
        }
    },

    async findBlogById(id: string): Promise<ExtendedBlogViewModel | null> {
        const blog: WithId<BlogDbModel> | null = await blogsCollection.findOne({ _id: new ObjectId(id) });

        if (blog) {
            return blogMapper(blog);
        } else {
            return null;
        }
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
    }
 }