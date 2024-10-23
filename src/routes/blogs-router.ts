import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {BlogInputModel} from "../types/blogs-types/BlogInputModel";
import {blogInputValidationMiddlewares} from "../middlewares/blog-input-validation-middlewares";
import {basicAuthMiddleware} from "../middlewares/auth/basic-auth-middleware";
import {checkInputErrorsMiddleware} from "../middlewares/check-input-errors-middleware";
import {blogsRepository} from "../repositories/blogs-db-repository";

export const getBlogsRouter = () => {
    const router = express.Router();

    router.get('/', async (req: Request, res: Response) => {
        const allBlogs = await blogsRepository.getAllBlogs();

        res.status(HTTP_STATUSES.SUCCESS_200).send(allBlogs);
    })
    router.post('/', basicAuthMiddleware, ...blogInputValidationMiddlewares, checkInputErrorsMiddleware,
        async (req: Request<any, any, BlogInputModel>, res: Response) => {
            const createdBlog = await blogsRepository.createBlog(req.body.name, req.body.description, req.body.websiteUrl);
            res.status(HTTP_STATUSES.CREATED_201).send(createdBlog);
        })
    router.get('/:id', async (req: Request, res: Response) => {
        const foundBlog = await blogsRepository.findBlogById(req.params.id);

        if (!foundBlog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return
        }
        res.status(HTTP_STATUSES.SUCCESS_200).send(foundBlog);
    })
    router.put('/:id', basicAuthMiddleware, ...blogInputValidationMiddlewares, checkInputErrorsMiddleware,
        async (req: Request<any, any, BlogInputModel>, res: Response) => {
            const isUpdated = await blogsRepository.updateBlog(req.params.id, req.body);

            if (isUpdated) {
                res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
            } else {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            }
        })
    router.delete('/:id', basicAuthMiddleware, async (req: Request, res: Response) => {
        const isDeleted = await blogsRepository.deleteBlog(req.params.id);

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    })

    return router;
}