import mongoose, {HydratedDocument, Model, model} from "mongoose";
import {BlogDbModel} from "../../types/blogs-types/BlogDbModel";

type BlogModel = Model<BlogDbModel>

export type BlogDocument = HydratedDocument<BlogDbModel>

const blogSchema = new mongoose.Schema<BlogDbModel>({
    name: {type: String, required: true},
    description: {type: String, required: true},
    websiteUrl: {type: String, required: true},
    createdAt: {type: String, required: true},
    isMembership: {type: Boolean, required: true}
})

export const BlogModel = model<BlogDbModel, BlogModel>("Blogs", blogSchema);