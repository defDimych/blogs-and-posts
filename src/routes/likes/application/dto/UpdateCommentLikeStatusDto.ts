import {Status} from "../../domain/comment-like.entity";

export type UpdateCommentLikeStatusDto = {
    userId: string;
    commentId: string;
    likeStatus: Status
}