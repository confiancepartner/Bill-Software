const crypto = require("crypto");

let RazorpaySDK = null;
try {
  RazorpaySDK = require("razorpay");
} catch (_e) {
  RazorpaySDK = null;
}

function isConfigured() {
  return !!(
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    RazorpaySDK
  );
}

function getInstance() {
  if (!isConfigured()) return null;
  return new RazorpaySDK({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

async function createOrder({ amountInPaise, currency = "INR", receipt }) {
  const rzp = getInstance();
  if (!rzp) throw new Error("Payment gateway not configured");
  return rzp.orders.create({ amount: amountInPaise, currency, receipt });
}

function verifySignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("Payment gateway not configured");
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expected === signature;
}

module.exports = { isConfigured, createOrder, verifySignature };
