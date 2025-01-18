import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils/http-statuses";
import {basicAuthMiddleware} from "../../middlewares/auth/basic-auth-middleware";
import {checkInputErrorsMiddleware} from "../../middlewares/check-input-errors-middleware";
import {
    RequestWithBody,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../../types/request-types";
import {PostInputModel} from "../../types/posts-types/PostInputModel";
import {postInputValidationMiddlewares} from "../../middlewares/validation/post-input-validation-middlewares";
import {postsService} from "../../domain/posts-service";
import {PaginationQueryType} from "../../types/PaginationQueryType";
import {getDefaultPaginationOptions} from "../helpers/pagination-helper";
import {postsQueryRepository} from "../../repositories/query-repo/posts-query-repository";
import {commentInputValidationMiddleware} from "../../middlewares/validation/comment-input-validation-middleware";
import {CommentInputModel} from "../../types/comments-type/CommentInputModel";
import {DomainStatusCode, handleError} from "../../utils/object-result";
import {commentsQueryRepository} from "../../repositories/query-repo/comments-query-repository";
import {commentsService} from "../../domain/comments-service";
import {accessTokenValidator} from "../../middlewares/auth/access-token-validator";

export const postsRouter = express.Router()

class PostsController {
    async getPosts(req: RequestWithQuery<PaginationQueryType>, res: Response){
        const sorting: PaginationQueryType = req.query
        const receivedPosts = await postsQueryRepository.getAllPosts(getDefaultPaginationOptions(sorting))

        res.status(HTTP_STATUSES.SUCCESS_200).send(receivedPosts);
    }

    async getPost(req: Request, res: Response){
        const foundPost = await postsQueryRepository.findPostById(req.params.id);

        if (!foundPost) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return
        }
        res.status(HTTP_STATUSES.SUCCESS_200).send(foundPost);
    }

    async getCommentsSpecificPost(req: RequestWithParamsAndQuery<{postId: string}, PaginationQueryType>, res: Response){
        const result = await postsService.checkPost(req.params.postId);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status));
            return
        }

        const receivedComments =
            await commentsQueryRepository.getAllComments(getDefaultPaginationOptions(req.query), req.params.postId);

        res.status(HTTP_STATUSES.SUCCESS_200).send(receivedComments);
    }

    async createPost(req: RequestWithBody<PostInputModel>, res: Response){
        const createdPostId = await postsService.createPost(req.body);
        const createdPost = await postsQueryRepository.findPostById(createdPostId)

        if (!createdPost) return;

        res.status(HTTP_STATUSES.CREATED_201).send(createdPost);
    }

    async createCommentForPost(req: RequestWithParamsAndBody<{ postId: string }, CommentInputModel>, res: Response){
        const result = await commentsService.createComment(req.params.postId, req.body.content, req.userId!);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status));
            return
        }
        const createdComment = await commentsQueryRepository.findCommentById(result.data!);

        res.status(HTTP_STATUSES.CREATED_201).send(createdComment);
    }

    async updatePost(req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res: Response){
        const isUpdated = await postsService.updatePost(req.params.id, req.body);

        if (isUpdated) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
            return
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    }

    async deletePost(req: Request, res: Response){
        const isDeleted = await postsService.deletePost(req.params.id);

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    }
}

const postsController = new PostsController()

postsRouter.get('/', postsController.getPosts)
postsRouter.get('/:id', postsController.getPost)
postsRouter.get('/:postId/comments', postsController.getCommentsSpecificPost)
postsRouter.post('/', basicAuthMiddleware, ...postInputValidationMiddlewares, checkInputErrorsMiddleware, postsController.createPost)
postsRouter.post('/:postId/comments',accessTokenValidator, commentInputValidationMiddleware, checkInputErrorsMiddleware, postsController.createCommentForPost)
postsRouter.put('/:id', basicAuthMiddleware, ...postInputValidationMiddlewares, checkInputErrorsMiddleware, postsController.updatePost)
postsRouter.delete('/:id', basicAuthMiddleware, postsController.deletePost)