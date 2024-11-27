import express, {Response} from "express";
import {authentication} from "../middlewares/auth/authentication ";
import {commentInputValidationMiddleware} from "../middlewares/validation/comment-input-validation-middleware";
import {RequestWithParams, RequestWithParamsAndBody} from "../types/request-types";
import {CommentInputModel} from "../types/comments-type/CommentInputModel";
import {commentsService} from "../domain/comments-service";
import {DomainStatusCode, handleError} from "../utils/object-result";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {commentsQueryRepository} from "../repositories/query-repo/comments-query-repository";
import {checkInputErrorsMiddleware} from "../middlewares/check-input-errors-middleware";

export const getCommentsRouter = () => {
    const router = express.Router();

    router.get('/:commentId', async (req: RequestWithParams<{ commentId: string }>, res: Response) => {
        const result = await commentsService.checkComment(req.params.commentId);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status));
            return
        }

        const comment = await commentsQueryRepository.findCommentById(req.params.commentId);

        res.status(HTTP_STATUSES.SUCCESS_200).send(comment);
    })
    router.put('/:commentId', authentication, commentInputValidationMiddleware, checkInputErrorsMiddleware,
        async (req: RequestWithParamsAndBody<{ commentId: string }, CommentInputModel>, res: Response) => {
            const result = await commentsService.updateComment(req.userId!, req.params.commentId, req.body.content);

            if (result.status !== DomainStatusCode.Success) {
                res.sendStatus(handleError(result.status));
                return;
            }
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        })
    router.delete('/:commentId', authentication, async (req: RequestWithParams<{ commentId: string }>, res: Response) => {
        const result = await commentsService.deleteComment(req.userId!, req.params.commentId);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status));
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    })

    return router
}