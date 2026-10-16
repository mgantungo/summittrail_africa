// server/utils/summit-trail-email.js — auto-imported by Nitro in server routes.
//
// Sends Summit Trail's transactional email through the company's own
// mailbox (Namecheap / registrar-servers SMTP), not Brevo. Same shape as
// the Vision Group email services: one nodemailer transporter, verified on
// first use, with an HTML and a plain-text template per message.
//
// The password lives only in .env — never commit it to source.
//
// Required in the Nuxt server's .env:
//   SUMMIT_SMTP_PASS=<mailbox password>
// Optional (defaults shown):
//   SUMMIT_SMTP_HOST=host55.registrar-servers.com
//   SUMMIT_SMTP_PORT=465            # 465 = implicit TLS
//   SUMMIT_SMTP_USER=info@mail.summittrail.africa
//   SUMMIT_SMTP_FROM_NAME=Summit Trail

import nodemailer from 'nodemailer'

const BRAND = { orange: '#e8622a', black: '#0a0a08', white: '#ffffff' }

class SummitTrailEmailService {
  constructor() {
    this.transporter = null
    this.verified = null // Promise<boolean> once started
  }

  get user() { return process.env.SUMMIT_SMTP_USER || 'info@mail.summittrail.africa' }
  get fromName() { return process.env.SUMMIT_SMTP_FROM_NAME || 'Summit Trail' }
  get configured() { return !!process.env.SUMMIT_SMTP_PASS }

  initializeTransporter() {
    if (this.transporter) return this.transporter
    const port = Number(process.env.SUMMIT_SMTP_PORT) || 465
    this.transporter = nodemailer.createTransport({
      host: process.env.SUMMIT_SMTP_HOST || 'host55.registrar-servers.com',
      port,
      secure: port === 465, // implicit TLS on 465, STARTTLS otherwise
      requireTLS: port !== 465,
      auth: { user: this.user, pass: process.env.SUMMIT_SMTP_PASS },
      // Keep one connection open while sending a batch of follower emails
      pool: true,
      maxConnections: 2,
      maxMessages: 50,
      logger: false,
      debug: false,
    })

    this.verified = this.transporter.verify()
      .then(() => { console.info('[summit-email] transporter is ready'); return true })
      .catch((error) => { console.error('[summit-email] transporter failed to initialize:', error.message); return false })

    return this.transporter
  }

  async send(mail, label) {
    if (!this.configured) {
      console.warn(`[summit-email] SUMMIT_SMTP_PASS not set — skipped ${label} to ${mail.to}`)
      return { success: false, skipped: true }
    }
    const tx = this.initializeTransporter()
    try {
      const result = await tx.sendMail({
        from: { name: this.fromName, address: this.user },
        replyTo: this.user,
        headers: { 'X-Mailer': ' ', ...(mail.headers || {}) },
        ...mail,
      })
      console.info(`[summit-email] ${label} sent to ${mail.to}, messageId: ${result.messageId}`)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error(`[summit-email] failed to send ${label} to ${mail.to}:`, error.message)
      throw new Error(`Email sending failed: ${error.message}`)
    }
  }

  /**
   * A field update for someone following an expedition by email.
   * opts: { adventureTitle, advancedTo, text, image, link }
   */
  async sendExpeditionUpdate(toEmail, opts = {}) {
    const subject = opts.advancedTo
      ? `${opts.adventureTitle}: the team has reached ${opts.advancedTo}`
      : `${opts.adventureTitle}: new update from the field`
    return this.send({
      to: toEmail,
      subject,
      html: this.updateEmailHtml(opts),
      text: this.updateEmailText(opts),
      headers: {
        'Precedence': 'bulk',
        'List-Unsubscribe': `<mailto:${this.user}?subject=Unfollow>`,
      },
    }, 'expedition update')
  }

  /**
   * Confirms a new email follow, so a mistyped address or an unexpected
   * signup is noticed straight away.
   * opts: { adventureTitle, link }
   */
  async sendFollowConfirmation(toEmail, opts = {}) {
    return this.send({
      to: toEmail,
      subject: `You're following ${opts.adventureTitle || 'a Summit Trail expedition'}`,
      html: this.followEmailHtml(toEmail, opts),
      text: this.followEmailText(toEmail, opts),
      headers: { 'List-Unsubscribe': `<mailto:${this.user}?subject=Unfollow>` },
    }, 'follow confirmation')
  }

  // ── Templates ────────────────────────────────────────────────────────────
  escape(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  }

  layout(title, bodyHtml) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escape(title)}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: ${BRAND.white}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: ${BRAND.black}; padding: 26px 30px; text-align: center; color: ${BRAND.white}; border-bottom: 4px solid ${BRAND.orange}; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px; }
        .content { padding: 36px 40px; }
        .live { display: inline-block; background: ${BRAND.orange}; color: ${BRAND.white}; font-size: 12px; font-weight: 700; letter-spacing: 2px; padding: 3px 10px; border-radius: 3px; }
        .photo { width: 100%; max-width: 520px; border-radius: 6px; margin: 16px 0; }
        .quote { border-left: 3px solid ${BRAND.orange}; padding: 4px 0 4px 14px; margin: 18px 0; font-size: 16px; }
        .button { display: inline-block; background: ${BRAND.orange}; color: ${BRAND.white} !important; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; }
        .link { word-break: break-all; font-size: 12px; color: #6c757d; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #dee2e6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>SUMMIT TRAIL</h1></div>
        <div class="content">${bodyHtml}</div>
        <div class="footer">
            <p>You're receiving this because you followed this expedition on Summit Trail.</p>
            <p>To stop these emails, reply with "Unfollow" or email <a href="mailto:${this.escape(this.user)}">${this.escape(this.user)}</a>.</p>
            <p>Summit Trail Limited &copy; ${new Date().getFullYear()}</p>
        </div>
    </div>
</body>
</html>`
  }

  updateEmailHtml({ adventureTitle, advancedTo, text, image, link }) {
    const e = (v) => this.escape(v)
    return this.layout(adventureTitle || 'Expedition update', `
            <span class="live">LIVE</span>
            <h2 style="margin:12px 0 4px;">${e(adventureTitle) || 'Expedition update'}</h2>
            ${advancedTo ? `<p style="margin:0;"><strong>The team has reached ${e(advancedTo)}.</strong></p>` : ''}
            ${image ? `<img class="photo" src="${e(image)}" alt="Photo from the field">` : ''}
            ${text ? `<div class="quote">${e(text)}</div>` : ''}
            <p style="text-align:center;margin:30px 0;"><a class="button" href="${e(link)}">Follow them live</a></p>
            <p class="link">If the button doesn't work, paste this link into your browser:<br>${e(link)}</p>`)
  }

  updateEmailText({ adventureTitle, advancedTo, text, link }) {
    return `SUMMIT TRAIL — LIVE EXPEDITION UPDATE

${adventureTitle || 'Expedition update'}
${advancedTo ? `\nThe team has reached ${advancedTo}.\n` : ''}${text ? `\n"${text}"\n` : ''}
Follow them live: ${link}

---
You're receiving this because you followed this expedition on Summit Trail.
To stop these emails, reply with "Unfollow" or email ${this.user}.
Summit Trail Limited © ${new Date().getFullYear()}`
  }

  followEmailHtml(toEmail, { adventureTitle, link }) {
    const e = (v) => this.escape(v)
    return this.layout(`Following ${adventureTitle || 'an expedition'}`, `
            <p>Hello,</p>
            <p>You're now following <strong>${e(adventureTitle) || 'a Summit Trail expedition'}</strong>. We'll email <strong>${e(toEmail)}</strong> each time the team reaches a checkpoint or posts an update from the field.</p>
            <p style="text-align:center;margin:30px 0;"><a class="button" href="${e(link)}">See where they are now</a></p>
            <p class="link">${e(link)}</p>
            <p>If you didn't ask for this, reply with "Unfollow" and we'll remove you.</p>`)
  }

  followEmailText(toEmail, { adventureTitle, link }) {
    return `SUMMIT TRAIL — YOU'RE FOLLOWING ${(adventureTitle || 'AN EXPEDITION').toUpperCase()}

Hello,

You're now following ${adventureTitle || 'a Summit Trail expedition'}. We'll email ${toEmail} each time the team reaches a checkpoint or posts an update from the field.

See where they are now: ${link}

If you didn't ask for this, reply with "Unfollow" and we'll remove you.
---
Summit Trail Limited © ${new Date().getFullYear()}`
  }
}

// One shared instance per server process (Nitro auto-imports this export)
export const summitTrailEmail = globalThis.__summitTrailEmail ?? (globalThis.__summitTrailEmail = new SummitTrailEmailService())
