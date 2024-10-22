import {PostViewModel} from "../types/posts-types/PostViewModel";
import {PostInputModel} from "../types/posts-types/PostInputModel";

let collectionPosts: PostViewModel[] = [];

export const postsInMemoryRepository = {
    async getAllPosts(): Promise<PostViewModel[]> {
        return collectionPosts;
    },

    async createPost({ title, shortDescription, content, blogId }: PostInputModel): Promise<PostViewModel> {
        const newPost = {
            id: Date.now() + Math.random() + '',
            title,
            shortDescription,
            content,
            blogId,
            blogName: 'IT-INCUBATOR'
        }
        collectionPosts.push(newPost);

        return newPost;
    },

    async findPostById(id: string): Promise<PostViewModel | undefined> {
        return collectionPosts.find(p => p.id === id);
    },

    async updatePost(id: string, { title, shortDescription, content, blogId }: PostInputModel): Promise<boolean> {
        const foundPost = collectionPosts.find(p => p.id === id);

        if (foundPost) {
            foundPost.title = title;
            foundPost.shortDescription = shortDescription;
            foundPost.content = content;
            foundPost.blogId = blogId;

            return true;
        }
        return false;
    },

    async deletePost(id: string): Promise<boolean> {
        const foundPostIndex = collectionPosts.findIndex(p => p.id === id);

        if (foundPostIndex !== -1) {
            collectionPosts.splice(foundPostIndex, 1);

            return true;
        }
        return false;
    },

    deleteAllData() {
        collectionPosts = [];
    }
}