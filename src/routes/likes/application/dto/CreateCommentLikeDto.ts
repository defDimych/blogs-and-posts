import {Status} from "../../domain/comment-like.entity";

export type CreateCommentLikeDto = {
    userId: string;
    commentId: string;
    likeStatus: Status
}