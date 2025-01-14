import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils/http-statuses";
import {BlogInputModel} from "../../types/blogs-types/BlogInputModel";
import {blogInputValidationMiddlewares} from "../../middlewares/validation/blog-input-validation-middlewares";
import {basicAuthMiddleware} from "../../middlewares/auth/basic-auth-middleware";
import {checkInputErrorsMiddleware} from "../../middlewares/check-input-errors-middleware";
import {blogsService} from "../../domain/blogs-service";
import {RequestWithParamsAndBody, RequestWithParamsAndQuery, RequestWithQuery} from "../../types/request-types";
import {BlogPostInputModel} from "../../types/posts-types/BlogPostInputModel";
import {postsService} from "../../domain/posts-service";
import {PaginationQueryType} from "../../types/PaginationQueryType";
import {getDefaultPaginationOptions} from "../helpers/pagination-helper";
import {blogPostInputValidationMiddleware} from "../../middlewares/validation/blog-post-input-validation-middleware";
import {blogsQueryRepository} from "../../repositories/query-repo/blogs-query-repository";
import {postsQueryRepository} from "../../repositories/query-repo/posts-query-repository";
import {DomainStatusCode, handleError} from "../../utils/object-result";

export const getBlogsRouter = () => {
    const router = express.Router();

    router.get('/', async (req: RequestWithQuery<PaginationQueryType>, res: Response) => {
        const receivedBlogs = await blogsQueryRepository.getAllBlogs(getDefaultPaginationOptions(req.query));

        res.status(HTTP_STATUSES.SUCCESS_200).send(receivedBlogs);
    })
    router.get('/:blogId/posts', async (req: RequestWithParamsAndQuery<{ blogId: string}, PaginationQueryType>, res: Response) => {
        const foundBlog = await blogsQueryRepository.findBlogById(req.params.blogId);

        if (!foundBlog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return
        }

        const receivedPosts = await postsQueryRepository.getAllPostsByBlogId(getDefaultPaginationOptions(req.query), foundBlog.id)

        res.status(HTTP_STATUSES.SUCCESS_200).send(receivedPosts);
    })
    router.post('/', basicAuthMiddleware, ...blogInputValidationMiddlewares, checkInputErrorsMiddleware,
        async (req: Request<any, any, BlogInputModel>, res: Response) => {
            const createdBlogId = await blogsService.createBlog(req.body);
            const createdBlog = await blogsQueryRepository.findBlogByIdOrThrow(createdBlogId)

            res.status(HTTP_STATUSES.CREATED_201).send(createdBlog);
        })
    router.post('/:blogId/posts', basicAuthMiddleware, ...blogPostInputValidationMiddleware, checkInputErrorsMiddleware,
        async (req: RequestWithParamsAndBody<{ blogId: string }, BlogPostInputModel>, res: Response) => {
            const foundBlog = await blogsQueryRepository.findBlogById(req.params.blogId);

            if (!foundBlog) {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
                return
            }

            const createdPostId = await postsService.createPost({ ...req.body, blogId: req.params.blogId });
            const createdPost = await postsQueryRepository.findPostById(createdPostId);

            if (!createdPost) return;

            res.status(HTTP_STATUSES.CREATED_201).send(createdPost);
        })
    router.get('/:id', async (req: Request, res: Response) => {
        const foundBlog = await blogsQueryRepository.findBlogById(req.params.id);

        if (!foundBlog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return
        }
        res.status(HTTP_STATUSES.SUCCESS_200).send(foundBlog);
    })
    router.put('/:id', basicAuthMiddleware, ...blogInputValidationMiddlewares, checkInputErrorsMiddleware,
        async (req: Request<any, any, BlogInputModel>, res: Response) => {
            const result = await blogsService.updateBlog(req.params.id, req.body);

            if (result.status !== DomainStatusCode.Success) {
                res.sendStatus(handleError(result.status))
                return
            }
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        })
    router.delete('/:id', basicAuthMiddleware, async (req: Request, res: Response) => {
        const isDeleted = await blogsService.deleteBlog(req.params.id);

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    })

    return router;
}