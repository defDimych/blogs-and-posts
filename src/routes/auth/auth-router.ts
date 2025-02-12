import express from "express";
import {loginInputValidationMiddleware} from "../../middlewares/validation/login-input-validation-middleware";
import {checkInputErrorsMiddleware} from "../../middlewares/check-input-errors-middleware";
import {userInputValidationMiddleware} from "../../middlewares/validation/user-input-validation-middleware";
import {emailInputValidationMiddleware} from "../../middlewares/validation/email-input-validation-middleware";
import {refreshTokenValidator} from "../../middlewares/auth/refresh-token-validator";
import {accessTokenValidator} from "../../middlewares/auth/access-token-validator";
import {rateLimiter} from "../../middlewares/auth/rate-limiter";
import {passRecoveryInputValidation} from "../../middlewares/validation/pass-recovery-input-validation";
import {container} from "../../composition-root";
import {AuthController} from "./auth-controller";

const authController = container.resolve(AuthController)

export const authRouter = express.Router()

authRouter.get('/me',accessTokenValidator, authController.getInfoUser.bind(authController))
authRouter.post('/login',rateLimiter, ...loginInputValidationMiddleware, checkInputErrorsMiddleware, authController.login.bind(authController))
authRouter.post('/refresh-token',refreshTokenValidator, authController.refreshToken.bind(authController))
authRouter.post('/logout',refreshTokenValidator, authController.logout.bind(authController))
authRouter.post('/registration',rateLimiter, ...userInputValidationMiddleware, checkInputErrorsMiddleware, authController.registration.bind(authController))
authRouter.post('/registration-confirmation',rateLimiter, authController.registrationConfirmation.bind(authController))
authRouter.post('/password-recovery',rateLimiter, emailInputValidationMiddleware, checkInputErrorsMiddleware, authController.passwordRecovery.bind(authController))
authRouter.post('/new-password',rateLimiter, ...passRecoveryInputValidation, checkInputErrorsMiddleware, authController.passwordRecoveryConfirmation.bind(authController))
authRouter.post('/registration-email-resending',rateLimiter, emailInputValidationMiddleware, checkInputErrorsMiddleware, authController.registrationEmailResending.bind(authController))