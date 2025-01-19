import express from "express";
import {refreshTokenValidator} from "../../middlewares/auth/refresh-token-validator";
import {securityDevicesController} from "../../composition-root";

export const securityDevicesRouter = express.Router()

securityDevicesRouter.get('/',refreshTokenValidator, securityDevicesController.getActiveSessions.bind(securityDevicesController))
securityDevicesRouter.delete('/',refreshTokenValidator, securityDevicesController.deleteSessionsExcludingCurrentOne.bind(securityDevicesController))
securityDevicesRouter.delete('/:deviceId',refreshTokenValidator, securityDevicesController.deleteSpecificSession.bind(securityDevicesController))