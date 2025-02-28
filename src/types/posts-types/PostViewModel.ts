type LikeInfo = {
    userId: string;
    login: string;
    addedAt: string;
}

type ExtendedLikesInfoType = {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: LikeInfo[]
}

export type PostViewModel = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt?: string
    extendedLikesInfo: ExtendedLikesInfoType
}