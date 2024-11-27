import {body} from "express-validator";

export const commentInputValidationMiddleware =
    body('content')
        .isString()
        .withMessage('Invalid data type passed')
        .trim()
        .notEmpty()
        .isLength({min: 20, max: 300})