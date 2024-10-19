import express, { Request, Response } from "express";
import {postsRepository} from "../repositories/posts-repository";
import {PostViewModel} from "../types/posts-types/PostViewModel";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {basicAuthMiddleware} from "../middlewares/auth/basic-auth-middleware";
import {checkInputErrorsMiddleware} from "../middlewares/check-input-errors-middleware";
import {RequestWithBody} from "../types/request-types";
import {PostInputModel} from "../types/posts-types/PostInputModel";

export const getPostsRouter = () => {
    const router = express.Router();

    router.get('/', (req: Request, res: Response) => {
        const allPosts: PostViewModel[] = postsRepository.getAllPosts();

        res.status(HTTP_STATUSES.SUCCESS_200).send(allPosts);
    })
    router.post('/', basicAuthMiddleware, checkInputErrorsMiddleware,
        (req: RequestWithBody<PostInputModel>, res: Response) => {
        const createdPost = postsRepository.createPost(req.body);

        res.status(HTTP_STATUSES.SUCCESS_200).send(createdPost);
        })

    return router;
}