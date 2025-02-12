import express from "express";
import {basicAuthMiddleware} from "../../middlewares/auth/basic-auth-middleware";
import {userInputValidationMiddleware} from "../../middlewares/validation/user-input-validation-middleware";
import {checkInputErrorsMiddleware} from "../../middlewares/check-input-errors-middleware";
import {container} from "../../composition-root";
import {UsersController} from "./users-controller";

const usersController = container.resolve(UsersController);

export const usersRouter = express.Router()

usersRouter.get('/', basicAuthMiddleware, usersController.getUsers.bind(usersController))
usersRouter.post('/', basicAuthMiddleware, ...userInputValidationMiddleware, checkInputErrorsMiddleware, usersController.createUser.bind(usersController))
usersRouter.delete('/:id', basicAuthMiddleware, usersController.deleteUser.bind(usersController))