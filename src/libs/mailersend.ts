// import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
// import { env } from "../configs/env";
// import logger from "./logger";

// interface SendEmailInterface {
// 	email: string;
// 	firstName: string;
// 	lastName: string;
// 	subject: string;
// 	content: string;
// }

// export async function sendEmail({ email, firstName, lastName, subject, content }: SendEmailInterface) {
// 	try {
// 		const mailerSend = new MailerSend({
// 			apiKey: env.MAILERSEND_KEY,
// 		});

// 		const sentFrom = new Sender(env.COMPANY_MAIL, "Wow Borneo");

// 		const recipients = [new Recipient(email, `${firstName} ${lastName}`)];

// 		const emailParams = new EmailParams().setFrom(sentFrom).setTo(recipients).setReplyTo(sentFrom).setSubject(subject).setHtml(content);

// 		await mailerSend.email.send(emailParams);
// 		logger.info("Email sent successfully");
// 	} catch (error) {
// 		console.log(`Error: ${error}`);
// 		logger.error("Failed to send email:", error);
// 		// You can also rethrow the error or handle it in a way that makes sense for your application
// 		throw error;
// 	}
// }

import { Resend } from "resend";
import "dotenv/config";
import logger from "./logger";
import { env } from "../configs/env";
import { url } from "inspector";

//
// ─── TIPE HASIL EMAIL ───────────────────────────────────────────────────────────
//
export type EmailResult = { success: true } | { success: false; error: string };

//
// ─── INISIALISASI CLIENT RESEND ──────────────────────────────────────────────────
//
const resend = new Resend(process.env.RESEND_KEY!);

//
// ─── HANDLE ERROR PADA PENGIRIMAN EMAIL ───────────────────────────────────────────
//
const handleEmailError = (error: unknown, action: string, email: string): EmailResult => {
	const errorMessage = error instanceof Error ? error.message : "Unknown error";

	logger.error(`Failed to ${action}`, {
		email,
		error: errorMessage,
	});

	return {
		success: false,
		error: `We encountered an issue while processing your request. Please try again later or contact our support team at ${process.env.CS_MAIL} if the problem persists.`,
	};
};

//
// ─── TEMPLATE DASAR UNTUK EMAIL (HTML) ──────────────────────────────────────────
//
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${process.env.APP_NAME}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
        }
        .support { color: #dc2626; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        ${content}
        <div class="footer">
            <p>Best regards,<br>The ${process.env.APP_NAME} Team</p>
            <p class="support">Need help? Contact our support team at
                <a href="mailto:${process.env.CS_MAIL}">${process.env.CS_MAIL}</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

//
// ─── TEMPLATE EMAIL VERIFIKASI ───────────────────────────────────────────────────
//
const verificationEmailTemplate = (email: string, token: string) => {
	const verifyUrl = `${env.AUTH_URL}/verify/${encodeURIComponent(email)}`;

	return baseTemplate(`
    <h2>Verify Your Email Address</h2>
    <p>Hello,</p>
    <p>Thank you for registering! Please verify your email address with code below:</p>


    <p>${token} </p>

    <p>If you did not create an account, no further action is required.</p>

    <p>If you're having trouble with the button above, copy and paste this URL into your browser:</p>
    <p>${verifyUrl}</p>
  `);
};

//
// ─── TEMPLATE EMAIL RESET PASSWORD ───────────────────────────────────────────────
//
const forgotPasswordTemplate = (email: string, token: string, url: string) => {
	const resetUrl = url;

	return baseTemplate(`
    <h2>Reset Your Password</h2>
    <p>Hello, ${email}</p>
    <p>You are receiving this email because we received a password reset request for your account.</p>

    <a href="${resetUrl}" class="button">
        Reset Password
    </a>

    ${token}
    <p class="support">This password reset link will expire in 5 Minutes.</p>
    <p>If you did not request a password reset, please ignore this email or contact our support team immediately.</p>

    <p>If you're having trouble with the button above, copy and paste this URL into your browser:</p>
    <p>${resetUrl}</p>
  `);
};

//
// ─── TEMPLATE EMAIL RESET SUCCESS (OPSIONAL) ────────────────────────────────────
//
const passwordResetSuccessTemplate = (email: string) => {
	return baseTemplate(`
    <h2>Password Reset Successful</h2>
    <p>Hello,</p>
    <p>Your password for <strong>${email}</strong> has been successfully reset.</p>

    <p class="support">If you did not reset your password, please contact our support team immediately.</p>
  `);
};

//
// ─── FUNGSI UNTUK MENGIRIM EMAIL VERIFIKASI ──────────────────────────────────────
//
export const sendVerificationEmail = async (email: string, token: string): Promise<EmailResult> => {
	try {
		await resend.emails.send({
			from: `${process.env.NAME_MAIL} <${process.env.COMPANY_MAIL}>`,
			to: [email],
			subject: "Verify Your Email Address",
			html: verificationEmailTemplate(email, token),
		});

		logger.info("Verification email sent", { email });
		return { success: true };
	} catch (error) {
		return handleEmailError(error, "send verification email", email);
	}
};

//
// ─── FUNGSI UNTUK MENGIRIM EMAIL RESET PASSWORD ─────────────────────────────────
//
export const sendPasswordResetEmail = async (email: string, token: string, url: string): Promise<EmailResult> => {
	try {
		await resend.emails.send({
			from: `${process.env.NAME_MAIL} <${process.env.COMPANY_MAIL}>`,
			to: [email],
			subject: "Reset Your Password",
			html: forgotPasswordTemplate(email, token, url),
		});

		logger.info("Password reset email sent", { email });
		return { success: true };
	} catch (error) {
		return handleEmailError(error, "send password reset email", email);
	}
};

//
// ─── FUNGSI OPSIONAL: EMAIL RESET SUCCESS ────────────────────────────────────────
//
export const sendPasswordResetSuccessEmail = async (email: string): Promise<EmailResult> => {
	try {
		await resend.emails.send({
			from: `${process.env.NAME_MAIL} <${process.env.COMPANY_MAIL}>`,
			to: [email],
			subject: "Your Password Has Been Reset",
			html: passwordResetSuccessTemplate(email),
		});

		logger.info("Password reset success email sent", { email });
		return { success: true };
	} catch (error) {
		return handleEmailError(error, "send password reset success email", email);
	}
};
