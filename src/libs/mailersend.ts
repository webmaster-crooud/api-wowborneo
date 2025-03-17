import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { env } from '../configs/env';
import logger from './logger';

interface SendEmailInterface {
    email: string;
    firstName: string;
    lastName: string;
    subject: string;
    content: string;
}

export async function sendEmail({
    email,
    firstName,
    lastName,
    subject,
    content,
}: SendEmailInterface) {
    try {
        const mailerSend = new MailerSend({
            apiKey: env.MAILERSEND_KEY,
        });

        const sentFrom = new Sender(env.COMPANY_MAIL, 'Laborare Indonesia');

        const recipients = [new Recipient(email, `${firstName} ${lastName}`)];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setReplyTo(sentFrom)
            .setSubject(subject)
            .setHtml(content);

        await mailerSend.email.send(emailParams);
        logger.info('Email sent successfully');
    } catch (error) {
        logger.error('Failed to send email:', error);
        // You can also rethrow the error or handle it in a way that makes sense for your application
        throw error;
    }
}
