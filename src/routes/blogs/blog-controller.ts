import {BlogsService} from "../../domain/blogs-service";
import {PostsService} from "../../domain/posts-service";
import {BlogsQueryRepository} from "../../repositories/query-repo/blogs-query-repository";
import {PostsQueryRepository} from "../../repositories/query-repo/posts-query-repository";
import {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils/http-statuses";
import {RequestWithParamsAndBody, RequestWithParamsAndQuery, RequestWithQuery} from "../../types/request-types";
import {PaginationQueryType} from "../../types/PaginationQueryType";
import {getDefaultPaginationOptions} from "../helpers/pagination-helper";
import {BlogInputModel} from "../../types/blogs-types/BlogInputModel";
import {BlogPostInputModel} from "../../types/posts-types/BlogPostInputModel";
import {DomainStatusCode, handleError} from "../../utils/object-result";

export class BlogsController {
    constructor(private blogsService: BlogsService,
                private postsService: PostsService,
                private blogsQueryRepository: BlogsQueryRepository,
                private postsQueryRepository: PostsQueryRepository) {}

    async getBlog(req: Request, res: Response){
        const foundBlog = await this.blogsQueryRepository.findBlogById(req.params.id);

        if (!foundBlog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return
        }
        res.status(HTTP_STATUSES.SUCCESS_200).send(foundBlog);
    }

    async getBlogs(req: RequestWithQuery<PaginationQueryType>, res: Response){
        const receivedBlogs = await this.blogsQueryRepository.getAllBlogs(getDefaultPaginationOptions(req.query));

        res.status(HTTP_STATUSES.SUCCESS_200).send(receivedBlogs);
    }

    async getPostsSpecificBlog(req: RequestWithParamsAndQuery<{blogId: string}, PaginationQueryType>, res: Response){
        const foundBlog = await this.blogsQueryRepository.findBlogById(req.params.blogId);

        if (!foundBlog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return
        }

        const receivedPosts = await this.postsQueryRepository.getAllPostsByBlogId(getDefaultPaginationOptions(req.query), foundBlog.id)

        res.status(HTTP_STATUSES.SUCCESS_200).send(receivedPosts);
    }

    async createBlog(req: Request<any, any, BlogInputModel>, res: Response){
        const createdBlogId = await this.blogsService.createBlog(req.body);
        const createdBlog = await this.blogsQueryRepository.findBlogByIdOrThrow(createdBlogId)

        res.status(HTTP_STATUSES.CREATED_201).send(createdBlog);
    }

    async createPostForSpecificBlog(req: RequestWithParamsAndBody<{ blogId: string }, BlogPostInputModel>, res: Response){
        const foundBlog = await this.blogsQueryRepository.findBlogById(req.params.blogId);

        if (!foundBlog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return
        }

        const createdPostId = await this.postsService.createPost({...req.body, blogId: req.params.blogId});
        const createdPost = await this.postsQueryRepository.findPostById(createdPostId);

        if (!createdPost) return;

        res.status(HTTP_STATUSES.CREATED_201).send(createdPost);
    }

    async updateBlog(req: Request<any, any, BlogInputModel>, res: Response){
        const result = await this.blogsService.updateBlog(req.params.id, req.body);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status))
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }

    async deleteBlog(req: Request, res: Response){
        const isDeleted = await this.blogsService.deleteBlog(req.params.id);

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    }
}