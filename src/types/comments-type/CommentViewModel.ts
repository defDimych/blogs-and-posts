import {Status} from "../../routes/likes/domain/comment-like.entity";

type Commentator = {
    userId: string;
    userLogin: string;
}

type LikesInfoViewModel = {
    likesCount: number;
    dislikesCount: number;
    myStatus: Status
}

export type CommentViewModel = {
    id: string;
    content: string;
    commentatorInfo: Commentator;
    createdAt: string;
    likesInfo: LikesInfoViewModel
}