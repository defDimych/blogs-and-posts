import mongoose, {HydratedDocument, Model, model} from "mongoose";
import {SessionDbModel} from "../../types/auth-types/SessionDbModel";

type SessionModel = Model<SessionDbModel>

export type SessionDocument = HydratedDocument<SessionDbModel>

const sessionSchema = new mongoose.Schema<SessionDbModel>({
    IP: {type: String, required: true},
    exp: {type: Number, required: true},
    iat: {type: Number, required: true},
    userId: {type: String, required: true},
    deviceId: {type: String, required: true},
    deviceName: {type: String, required: true},
})

export const SessionModel = model<SessionDbModel, SessionModel>("Active-sessions", sessionSchema);