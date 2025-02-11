import {PostsRepository} from "../repositories/db-repo/posts-db-repository";
import {responseFactory} from "../utils/object-result";
import {CreatePostDto} from "../routes/posts/CreatePostDto";
import {PostModel} from "../routes/posts/post.entity";
import {UpdatePostDto} from "../routes/posts/UpdatePostDto";
import {BlogsRepository} from "../repositories/db-repo/blogs-db-repository";
import {inject, injectable} from "inversify";

@injectable()
export class PostsService {
    constructor(@inject(PostsRepository) private postsRepository: PostsRepository,
                @inject(BlogsRepository) private blogRepository: BlogsRepository) {}

    async checkPost(postId: string) {
        const foundPost = await this.postsRepository.findPostById(postId);

        if (!foundPost) {
            return responseFactory.notFound();
        }
        return responseFactory.success(null);
    }

    async createPost(dto: CreatePostDto): Promise<string> {
        const foundBlog = await this.blogRepository.findBlogById(dto.blogId);
        if (!foundBlog) throw new Error('blog for post not found ' + dto.blogId);

        const post = new PostModel(dto);

        post.blogName = foundBlog.name

        return this.postsRepository.save(post);
    }

    async updatePost(id: string, dto: UpdatePostDto): Promise<boolean> {
        const post = await this.postsRepository.findPostById(id);
        if (!post) return false

        post.blogId = dto.blogId;
        post.content = dto.content;
        post.shortDescription = dto.shortDescription;
        post.title = dto.title;

        await this.postsRepository.save(post)

        return true
    }

    async deletePost(id: string): Promise<boolean> {
        return this.postsRepository.deletePost(id);
    }
}