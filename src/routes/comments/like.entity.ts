import mongoose, {HydratedDocument, Model, model} from "mongoose";

export enum Status {
    None = "None",
    Like = "Like",
    Dislike = "Dislike"
}

export type LikeDB = {
    userId: string;
    commentId: string;
    myStatus: Status;
}

type LikeModel = Model<LikeDB>

export type LikeDocument = HydratedDocument<LikeDB>

const likeSchema = new mongoose.Schema<LikeDB>({
    userId: {type: String, required: true},
    commentId: {type: String, required: true},
    myStatus: {type: String, required: true}
})

export const LikeModel = model<LikeDB, LikeModel>('Likes', likeSchema)