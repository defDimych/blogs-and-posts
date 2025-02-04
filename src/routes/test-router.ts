import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {BlogModel} from "./blogs/blog.entity";
import {PostModel} from "./posts/post.entity";
import {UserModel} from "./users/user.entity";
import {CommentModel} from "./comments/comment.entity";
import {SessionModel} from "./auth/session.entity";
import {RequestMetaModel} from "./auth/request-meta.entity";
import {LikeModel} from "./comments/like.entity";

export const getTestingRouter = () => {
    const router = express.Router();

    router.delete('/', async (req: Request, res: Response) => {
        await BlogModel.collection.drop();
        await PostModel.collection.drop();
        await UserModel.collection.drop();
        await CommentModel.collection.drop();
        await SessionModel.collection.drop();
        await RequestMetaModel.collection.drop();
        await LikeModel.collection.drop();

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    })

    return router;
}