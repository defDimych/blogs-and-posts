import {Status} from "../../routes/comments/like.entity";

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