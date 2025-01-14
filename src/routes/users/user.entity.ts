import mongoose, {HydratedDocument, Model, model} from "mongoose";
import {AccountData, EmailConfirmation, PasswordRecovery, UserDbModel} from "../../types/users-types/UserDbModel";

type UserModel = Model<UserDbModel>

export type UserDocument = HydratedDocument<UserDbModel>

const AccountDataSchema = new mongoose.Schema<AccountData>({
    login: {type: String, required: true},
    email: {type: String, required: true},
    passwordHash: {type: String, required: true},
    createdAt: {type: String, required: true}
}, { _id: false });

const EmailConfirmationSchema = new mongoose.Schema<EmailConfirmation>({
    confirmationCode: {type: String, required: true},
    expirationDate: {type: Date, required: true},
    isConfirmed: {type: Boolean, required: true}
}, { _id: false });

const PasswordRecoverySchema = new mongoose.Schema<PasswordRecovery>({
    recoveryCode: {type: String, required: true},
    expirationDate: {type: Date, required: true}
}, { _id: false });

const UserSchema = new mongoose.Schema<UserDbModel>({
    accountData: {type: AccountDataSchema, required: true},
    emailConfirmation: {type: EmailConfirmationSchema, required: true},
    passwordRecovery: {type: PasswordRecoverySchema, required: true}
})

export const UserModel = model<UserDbModel, UserModel>("Users", UserSchema);