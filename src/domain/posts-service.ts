import {postsRepository} from "../repositories/db-repo/posts-db-repository";
import {blogsRepository} from "../repositories/db-repo/blogs-db-repository";
import {responseFactory} from "../utils/object-result";
import {CreatePostDto} from "../routes/posts/CreatePostDto";
import {PostModel} from "../routes/posts/post.entity";
import {UpdatePostDto} from "../routes/posts/UpdatePostDto";

export const postsService = {
    async checkPost(postId: string) {
        const foundPost = await postsRepository.findPostById(postId);

        if (!foundPost) {
            return responseFactory.notFound();
        }
        return responseFactory.success(null);
    },

    async createPost(dto: CreatePostDto): Promise<string> {
        const foundBlog = await blogsRepository.findBlogById(dto.blogId);
        if (!foundBlog) throw new Error('blog for post not found ' + dto.blogId);

        const post = new PostModel(dto);

        post.blogName = foundBlog.name

        return postsRepository.save(post);
    },

    async updatePost(id: string, dto: UpdatePostDto): Promise<boolean> {
        const post = await postsRepository.findPostById(id);
        if (!post) return false

        post.blogId = dto.blogId;
        post.content = dto.content;
        post.shortDescription = dto.shortDescription;
        post.title = dto.title;

        await postsRepository.save(post)

        return true
    },

    async deletePost(id: string): Promise<boolean> {
        return postsRepository.deletePost(id);
    }
}