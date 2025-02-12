import {EmailAdapter} from "../adapter/email-adapter";
import {inject, injectable} from "inversify";

@injectable()
export class EmailManager {
    constructor(@inject(EmailAdapter) private emailAdapter: EmailAdapter) {}

    async sendEmailForConfirmation(email: string, confirmationCode: string) {
        return this.emailAdapter.sendEmail(
            email,
            'Email confirmation',
            " <h1>Thanks for your registration</h1>\n" +
            " <p>To finish registration please follow the link below:\n" +
            `     <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>\n` +
            " </p>\n"
        )
    }

    async sendEmailForPasswordRecovery(email: string, recoveryCode: string) {
        return this.emailAdapter.sendEmail(
            email,
            'Password recovery',
            " <h1>Password recovery</h1>\n" +
            "       <p>To finish password recovery please follow the link below:\n" +
            `          <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>\n` +
            "      </p>\n" +
            "    "
        )
    }
}