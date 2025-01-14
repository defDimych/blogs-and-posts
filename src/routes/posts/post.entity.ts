import mongoose, {HydratedDocument, Model, model} from "mongoose";
import {PostDbModel} from "../../types/posts-types/PostDbModel";

type PostModel = Model<PostDbModel>

export type PostDocument = HydratedDocument<PostDbModel>

const PostSchema = new mongoose.Schema<PostDbModel>({
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    content: {type: String, required: true},
    blogId: {type: String, required: true},
    blogName: {type: String, required: true},
    createdAt: {type: Date, required: true, default:Date.now()}
})

export const PostModel = model<PostDbModel, PostModel>("Posts", PostSchema)