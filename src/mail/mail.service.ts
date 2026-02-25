import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: port === '465',
        auth: { user, pass },
      });
    }
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@ikoraniro.local';
    if (this.transporter) {
      await this.transporter.sendMail({ from, to, subject, html });
    } else {
      // eslint-disable-next-line no-console
      console.log('[Mail] (no SMTP) would send to', to, ':', subject, '\n', html.slice(0, 200));
    }
  }
}
