import {body} from "express-validator";

export const likeStatusValidator = body("likeStatus")
    .custom(value => ["None", "Like", "Dislike"].includes(value))