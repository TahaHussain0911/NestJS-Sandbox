// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { renderFile } from 'ejs';
import { htmlToText } from 'html-to-text';
import { join } from 'path';

@Injectable()
export class MailService {
  private from: string;
  private baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.from = `Nest App <${this.configService.get('EMAIL_USERNAME')}>`;
    this.baseUrl = `http://localhost:3000/`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      auth: {
        user: this.configService.get('EMAIL_USERNAME'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async send(options: {
    email: string;
    subject: string;
    template: string;
    context?: Record<string, any>;
  }) {
    const { email, subject, template, context = {} } = options;

    const templatePath = join(__dirname, 'templates', `${template}.ejs`);

    const html = await renderFile(templatePath, {
      ...context,
      baseUrl: this.baseUrl,
    });

    await this.newTransport().sendMail({
      from: this.from,
      to: email,
      subject,
      html,
      text: htmlToText(html),
    });
  }

  async forgotPassword(options: {
    email: string;
    url: string;
    name: string;
    [key: string]: any;
  }) {
    await this.send({
      email: options.email,
      subject: options.subject || 'Reset Your Password',
      template: 'reset-password',
      context: options,
    });
  }

  async sendWelcome(options: {
    email: string;
    name?: string;
    [key: string]: any;
  }) {
    await this.send({
      email: options.email,
      subject: options.subject || 'Welcome to Our Platform',
      template: 'welcome-user',
      context: options,
    });
  }
  async inviteUser(options: { email: string; [key: string]: any }) {
    await this.send({
      email: options.email,
      subject: options.subject || 'Invitation Request',
      template: 'invite-user',
      context: options,
    });
  }
}
