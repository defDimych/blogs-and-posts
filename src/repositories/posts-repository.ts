import {PostViewModel} from "../types/posts-types/PostViewModel";
import {PostInputModel} from "../types/posts-types/PostInputModel";

let collectionPosts: PostViewModel[] = [];

export const postsRepository = {
    getAllPosts() {
        return collectionPosts;
    },

    createPost({ title, shortDescription, content, blogId }: PostInputModel) {
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

    findPostById(id: string) {
        return collectionPosts.find(p => p.id === id);
    },

    updatePost(id: string, { title, shortDescription, content, blogId }: PostInputModel) {
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

    deletePost(id: string) {
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