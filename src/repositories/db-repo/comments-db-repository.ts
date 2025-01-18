import {ObjectId} from "mongodb";
import {CommentDocument, CommentModel} from "../../routes/comments/comment.entity";

class CommentsRepository {
    async findCommentById(commentId: string): Promise<CommentDocument | null> {
        return CommentModel.findOne({ _id: new ObjectId(commentId) })
    }

    async save(comment: CommentDocument): Promise<string> {
        const updatedComment = await comment.save();
        return updatedComment._id.toString()
    }
}

export const commentsRepository = new CommentsRepository()