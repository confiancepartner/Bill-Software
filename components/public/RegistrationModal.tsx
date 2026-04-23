"use client";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { RegisterPayload } from "@/lib/types";

export const PLANS = [
  {
    name: "Starter",
    priceMonthly: 999,
    amountInPaise: 99900,
    users: 5,
    branches: 2,
    invoices: "500/month",
    description: "Perfect for small businesses just getting started.",
    features: [
      "GST-Compliant Invoicing",
      "Purchase Tracking",
      "Sales & Tax Reports",
      "2 Branches",
      "5 Users",
      "PDF Export",
      "Email Support",
    ],
    highlighted: false,
    color: "#1957bc",
  },
  {
    name: "Professional",
    priceMonthly: 2499,
    amountInPaise: 249900,
    users: 20,
    branches: 10,
    invoices: "Unlimited",
    description: "For growing businesses that need more power.",
    features: [
      "Everything in Starter",
      "Unlimited Invoices",
      "10 Branches",
      "20 Users",
      "Priority Support",
      "Advanced Analytics",
      "Custom Invoice Templates",
    ],
    highlighted: true,
    color: "#c14408",
  },
  {
    name: "Enterprise",
    priceMonthly: 5999,
    amountInPaise: 599900,
    users: 999,
    branches: 999,
    invoices: "Unlimited",
    description: "For large enterprises with complex needs.",
    features: [
      "Everything in Professional",
      "Unlimited Users",
      "Unlimited Branches",
      "Dedicated Account Manager",
      "Custom Integrations",
      "SLA Guarantee",
      "Onboarding Assistance",
    ],
    highlighted: false,
    color: "#1957bc",
  },
];

interface RegistrationFormData extends RegisterPayload {
  confirmPassword: string;
}

const emptyForm: RegistrationFormData = {
  clientName: "",
  contactName: "",
  contactEmail: "",
  phone: "",
  companyName: "",
  companyGstin: "",
  companyAddress: "",
  adminPassword: "",
  confirmPassword: "",
  planName: "Starter",
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window !== "undefined" && typeof window.Razorpay !== "undefined") return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export default function RegistrationModal({
  plan,
  onClose,
}: {
  plan: (typeof PLANS)[0];
  onClose: () => void;
}) {
  const [form, setForm] = useState<RegistrationFormData>({ ...emptyForm, planName: plan.name });
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ subdomain: string } | null>(null);

  const mainDomain =
    typeof window !== "undefined"
      ? window.location.hostname.replace(/^www\./, "")
      : "yourdomain.com";

  // On Replit dev or localhost, subdomains don't work — use ?tenant= query param instead
  const isDevEnv =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname.includes(".replit.dev") ||
      window.location.hostname.includes(".kirk.replit.dev"));

  const getWorkspaceUrl = (slug: string) => {
    if (isDevEnv) {
      const base = typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.host}`
        : "";
      return `${base}/?tenant=${encodeURIComponent(slug)}`;
    }
    return `https://${slug}.${mainDomain}`;
  };

  const handleRegister = async () => {
    setError(null);
    if (!form.clientName || !form.contactEmail || !form.companyName || !form.adminPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.adminPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.adminPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const { adminPassword, confirmPassword: _c, ...regPayload } = form;
      regPayload.contactName = regPayload.contactName || regPayload.clientName;

      const razorpayLoaded = await loadRazorpayScript();
      const rzpKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (razorpayLoaded && rzpKeyId) {
        const order = await apiClient.createRazorpayOrder(plan.amountInPaise, plan.name);
        const options = {
          key: rzpKeyId,
          amount: order.amount,
          currency: order.currency,
          name: "BillForge",
          description: `${plan.name} Plan — 15-Day Free Trial`,
          order_id: order.orderId,
          handler: async (paymentResponse: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const result = await apiClient.verifyRazorpayPayment({
                ...paymentResponse,
                registrationData: { ...regPayload, adminPassword, planName: plan.name },
              });
              setSuccessData({ subdomain: result.subdomain });
              setStep("success");
            } catch (verifyError) {
              setError(verifyError instanceof Error ? verifyError.message : "Payment verification failed");
            } finally {
              setLoading(false);
            }
          },
          prefill: { name: form.contactName || form.clientName, email: form.contactEmail, contact: form.phone },
          theme: { color: "#1957bc" },
        };
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", () => {
          setError("Payment failed. Please try again.");
          setLoading(false);
        });
        rzp.open();
      } else {
        const result = await apiClient.register({ ...regPayload, adminPassword, planName: plan.name });
        setSuccessData({ subdomain: result.subdomain });
        setStep("success");
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl px-6 pt-5 pb-4 bg-white border-b border-gray-100">
          <div>
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white mb-1"
              style={{ backgroundColor: plan.highlighted ? "#c14408" : "#1957bc" }}
            >
              <span className="material-icons text-sm">workspace_premium</span>
              {plan.name} Plan — ₹{plan.priceMonthly.toLocaleString("en-IN")}/mo
            </div>
            <h3 className="text-xl font-bold text-gray-900">Start your 15-day free trial</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <span className="material-icons text-base">close</span>
          </button>
        </div>

        <div className="px-6 pb-6 pt-4">
          {step === "success" && successData ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <span className="material-icons text-3xl text-green-600">check_circle</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Account Created!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your 15-day free trial is active. Your workspace is ready.
              </p>

              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-left">
                <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wide">Workspace Slug</p>
                <p className="font-mono text-sm font-bold text-[#1957bc] break-all">{successData.subdomain}</p>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                Login with the email and password you just set. No payment charged during trial.
              </p>

              <a
                href={getWorkspaceUrl(successData.subdomain)}
                className="mt-5 flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white hover:opacity-90 transition"
                style={{ backgroundColor: "#1957bc" }}
              >
                <span className="material-icons text-base">login</span>
                Go to My Dashboard
              </a>

              <button
                onClick={onClose}
                className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="mb-1 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                <span className="material-icons text-sm text-amber-600">info</span>
                15-day free trial — no charges until trial ends. Cancel anytime.
              </div>

              <div className="mt-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="form-label">Your Name *</label>
                    <input className="form-input" placeholder="John Doe" value={form.clientName}
                      onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" placeholder="you@company.com" value={form.contactEmail}
                      onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="form-label">Company Name *</label>
                    <input className="form-input" placeholder="Acme Corp" value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="form-label">GSTIN (optional)</label>
                  <input className="form-input" placeholder="22AAAAA0000A1Z5" value={form.companyGstin}
                    onChange={(e) => setForm({ ...form, companyGstin: e.target.value })} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="form-label">Password *</label>
                    <input className="form-input" type="password" placeholder="Min 8 characters" value={form.adminPassword}
                      onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Confirm Password *</label>
                    <input className="form-input" type="password" placeholder="Repeat password" value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  <span className="material-icons text-base mt-0.5">error_outline</span>
                  {error}
                </div>
              )}

              <button
                disabled={loading}
                onClick={handleRegister}
                className="mt-5 w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-all disabled:opacity-60"
                style={{ backgroundColor: "#c14408" }}
              >
                {loading ? "Processing..." : "Start Free Trial — 15 Days Free"}
              </button>
              <p className="mt-2 text-center text-xs text-gray-400">
                Secure registration. By signing up you agree to our Terms of Service.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
