import {body} from "express-validator";

export const loginInputValidationMiddleware = [
    body("loginOrEmail")
        .isString()
        .withMessage('Invalid data type passed')
        .trim()
        .notEmpty(),

    body("password")
        .isString()
        .withMessage('Invalid data type passed')
        .trim()
        .notEmpty()
];