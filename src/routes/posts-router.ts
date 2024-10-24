import express, { Request, Response } from "express";
import {PostViewModel} from "../types/posts-types/PostViewModel";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {basicAuthMiddleware} from "../middlewares/auth/basic-auth-middleware";
import {checkInputErrorsMiddleware} from "../middlewares/check-input-errors-middleware";
import {RequestWithBody, RequestWithParamsAndBody} from "../types/request-types";
import {PostInputModel} from "../types/posts-types/PostInputModel";
import {postInputValidationMiddlewares} from "../middlewares/post-input-validation-middlewares";
import {postsRepository} from "../repositories/posts-db-repository";

export const getPostsRouter = () => {
    const router = express.Router();

    router.get('/', async (req: Request, res: Response) => {
        const allPosts: PostViewModel[] = await postsRepository.getAllPosts();

        res.status(HTTP_STATUSES.SUCCESS_200).send(allPosts);
    })
    router.post('/', basicAuthMiddleware, ...postInputValidationMiddlewares, checkInputErrorsMiddleware,
        async (req: RequestWithBody<PostInputModel>, res: Response) => {
            const createdPost = await postsRepository.createPost(req.body);

            res.status(HTTP_STATUSES.CREATED_201).send(createdPost);
        })
    router.get('/:id', async (req: Request, res: Response) => {
        const foundPost = await postsRepository.findPostById(req.params.id);

        if (!foundPost) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return
        }
        res.status(HTTP_STATUSES.SUCCESS_200).send(foundPost);
    })
    router.put('/:id', basicAuthMiddleware, ...postInputValidationMiddlewares, checkInputErrorsMiddleware,
        async (req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res: Response) => {
            const isUpdated = await postsRepository.updatePost(req.params.id, req.body);

            if (isUpdated) {
                res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
            } else {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            }
        })
    router.delete('/:id', basicAuthMiddleware, async (req: Request, res: Response) => {
        const isDeleted = await postsRepository.deletePost(req.params.id);

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    })

    return router;
}