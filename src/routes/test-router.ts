import express, { Request, Response } from "express";
import {blogsRepository} from "../repositories/blogs-in-memory-repository";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {postsRepository} from "../repositories/posts-in-memory-repository";

export const getTestingRouter = () => {
    const router = express.Router();

    router.delete('/', (req: Request, res: Response) => {
        blogsRepository.deleteAllData();
        postsRepository.deleteAllData();

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    })

    return router;
}