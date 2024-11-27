import {body} from "express-validator";

export const userInputValidationMiddleware = [
    body("login")
        .isString()
        .withMessage('Invalid data type passed')
        .trim()
        .notEmpty()
        .isLength({ min: 3, max: 10 })
        .withMessage('Invalid length')
        .matches('^[a-zA-Z0-9_-]*$')
        .withMessage('Invalid format'),

    body("password")
        .isString()
        .withMessage('Invalid data type passed')
        .trim()
        .notEmpty()
        .isLength({ min: 6, max: 20 })
        .withMessage('Invalid length'),

    body("email")
        .isString()
        .withMessage('Invalid data type passed')
        .trim()
        .notEmpty()
        .withMessage('Invalid length')
        .matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
        .withMessage('Invalid format')
];