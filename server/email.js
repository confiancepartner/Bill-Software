const nodemailer = require("nodemailer");

function isConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMail({ to, subject, html }) {
  if (!isConfigured()) {
    console.log(`[EMAIL SKIPPED — SMTP not configured] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }
  const from = process.env.SMTP_FROM || `BillForge <${process.env.SMTP_USER}>`;
  const transport = createTransport();
  const info = await transport.sendMail({ from, to, subject, html });
  console.log(`[EMAIL SENT] To: ${to} | MessageId: ${info.messageId}`);
  return info;
}

module.exports = { sendMail, isConfigured };
