import {BlogInputModel} from "../types/blogs-types/BlogInputModel";
import {PostViewModel} from "../types/posts-types/PostViewModel";
import {PostInputModel} from "../types/posts-types/PostInputModel";

const collectionPosts: PostViewModel[] = [];

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

    findPostByBlogId(inputBlogId: string) {
        return collectionPosts.find(p => p.blogId === inputBlogId);
    }

//     findBlogById(id: string) {
//         return collectionPosts.find(b => b.id === id);
//     },
//
//     updateBlog(id: string, data: BlogInputModel) {
//         const foundBlog = collectionPosts.find(b => b.id === id);
//
//         if (foundBlog) {
//             foundBlog.name = data.name;
//             foundBlog.description = data.description;
//             foundBlog.websiteUrl = data.websiteUrl;
//
//             return true;
//         }
//         return false;
//     },
//
//     deleteBlog(id: string) {
//         const foundBlogIndex = collectionPosts.findIndex(b => b.id === id);
//
//         if (foundBlogIndex !== -1) {
//             collectionPosts.splice(foundBlogIndex, 1);
//
//             return true;
//         }
//         return false;
//     }
}