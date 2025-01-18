import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils/http-statuses";
import {BlogInputModel} from "../../types/blogs-types/BlogInputModel";
import {blogInputValidationMiddlewares} from "../../middlewares/validation/blog-input-validation-middlewares";
import {basicAuthMiddleware} from "../../middlewares/auth/basic-auth-middleware";
import {checkInputErrorsMiddleware} from "../../middlewares/check-input-errors-middleware";
import {BlogsService, blogsService} from "../../domain/blogs-service";
import {RequestWithParamsAndBody, RequestWithParamsAndQuery, RequestWithQuery} from "../../types/request-types";
import {BlogPostInputModel} from "../../types/posts-types/BlogPostInputModel";
import {PostsService, postsService} from "../../domain/posts-service";
import {PaginationQueryType} from "../../types/PaginationQueryType";
import {getDefaultPaginationOptions} from "../helpers/pagination-helper";
import {blogPostInputValidationMiddleware} from "../../middlewares/validation/blog-post-input-validation-middleware";
import {BlogsQueryRepository, blogsQueryRepository} from "../../repositories/query-repo/blogs-query-repository";
import {PostsQueryRepository, postsQueryRepository} from "../../repositories/query-repo/posts-query-repository";
import {DomainStatusCode, handleError} from "../../utils/object-result";

export const blogsRouter = express.Router();

class BlogsController {
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

const blogsController = new BlogsController(
    blogsService,
    postsService,
    blogsQueryRepository,
    postsQueryRepository
)

blogsRouter.get('/:id', blogsController.getBlog.bind(blogsController))
blogsRouter.get('/', blogsController.getBlogs.bind(blogsController))
blogsRouter.get('/:blogId/posts', blogsController.getPostsSpecificBlog.bind(blogsController))
blogsRouter.post('/', basicAuthMiddleware, ...blogInputValidationMiddlewares, checkInputErrorsMiddleware, blogsController.createBlog.bind(blogsController))
blogsRouter.post('/:blogId/posts', basicAuthMiddleware, ...blogPostInputValidationMiddleware, checkInputErrorsMiddleware, blogsController.createPostForSpecificBlog.bind(blogsController))
blogsRouter.put('/:id', basicAuthMiddleware, ...blogInputValidationMiddlewares, checkInputErrorsMiddleware, blogsController.updateBlog.bind(blogsController))
blogsRouter.delete('/:id', basicAuthMiddleware, blogsController.deleteBlog.bind(blogsController))