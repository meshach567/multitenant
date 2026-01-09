import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendVerificationEmail(email: string, otp: string) {
    await this.transporter.sendMail({
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `
        <p>Your verification code:</p>
        <h2>${otp}</h2>
        <p>This code expires in 10 minutes.</p>
      `,
    });
  }

  async sendPasswordReset(email: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset your password',
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${link}">${link}</a>
        <p>This link expires in 10 minutes.</p>
      `,
    });
  }

  async sendStaffInvite(email: string, token: string): Promise<void> {
    await Promise.resolve();
    const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;
    console.log(`📧 Staff invite → ${email}`);
    console.log(`🔗 ${inviteUrl}`);
  }
}
