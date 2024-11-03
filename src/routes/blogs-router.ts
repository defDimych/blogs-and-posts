import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {BlogInputModel} from "../types/blogs-types/BlogInputModel";
import {blogInputValidationMiddlewares} from "../middlewares/blog-input-validation-middlewares";
import {basicAuthMiddleware} from "../middlewares/auth/basic-auth-middleware";
import {checkInputErrorsMiddleware} from "../middlewares/check-input-errors-middleware";
import {blogsService} from "../domain/blogs-service";
import {postInputValidationMiddlewares} from "../middlewares/post-input-validation-middlewares";
import {RequestWithParamsAndBody, RequestWithQuery} from "../types/request-types";
import {BlogPostInputModel} from "../types/posts-types/BlogPostInputModel";
import {postsService} from "../domain/posts-service";
import {blogsRepository} from "../repositories/blogs-db-repository";
import {TPaginationOptions} from "../types/TPaginationOptions";

export const getBlogsRouter = () => {
    const router = express.Router();

    router.get('/', async (req: RequestWithQuery<TPaginationOptions>, res: Response) => {
        const receivedBlogs = await blogsRepository.getAllBlogs(req.query);

        res.status(HTTP_STATUSES.SUCCESS_200).send(receivedBlogs);
    })
    router.post('/', basicAuthMiddleware, ...blogInputValidationMiddlewares, checkInputErrorsMiddleware,
        async (req: Request<any, any, BlogInputModel>, res: Response) => {
            const createdBlog = await blogsService.createBlog(req.body);
            res.status(HTTP_STATUSES.CREATED_201).send(createdBlog);
        })
    router.post('/:blogId/posts', basicAuthMiddleware, ...postInputValidationMiddlewares, checkInputErrorsMiddleware,
        async (req: RequestWithParamsAndBody<{ blogId: string }, BlogPostInputModel>, res: Response) => {
        // TODO: Спросить!!!
            const foundBlog = blogsRepository.findBlogById(req.params.blogId);

            if (!foundBlog) {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
                return
            }

            const createdPost = await postsService.createPost({ ...req.body, blogId: req.params.blogId });

            res.status(HTTP_STATUSES.CREATED_201).send(createdPost);
        })
    router.get('/:id', async (req: Request, res: Response) => {
        const foundBlog = await blogsService.findBlogById(req.params.id);

        if (!foundBlog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return
        }
        res.status(HTTP_STATUSES.SUCCESS_200).send(foundBlog);
    })
    router.put('/:id', basicAuthMiddleware, ...blogInputValidationMiddlewares, checkInputErrorsMiddleware,
        async (req: Request<any, any, BlogInputModel>, res: Response) => {
            const isUpdated = await blogsService.updateBlog(req.params.id, req.body);

            if (isUpdated) {
                res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
            } else {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            }
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