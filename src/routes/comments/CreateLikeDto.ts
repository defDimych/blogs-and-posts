import {Status} from "./like.entity";

export type CreateLikeDto = {
    userId: string;
    commentId: string;
    likeStatus: Status
}