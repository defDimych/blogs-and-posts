import {body} from "express-validator";
import {container} from "../../composition-root";
import {BlogsQueryRepository} from "../../repositories/query-repo/blogs-query-repository";

const blogsQueryRepository = container.resolve(BlogsQueryRepository)

export const postInputValidationMiddlewares = [
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
        .withMessage('Invalid length'),

    body('blogId').custom(async blogId => {
        const foundBlog = await blogsQueryRepository.findBlogById(blogId);

        if (!foundBlog) {
            throw new Error("The blog doesn't exist");
        }
        return true;
    })
];