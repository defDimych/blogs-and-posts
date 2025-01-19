import express from "express";
import {blogInputValidationMiddlewares} from "../../middlewares/validation/blog-input-validation-middlewares";
import {basicAuthMiddleware} from "../../middlewares/auth/basic-auth-middleware";
import {checkInputErrorsMiddleware} from "../../middlewares/check-input-errors-middleware";
import {blogPostInputValidationMiddleware} from "../../middlewares/validation/blog-post-input-validation-middleware";
import {blogsController} from "../../composition-root";

export const blogsRouter = express.Router();

blogsRouter.get('/:id', blogsController.getBlog.bind(blogsController))
blogsRouter.get('/', blogsController.getBlogs.bind(blogsController))
blogsRouter.get('/:blogId/posts', blogsController.getPostsSpecificBlog.bind(blogsController))
blogsRouter.post('/', basicAuthMiddleware, ...blogInputValidationMiddlewares, checkInputErrorsMiddleware, blogsController.createBlog.bind(blogsController))
blogsRouter.post('/:blogId/posts', basicAuthMiddleware, ...blogPostInputValidationMiddleware, checkInputErrorsMiddleware, blogsController.createPostForSpecificBlog.bind(blogsController))
blogsRouter.put('/:id', basicAuthMiddleware, ...blogInputValidationMiddlewares, checkInputErrorsMiddleware, blogsController.updateBlog.bind(blogsController))
blogsRouter.delete('/:id', basicAuthMiddleware, blogsController.deleteBlog.bind(blogsController))