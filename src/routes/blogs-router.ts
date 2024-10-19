import express, {Request, Response} from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {BlogInputModel} from "../types/blogs-types/BlogInputModel";
import {blogInputValidationMiddlewares} from "../middlewares/blog-input-validation-middlewares";
import {basicAuthMiddleware} from "../middlewares/auth/basic-auth-middleware";
import {checkInputErrorsMiddleware} from "../middlewares/check-input-errors-middleware";

export const getBlogsRouter = () => {
    const router = express.Router();

    router.get('/', (req: Request, res: Response) => {
        const allBlogs = blogsRepository.getAllBlogs();

        res.status(HTTP_STATUSES.SUCCESS_200).send(allBlogs);
    })
    router.post('/',
        basicAuthMiddleware,
        ...blogInputValidationMiddlewares,
        checkInputErrorsMiddleware,
        (req: Request<any, any, BlogInputModel>, res: Response) => {
        const createdBlog = blogsRepository.createBlog(req.body.name, req.body.description, req.body.websiteUrl);
        res.status(HTTP_STATUSES.CREATED_201).send(createdBlog);
        })
    router.get('/:id', (req: Request, res: Response) => {
        const foundBlog = blogsRepository.findBlogById(req.params.id);

        if (!foundBlog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return
        }
        res.status(HTTP_STATUSES.SUCCESS_200).send(foundBlog);
    })
    router.put('/:id',
        basicAuthMiddleware,
        ...blogInputValidationMiddlewares,
        checkInputErrorsMiddleware,
        (req: Request<any, any, BlogInputModel>, res: Response) => {
        const isUpdated = blogsRepository.updateBlog(req.params.id, req.body);

        if (isUpdated) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    })
    router.delete('/:id', basicAuthMiddleware, (req: Request, res: Response) => {
        const isDeleted = blogsRepository.deleteBlog(req.params.id);

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    })

    return router;
}