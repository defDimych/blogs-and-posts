import express, { Request, Response } from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {postsRepository} from "../repositories/posts-repository";

export const getTestingRouter = () => {
    const router = express.Router();

    router.delete('/', (req: Request, res: Response) => {
        blogsRepository.deleteAllData();
        postsRepository.deleteAllData();

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    })

    return router;
}