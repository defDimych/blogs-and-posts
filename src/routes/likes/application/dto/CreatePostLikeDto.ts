import {Status} from "../../domain/comment-like.entity";

export type CreatePostLikeDto = {
    userId: string;
    postId: string;
    likeStatus: Status
}