import express from "express";
import {basicAuthMiddleware} from "../../middlewares/auth/basic-auth-middleware";
import {checkInputErrorsMiddleware} from "../../middlewares/check-input-errors-middleware";
import {postInputValidationMiddlewares} from "../../middlewares/validation/post-input-validation-middlewares";
import {commentInputValidationMiddleware} from "../../middlewares/validation/comment-input-validation-middleware";
import {accessTokenValidator} from "../../middlewares/auth/access-token-validator";
import {userAuthentication} from "../../middlewares/auth/user-authentication";
import {container} from "../../composition-root";
import {PostsController} from "./posts-controller";
import {likeStatusValidator} from "../../middlewares/validation/like-status-validator";

const postsController = container.resolve(PostsController)

export const postsRouter = express.Router()

postsRouter.get('/', userAuthentication, postsController.getPosts.bind(postsController))
postsRouter.get('/:id', userAuthentication, postsController.getPost.bind(postsController))
postsRouter.get('/:postId/comments', userAuthentication, postsController.getCommentsSpecificPost.bind(postsController))
postsRouter.post('/', basicAuthMiddleware, ...postInputValidationMiddlewares, checkInputErrorsMiddleware, postsController.createPost.bind(postsController))
postsRouter.post('/:postId/comments',accessTokenValidator, commentInputValidationMiddleware, checkInputErrorsMiddleware, postsController.createCommentForPost.bind(postsController))
postsRouter.put('/:postId/like-status', accessTokenValidator, likeStatusValidator, checkInputErrorsMiddleware, postsController.updateLikeStatus.bind(postsController))
postsRouter.put('/:id', basicAuthMiddleware, ...postInputValidationMiddlewares, checkInputErrorsMiddleware, postsController.updatePost.bind(postsController))
postsRouter.delete('/:id', basicAuthMiddleware, postsController.deletePost.bind(postsController))