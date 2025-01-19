import {CommentsService} from "../../domain/comments-service";
import {CommentsQueryRepository} from "../../repositories/query-repo/comments-query-repository";
import {RequestWithParams, RequestWithParamsAndBody} from "../../types/request-types";
import {Response} from "express";
import {DomainStatusCode, handleError} from "../../utils/object-result";
import {HTTP_STATUSES} from "../../utils/http-statuses";
import {CommentInputModel} from "../../types/comments-type/CommentInputModel";

export class CommentsController {
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