import {Status} from "../../routes/likes/domain/comment-like.entity";

export type LikeInfoDbType = {
    userId: string;
    postId: string;
    login: string;
    myStatus: Status;
    createdAt: Date;
}

export type PostDbModel = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: Date
    likeCount: number;
    dislikeCount: number;
    newestLikes: LikeInfoDbType[]
}