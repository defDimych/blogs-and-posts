import {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";
import {HTTP_STATUSES} from "../utils/http-statuses";
import {ErrorsViewModel} from "../types/ErrorsViewModel";


export const checkInputErrorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    const errors = result.array({ onlyFirstError: true });

    if (result.isEmpty()) {
        next()
    } else {
        const outputErrors: ErrorsViewModel = {
            errorsMessages: errors.map(err => {
                return {
                    message: err.msg,
                    field: (err as any).path
                }
            })
        }
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json(outputErrors);
    }
}