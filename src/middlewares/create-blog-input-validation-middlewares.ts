import {body} from "express-validator";

export const createBlogInputValidationMiddlewares = [
    body('name')
        .isString()
        .withMessage('Invalid data type passed')
        .trim()
        .isLength({ min: 1, max: 15 })
        .withMessage('Invalid length'),

    body("description")
        .isString()
        .withMessage('Invalid data type passed')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Invalid length'),

    body("websiteUrl")
        .isString()
        .withMessage('Invalid data type passed')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Invalid length')
        .matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$')
        .withMessage('Invalid format')
];