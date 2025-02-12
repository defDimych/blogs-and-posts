import nodemailer from 'nodemailer'
import {injectable} from "inversify";

@injectable()
export class EmailAdapter {
    async sendEmail(email: string, subject: string, html: string) {
        const transport = nodemailer.createTransport({
            service: "Gmail",
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
                user: "aowebst10@gmail.com",
                pass: 'ueiz enbt locj fbdy',
            },
        });

        try {
            await transport.sendMail({
                from: '"blogs-and-posts app" <aowebst10@gmail.com>', // sender address
                to: email, // list of receivers
                subject, // Subject line
                html, // html body
            });
            return true;

        } catch (e) {
            console.log(e);
            return false;
        }
    }
}