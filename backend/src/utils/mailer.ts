import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || 'smtp.mailtrap.io',
  port: process.env.MAILTRAP_PORT ? Number(process.env.MAILTRAP_PORT) : 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  return transporter.sendMail({
    from: '"Bulk Email Processor" <noreply@mailtrap.com>',
    to,
    subject,
    html,
  });
};
