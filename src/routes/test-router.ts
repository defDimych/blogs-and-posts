import express, { Request, Response } from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {HTTP_STATUSES} from "../utils/http-statuses";

export const getTestingRouter = () => {
    const router = express.Router();

    router.delete('/', (req: Request, res: Response) => {
        blogsRepository.deleteAllData();

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    })

    return router;
}