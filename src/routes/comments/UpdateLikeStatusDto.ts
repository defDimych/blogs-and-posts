import {Status} from "./like.entity";

export type UpdateLikeStatusDto = {
    userId: string;
    commentId: string;
    likeStatus: Status
}