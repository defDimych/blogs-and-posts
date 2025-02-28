import mongoose, {HydratedDocument, Model, model} from "mongoose";
import {LikeInfoDbType, PostDbModel} from "../../../types/posts-types/PostDbModel";

type PostModel = Model<PostDbModel>

export type PostDocument = HydratedDocument<PostDbModel>

const LikeInfoSchema = new mongoose.Schema<LikeInfoDbType>({
    userId: {type: String, required: true},
    postId: {type: String, required: true},
    myStatus: {type: String, required: true},
    login: {type: String, required: true}
}, { timestamps: true })

const PostSchema = new mongoose.Schema<PostDbModel>({
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    content: {type: String, required: true},
    blogId: {type: String, required: true},
    blogName: {type: String, required: true},
    likeCount: {type: Number, required: true, default: 0},
    dislikeCount: {type: Number, required: true, default: 0},
    newestLikes: {type: [LikeInfoSchema], required: true, default: []}
}, { timestamps: true })

export const PostModel = model<PostDbModel, PostModel>("Posts", PostSchema)