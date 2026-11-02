import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '../config';
import { logger } from '../logger';
import { Inquiry } from '../models/Inquiry';
import { getSettings } from './content';

let transporter: Transporter | undefined;

function getTransport(): Transporter {
  if (transporter) return transporter;
  transporter = config.SMTP_HOST
    ? nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_SECURE,
        auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASS } : undefined,
      })
    : // Without SMTP settings, messages are rendered and logged instead of sent.
      nodemailer.createTransport({ jsonTransport: true });
  return transporter;
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

interface InquiryForEmail {
  _id: unknown;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  productName: string;
  quantity: string;
  message: string;
}

/** Notifies the configured recipients of a new inquiry and records the outcome on the inquiry. */
export async function notifyNewInquiry(inquiry: InquiryForEmail): Promise<void> {
  const settings = await getSettings();
  const to = [...new Set([...settings.notificationEmails, ...config.NOTIFY_EMAILS])];
  if (to.length === 0) {
    await Inquiry.updateOne({ _id: inquiry._id }, { 'notification.error': 'No notification recipients configured' });
    logger.warn('inquiry received but no notification recipients are configured');
    return;
  }

  const rows: [string, string][] = [
    ['Name', inquiry.fullName],
    ['Company', inquiry.companyName],
    ['Email', inquiry.email],
    ['Phone', inquiry.phone],
    ['Product', inquiry.productName || 'General inquiry'],
    ['Quantity', inquiry.quantity || '—'],
  ];
  const adminUrl = `${config.siteUrl}/admin/inquiries/${String(inquiry._id)}`;
  const html = `
    <div style="font-family:Arial,sans-serif;color:#101D2B;max-width:600px">
      <h2 style="margin:0 0 16px">New website inquiry</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows.map(([k, v]) => `<tr><td style="color:#5b6878">${k}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`).join('')}
      </table>
      <p style="white-space:pre-wrap;background:#F7F9FB;padding:12px 14px">${escapeHtml(inquiry.message)}</p>
      <p><a href="${escapeHtml(adminUrl)}">Open in the admin dashboard</a></p>
    </div>`;
  const text = `New website inquiry\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${inquiry.message}\n\n${adminUrl}`;

  try {
    const info = await getTransport().sendMail({
      from: config.SMTP_FROM,
      to,
      replyTo: inquiry.email,
      subject: `New inquiry: ${inquiry.productName || 'General'} — ${inquiry.companyName}`.slice(0, 180),
      text,
      html,
    });
    await Inquiry.updateOne({ _id: inquiry._id }, { 'notification.sent': true, 'notification.error': '' });
    if (!config.SMTP_HOST) logger.info({ to, messageId: info.messageId }, 'inquiry notification rendered (SMTP not configured, not sent)');
  } catch (err) {
    logger.error({ err }, 'inquiry notification failed');
    await Inquiry.updateOne({ _id: inquiry._id }, { 'notification.error': 'Email delivery failed' });
  }
}
