import express, {Response} from "express";
import {commentInputValidationMiddleware} from "../../middlewares/validation/comment-input-validation-middleware";
import {RequestWithParams, RequestWithParamsAndBody} from "../../types/request-types";
import {CommentInputModel} from "../../types/comments-type/CommentInputModel";
import {CommentsService, commentsService} from "../../domain/comments-service";
import {DomainStatusCode, handleError} from "../../utils/object-result";
import {HTTP_STATUSES} from "../../utils/http-statuses";
import {
    CommentsQueryRepository,
    commentsQueryRepository
} from "../../repositories/query-repo/comments-query-repository";
import {checkInputErrorsMiddleware} from "../../middlewares/check-input-errors-middleware";
import {accessTokenValidator} from "../../middlewares/auth/access-token-validator";

export const commentsRouter = express.Router()

class CommentsController {
    constructor(private commentsService: CommentsService,
                private commentsQueryRepository: CommentsQueryRepository) {}

    async getComment(req: RequestWithParams<{ commentId: string }>, res: Response){
        const result = await this.commentsService.checkComment(req.params.commentId);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status));
            return
        }

        const comment = await this.commentsQueryRepository.findCommentById(req.params.commentId);

        res.status(HTTP_STATUSES.SUCCESS_200).send(comment);
    }

    async updateComment(req: RequestWithParamsAndBody<{ commentId: string }, CommentInputModel>, res: Response){
        const result = await this.commentsService.updateComment(req.userId!, req.params.commentId, req.body.content);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status));
            return;
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }

    async deleteComment(req: RequestWithParams<{ commentId: string }>, res: Response){
        const result = await this.commentsService.deleteComment(req.userId!, req.params.commentId);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status));
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }
}

const commentsController = new CommentsController(commentsService, commentsQueryRepository)

commentsRouter.get('/:commentId', commentsController.getComment.bind(commentsController))
commentsRouter.put('/:commentId',accessTokenValidator, commentInputValidationMiddleware, checkInputErrorsMiddleware, commentsController.updateComment.bind(commentsController))
commentsRouter.delete('/:commentId',accessTokenValidator, commentsController.deleteComment.bind(commentsController))