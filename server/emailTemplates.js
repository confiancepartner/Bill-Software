function baseLayout(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>BillForge</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f8fafc; margin:0; padding:0; }
  .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; overflow:hidden; }
  .header { background: linear-gradient(135deg, #1957bc, #c14408); padding: 28px 32px; }
  .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 700; }
  .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
  .body { padding: 32px; }
  .body p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
  .cta { display: inline-block; background: #c14408; color: #fff !important; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; margin: 8px 0 24px; }
  .info-box { background: #f8fafc; border-left: 4px solid #1957bc; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .info-box p { margin: 4px 0; font-size: 14px; color: #374151; }
  .info-box strong { color: #111827; }
  .warning-box { background: #fff7ed; border-left: 4px solid #c14408; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .warning-box p { margin: 4px 0; font-size: 14px; color: #92400e; }
  .footer { background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; }
  .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>BillForge</h1>
    <p>by Meld Techo · India's Smartest GST Billing Platform</p>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    <p>BillForge by Meld Techo · meldtecho.com · +91 93110 66483</p>
    <p>This is an automated email. Please do not reply.</p>
  </div>
</div>
</body>
</html>`;
}

function trialReminder({ contactName, clientName, daysLeft, workspaceSlug, planName }) {
  const urgency = daysLeft <= 2 ? "URGENT: " : daysLeft <= 5 ? "Reminder: " : "";
  const subject = `${urgency}Your BillForge trial ${daysLeft <= 0 ? "has expired" : `expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}`;
  const html = baseLayout(`
    <p>Hi <strong>${contactName}</strong>,</p>
    ${daysLeft > 0
      ? `<p>Your BillForge ${planName} trial for <strong>${clientName}</strong> expires in <strong>${daysLeft} day${daysLeft === 1 ? "" : "s"}</strong>.</p>
         <p>Renew now to keep accessing all your invoices, reports, and customer data without interruption.</p>`
      : `<p>Your BillForge trial for <strong>${clientName}</strong> has expired. Your workspace has been suspended.</p>
         <p>Renew your subscription to restore access immediately.</p>`
    }
    <div class="warning-box">
      <p>⚡ <strong>Workspace:</strong> ${workspaceSlug}</p>
      <p>📅 <strong>Plan:</strong> ${planName}</p>
      <p>🔔 <strong>Days remaining:</strong> ${Math.max(0, daysLeft)}</p>
    </div>
    <a class="cta" href="${process.env.NEXT_PUBLIC_APP_URL || "https://billforge.meldtecho.com"}/?tenant=${workspaceSlug}">Renew Subscription →</a>
    <p style="font-size:13px;color:#6b7280;">Login to your Admin panel and go to Admin → Subscription to upgrade or renew your plan.</p>
  `);
  return { subject, html };
}

function invoiceSentToCustomer({ invoiceNumber, invoiceDate, totalAmount, businessName, shareUrl, notes }) {
  const subject = `Invoice ${invoiceNumber} from ${businessName}`;
  const html = baseLayout(`
    <p>Please find your invoice details below:</p>
    <div class="info-box">
      <p><strong>Invoice No.:</strong> ${invoiceNumber}</p>
      <p><strong>Date:</strong> ${invoiceDate}</p>
      <p><strong>From:</strong> ${businessName}</p>
      <p><strong>Amount:</strong> ₹${Number(totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
    </div>
    ${notes ? `<p><em>${notes}</em></p>` : ""}
    <a class="cta" href="${shareUrl}">View Invoice →</a>
    <p style="font-size:13px;color:#6b7280;">You can view and download your invoice using the link above.</p>
  `);
  return { subject, html };
}

function paymentReceivedConfirmation({ invoiceNumber, paidAmount, paymentMode, paymentDate, balanceDue, businessName, customerName }) {
  const subject = `Payment Received for Invoice ${invoiceNumber} — ${businessName}`;
  const html = baseLayout(`
    <p>Hi <strong>${customerName}</strong>,</p>
    <p>We have received your payment for invoice <strong>${invoiceNumber}</strong>.</p>
    <div class="info-box">
      <p><strong>Amount Received:</strong> ₹${Number(paidAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
      <p><strong>Payment Mode:</strong> ${paymentMode}</p>
      <p><strong>Date:</strong> ${paymentDate}</p>
      ${balanceDue > 0 ? `<p><strong>Balance Due:</strong> ₹${Number(balanceDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>` : "<p><strong>Status:</strong> ✅ Fully Paid</p>"}
    </div>
    <p>Thank you for your payment!</p>
    <p style="font-size:13px;color:#6b7280;">— ${businessName}</p>
  `);
  return { subject, html };
}

module.exports = { trialReminder, invoiceSentToCustomer, paymentReceivedConfirmation };
