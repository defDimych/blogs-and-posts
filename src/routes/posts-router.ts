import express, { Request, Response } from "express";
import {postsRepository} from "../repositories/posts-repository";
import {PostViewModel} from "../types/posts-types/PostViewModel";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {basicAuthMiddleware} from "../middlewares/auth/basic-auth-middleware";
import {checkInputErrorsMiddleware} from "../middlewares/check-input-errors-middleware";
import {RequestWithBody, RequestWithParamsAndBody} from "../types/request-types";
import {PostInputModel} from "../types/posts-types/PostInputModel";
import {postInputValidationMiddlewares} from "../middlewares/post-input-validation-middlewares";

export const getPostsRouter = () => {
    const router = express.Router();

    router.get('/', (req: Request, res: Response) => {
        const allPosts: PostViewModel[] = postsRepository.getAllPosts();

        res.status(HTTP_STATUSES.SUCCESS_200).send(allPosts);
    })
    router.post('/', basicAuthMiddleware, ...postInputValidationMiddlewares, checkInputErrorsMiddleware,
        (req: RequestWithBody<PostInputModel>, res: Response) => {
            const createdPost = postsRepository.createPost(req.body);

            res.status(HTTP_STATUSES.CREATED_201).send(createdPost);
        })
    router.get('/:id', (req: Request, res: Response) => {
        const foundPost = postsRepository.findPostById(req.params.id);

        if (!foundPost) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return
        }
        res.status(HTTP_STATUSES.SUCCESS_200).send(foundPost);
    })
    router.put('/:id', basicAuthMiddleware, ...postInputValidationMiddlewares, checkInputErrorsMiddleware,
        (req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res: Response) => {
            const isUpdated = postsRepository.updatePost(req.params.id, req.body);

            if (isUpdated) {
                res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
            } else {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            }
        })
    router.delete('/:id', basicAuthMiddleware, (req: Request, res: Response) => {
        const isDeleted = postsRepository.deletePost(req.params.id);

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    })

    return router;
}