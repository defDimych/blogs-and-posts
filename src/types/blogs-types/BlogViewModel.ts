export interface BlogViewModel {
    id: string
    name: string
    description: string
    websiteUrl: string
}

export interface ExtendedBlogViewModel extends BlogViewModel {
    createdAt?: string,
    isMembership?: boolean
}