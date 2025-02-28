import {Status} from "./comment-like.entity";
import mongoose, {HydratedDocument, model, Model} from "mongoose";

type PostLikeDbType = {
    userId: string;
    postId: string;
    login: string;
    myStatus: Status;
    createdAt: Date;
}

type PostLikeModel = Model<PostLikeDbType>

export type PostLikeDocument = HydratedDocument<PostLikeDbType>

const PostLikeSchema = new mongoose.Schema<PostLikeDbType>({
    userId: {type: String, required: true},
    postId: {type: String, required: true},
    myStatus: {type: String, required: true},
    login: {type: String}
}, { timestamps: true })

export const PostLikeModel = model<PostLikeDbType, PostLikeModel>('Post-likes', PostLikeSchema)