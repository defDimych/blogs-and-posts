import {Status} from "../../domain/comment-like.entity";

export type UpdatePostLikeStatusDto = {
    userId: string;
    postId: string;
    likeStatus: Status
}