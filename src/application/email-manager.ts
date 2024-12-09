import {emailAdapter} from "../adapter/email-adapter";

export const emailManager = {
    async sendEmailForConfirmation(email: string, confirmationCode: string) {
        return await emailAdapter.sendEmail(
            email,
            'Email confirmation',
            " <h1>Thanks for your registration</h1>\n" +
            " <p>To finish registration please follow the link below:\n" +
            `     <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>\n` +
            " </p>\n"
        )
    }
}