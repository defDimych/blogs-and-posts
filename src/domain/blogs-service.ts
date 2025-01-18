import {BlogInputModel} from "../types/blogs-types/BlogInputModel";
import {blogRepository, BlogsRepository} from "../repositories/db-repo/blogs-db-repository";
import {BlogModel} from "../routes/blogs/blog.entity";
import {responseFactory, Result} from "../utils/object-result";

export class BlogsService {
    constructor(private blogsRepository: BlogsRepository) {}

    async createBlog({ name, description, websiteUrl }: BlogInputModel): Promise<string> {
        const newBlog = {
            name,
            description,
            websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        const blog = new BlogModel(newBlog);
        // some business logic
        return this.blogsRepository.save(blog);
    }

    async updateBlog(id: string, inputData: BlogInputModel): Promise<Result<null>> {
        const blog = await this.blogsRepository.findBlogById(id);

        if (!blog) {
            return responseFactory.notFound();
        }
        // some business logic
        blog.name = inputData.name;
        blog.description = inputData.description;
        blog.websiteUrl = inputData.websiteUrl;

        await this.blogsRepository.save(blog);

        return responseFactory.success(null);
    }

    async deleteBlog(id: string): Promise<boolean> {
        return this.blogsRepository.deleteBlog(id);
    }
}

export const blogsService = new BlogsService(blogRepository)