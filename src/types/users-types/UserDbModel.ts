export type AccountData = {
    login: string;
    email: string;
    passwordHash: string;
    createdAt: string;
};

export type EmailConfirmation = {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
};

export type PasswordRecovery = {
    recoveryCode: string;
    expirationDate: Date;
};

export type UserDbModel = {
    accountData: AccountData,
    emailConfirmation: EmailConfirmation
    passwordRecovery: PasswordRecovery
};