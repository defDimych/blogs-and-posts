import {body} from "express-validator";

export const blogPostInputValidationMiddleware = [
    body('title')
        .isString()
        .withMessage('Invalid data type passed')
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('Invalid length'),

    body('shortDescription')
        .isString()
        .withMessage('Invalid data type passed')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Invalid length'),

    body('content')
        .isString()
        .withMessage('Invalid data type passed')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Invalid length')
];