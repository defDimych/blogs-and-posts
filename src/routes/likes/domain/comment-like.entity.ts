import mongoose, {HydratedDocument, Model, model} from "mongoose";

// todo перенести enum
export enum Status {
    None = "None",
    Like = "Like",
    Dislike = "Dislike"
}

export type CommentLikeDbType = {
    userId: string;
    commentId: string;
    myStatus: Status;
}

type CommentLikeModel = Model<CommentLikeDbType>

export type CommentLikeDocument = HydratedDocument<CommentLikeDbType>

const CommentLikeSchema = new mongoose.Schema<CommentLikeDbType>({
    userId: {type: String, required: true},
    commentId: {type: String, required: true},
    myStatus: {type: String, required: true}
})

export const CommentLikeModel = model<CommentLikeDbType, CommentLikeModel>('Comment-likes', CommentLikeSchema)