export type PostViewModel = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string
}

export interface ExtendedPostViewModel extends PostViewModel {
    createdAt?: string,
}