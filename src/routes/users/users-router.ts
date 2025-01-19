import express from "express";
import {basicAuthMiddleware} from "../../middlewares/auth/basic-auth-middleware";
import {userInputValidationMiddleware} from "../../middlewares/validation/user-input-validation-middleware";
import {checkInputErrorsMiddleware} from "../../middlewares/check-input-errors-middleware";
import {usersController} from "../../composition-root";

export const usersRouter = express.Router()

usersRouter.get('/', basicAuthMiddleware, usersController.getUsers.bind(usersController))
usersRouter.post('/', basicAuthMiddleware, ...userInputValidationMiddleware, checkInputErrorsMiddleware, usersController.createUser.bind(usersController))
usersRouter.delete('/:id', basicAuthMiddleware, usersController.deleteUser.bind(usersController))