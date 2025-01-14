export type Commentator = {
    userId: string;
    userLogin: string;
}

export type CommentDbModel = {
    postId: string;
    content: string;
    commentatorInfo: Commentator
    createdAt: Date;
}