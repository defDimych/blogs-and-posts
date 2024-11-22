import express, {Response} from "express";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {blogsCollection, commentsCollection, postsCollection, usersCollection} from "../repositories/db";

export const getTestingRouter = () => {
    const router = express.Router();

    router.delete('/', async (res: Response) => {
        await blogsCollection.drop();
        await postsCollection.drop();
        await usersCollection.drop();
        await commentsCollection.drop();

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    })

    return router;
}