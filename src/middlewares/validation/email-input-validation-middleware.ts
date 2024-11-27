import {body} from "express-validator";

export const emailInputValidationMiddleware = body("email")
    .isString()
    .withMessage('Invalid data type passed')
    .trim()
    .notEmpty()
    .withMessage('Invalid length')
    .matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
    .withMessage('Invalid format')