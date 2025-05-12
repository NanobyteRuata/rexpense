import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { EmailServiceException } from 'src/core/exceptions/common-exceptions';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sendgridApiKey) sgMail.setApiKey(sendgridApiKey);
  }

  async sendEmail(email: string, subject: string, html: string): Promise<void> {
    const from = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    if (!from) throw new Error('Missing SENDGRID_FROM_EMAIL configuration');

    const msg = {
      to: email,
      from,
      subject,
      html,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending email:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      throw new EmailServiceException();
    }
  }
}
