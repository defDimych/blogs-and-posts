import {CommentLikeDocument, CommentLikeModel, Status} from "../domain/comment-like.entity";
import {injectable} from "inversify";
import {PostLikeDocument, PostLikeModel} from "../domain/post-like.entity";

@injectable()
export class LikeRepository {
    async getNewestLikes(postId: string): Promise<PostLikeDocument[]> {
        return PostLikeModel
            .find({ postId, myStatus: Status.Like })
            .sort({createdAt: -1})
            .limit(3)
    }

    async findLikeForComment(userId: string, commentId: string): Promise<CommentLikeDocument | null> {
        return CommentLikeModel.findOne({ userId, commentId })
    }

    async findLikeForPost(userId: string, postId: string): Promise<PostLikeDocument | null> {
        return PostLikeModel.findOne({ userId, postId })
    }

    async saveCommentLike(like: CommentLikeDocument) {
        await like.save()
    }

    async savePostLike(like: PostLikeDocument) {
        await like.save()
    }
}