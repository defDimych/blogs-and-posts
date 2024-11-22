export type CommentDbModel = {
    postId: string;
    content: string;
    commentatorInfo: {
        userId: string;
        userLogin: string;
    }
    createdAt: string;
}