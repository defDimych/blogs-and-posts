import {body} from "express-validator";

export const passRecoveryInputValidation = [
    body("newPassword")
        .isString().withMessage('Invalid data type passed')
        .trim()
        .notEmpty().withMessage('Invalid password length')
        .isLength({min: 6, max: 20}).withMessage('Invalid password length'),

    body("recoveryCode")
        .isString()
        .trim()
        .notEmpty()
]