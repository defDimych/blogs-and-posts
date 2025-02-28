import {ObjectId} from "mongodb";
import {CommentDocument, CommentModel} from "../../routes/comments/domain/comment.entity";
import {injectable} from "inversify";

@injectable()
export class CommentsRepository {
    async findCommentById(commentId: string): Promise<CommentDocument | null> {
        return CommentModel.findOne({ _id: new ObjectId(commentId) })
    }

    async save(comment: CommentDocument): Promise<string> {
        const updatedComment = await comment.save();
        return updatedComment._id.toString()
    }
}