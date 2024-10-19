import {body} from "express-validator";
import {postsRepository} from "../repositories/posts-repository";

export const postInputValidationMiddlewares = [
    body('name')
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
        .withMessage('Invalid length'),

    body('blogId').custom(inputBlogId => {
        const found = postsRepository.findPostByBlogId(inputBlogId);

        if (!found) {
            throw new Error("The blog doesn't exist");
        }
    })
];