import express from "express";
import {commentInputValidationMiddleware} from "../../middlewares/validation/comment-input-validation-middleware";
import {checkInputErrorsMiddleware} from "../../middlewares/check-input-errors-middleware";
import {accessTokenValidator} from "../../middlewares/auth/access-token-validator";
import {likeStatusValidator} from "../../middlewares/validation/like-status-validator";
import {userAuthentication} from "../../middlewares/auth/user-authentication";
import {container} from "../../composition-root";
import {CommentsController} from "./comments-controller";

const commentsController = container.resolve(CommentsController)

export const commentsRouter = express.Router()

commentsRouter.get('/:commentId', userAuthentication, commentsController.getComment.bind(commentsController))
commentsRouter.put('/:commentId',accessTokenValidator, commentInputValidationMiddleware, checkInputErrorsMiddleware, commentsController.updateComment.bind(commentsController))
commentsRouter.put('/:commentId/like-status', accessTokenValidator, likeStatusValidator, checkInputErrorsMiddleware, commentsController.updateLikeStatus.bind(commentsController))
commentsRouter.delete('/:commentId',accessTokenValidator, commentsController.deleteComment.bind(commentsController))