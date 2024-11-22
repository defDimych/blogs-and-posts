import {CommentDbModel} from "../../types/comments-type/CommentDbModel";
import {commentsCollection} from "../db";
import {ObjectId} from "mongodb";

export const commentsRepository = {
    async deleteComment(commentId: string) {
        const result = await commentsCollection.deleteOne({ _id: new ObjectId(commentId) })

        return result.deletedCount === 1;
    },

    async updateComment(commentId: string, content: string) {
        const result = await commentsCollection.updateOne(
            { _id: new ObjectId(commentId) },
            { $set: {content} }
        )
        return result.modifiedCount === 1;
    },

    async findCommentById(commentId: string) {
        return await commentsCollection.findOne({ _id: new ObjectId(commentId) })
    },

    async saveComment(comment: CommentDbModel) {
        const result = await commentsCollection.insertOne(comment);
        return result.insertedId.toString();
    }
}