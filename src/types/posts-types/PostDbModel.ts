export type PostCreateModel = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
}

export type PostDbModel = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: Date
}