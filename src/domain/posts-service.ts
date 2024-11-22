import {PostInputModel} from "../types/posts-types/PostInputModel";
import {postsRepository} from "../repositories/db-repo/posts-db-repository";
import {blogsRepository} from "../repositories/db-repo/blogs-db-repository";
import {objectResult} from "../utils/object-result";

export const postsService = {
    async checkPost(postId: string) {
        const foundPost = await postsRepository.findPostById(postId);

        if (!foundPost) {
            return objectResult.notFound();
        }
        return objectResult.success(null);
    },

    async createPost({ title, shortDescription, content, blogId }: PostInputModel): Promise<string> {
        const foundBlog = await blogsRepository.findBlogById(blogId);

        if (!foundBlog) throw new Error('blog for post not found ' + blogId);

        const newPost = {
            title,
            shortDescription,
            content,
            blogId,
            blogName: foundBlog.name,
            createdAt: new Date().toISOString()
        }
        return await postsRepository.createPost(newPost);
    },

    async updatePost(id: string, inputData: PostInputModel): Promise<boolean> {
        return await postsRepository.updatePost(id, inputData);
    },

    async deletePost(id: string): Promise<boolean> {
        return await postsRepository.deletePost(id);
    }
}