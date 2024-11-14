import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {basicAuthMiddleware} from "../middlewares/auth/basic-auth-middleware";
import {checkInputErrorsMiddleware} from "../middlewares/check-input-errors-middleware";
import {RequestWithBody, RequestWithParamsAndBody, RequestWithQuery} from "../types/request-types";
import {PostInputModel} from "../types/posts-types/PostInputModel";
import {postInputValidationMiddlewares} from "../middlewares/post-input-validation-middlewares";
import {postsService} from "../domain/posts-service";
import {PaginationQueryType} from "../types/PaginationQueryType";
import {getDefaultPaginationOptions} from "./helpers/pagination-helper";
import {postsQueryRepository} from "../repositories/query-repo/posts-query-repository";

export const getPostsRouter = () => {
    const router = express.Router();

    router.get('/', async (req: RequestWithQuery<PaginationQueryType>, res: Response) => {
        const sorting:PaginationQueryType = req.query
        const receivedPosts = await postsQueryRepository.getAllPosts(getDefaultPaginationOptions(sorting))

        res.status(HTTP_STATUSES.SUCCESS_200).send(receivedPosts);
    })
    router.post('/', basicAuthMiddleware, ...postInputValidationMiddlewares, checkInputErrorsMiddleware,
        async (req: RequestWithBody<PostInputModel>, res: Response) => {
            const createdPostId = await postsService.createPost(req.body);
            const createdPost = await postsQueryRepository.findPostById(createdPostId)

            if (!createdPost) return;

            res.status(HTTP_STATUSES.CREATED_201).send(createdPost);
        })
    router.get('/:id', async (req: Request, res: Response) => {
        const foundPost = await postsQueryRepository.findPostById(req.params.id);

        if (!foundPost) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return
        }
        res.status(HTTP_STATUSES.SUCCESS_200).send(foundPost);
    })
    router.put('/:id', basicAuthMiddleware, ...postInputValidationMiddlewares, checkInputErrorsMiddleware,
        async (req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res: Response) => {
            const isUpdated = await postsService.updatePost(req.params.id, req.body);

            if (isUpdated) {
                res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
                return
            } else {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            }
        })
    router.delete('/:id', basicAuthMiddleware, async (req: Request, res: Response) => {
        const isDeleted = await postsService.deletePost(req.params.id);

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    })

    return router;
}