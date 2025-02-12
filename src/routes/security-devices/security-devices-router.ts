import express from "express";
import {refreshTokenValidator} from "../../middlewares/auth/refresh-token-validator";
import {container} from "../../composition-root";
import {SecurityDevicesController} from "./security-devices-controller";

const securityDevicesController = container.resolve(SecurityDevicesController)

export const securityDevicesRouter = express.Router()

securityDevicesRouter.get('/',refreshTokenValidator, securityDevicesController.getActiveSessions.bind(securityDevicesController))
securityDevicesRouter.delete('/',refreshTokenValidator, securityDevicesController.deleteSessionsExcludingCurrentOne.bind(securityDevicesController))
securityDevicesRouter.delete('/:deviceId',refreshTokenValidator, securityDevicesController.deleteSpecificSession.bind(securityDevicesController))