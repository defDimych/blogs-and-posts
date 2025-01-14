import mongoose, {HydratedDocument, model, Model} from "mongoose";
import {Commentator, CommentDbModel} from "../../types/comments-type/CommentDbModel";

type CommentModel = Model<CommentDbModel>

export type CommentDocument = HydratedDocument<CommentDbModel>

const commentatorSchema = new mongoose.Schema<Commentator>({
    userId: {type: String, required: true},
    userLogin: {type: String, required: true}
}, {_id: false})

const commentSchema = new mongoose.Schema<CommentDbModel>({
    postId: {type: String, required: true},
    content: {type: String, required: true},
    commentatorInfo: {type: commentatorSchema},
    createdAt: {type: Date, required: true, default: Date.now()}
})

export const CommentModel = model<CommentDbModel, CommentModel>("Comments", commentSchema);