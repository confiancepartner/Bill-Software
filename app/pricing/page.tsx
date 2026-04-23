"use client";
import { useState } from "react";
import Link from "next/link";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";
import RegistrationModal, { PLANS } from "@/components/public/RegistrationModal";

const COMPARISON_ROWS = [
  { feature: "GST-Compliant Invoicing", starter: true, professional: true, enterprise: true },
  { feature: "Purchase Tracking", starter: true, professional: true, enterprise: true },
  { feature: "PDF Export", starter: true, professional: true, enterprise: true },
  { feature: "Reports & Analytics", starter: "Basic", professional: "Advanced", enterprise: "Advanced" },
  { feature: "Number of Users", starter: "5", professional: "20", enterprise: "Unlimited" },
  { feature: "Number of Branches", starter: "2", professional: "10", enterprise: "Unlimited" },
  { feature: "Invoices per Month", starter: "500", professional: "Unlimited", enterprise: "Unlimited" },
  { feature: "Custom Invoice Templates", starter: false, professional: true, enterprise: true },
  { feature: "Priority Support", starter: false, professional: true, enterprise: true },
  { feature: "Dedicated Account Manager", starter: false, professional: false, enterprise: true },
  { feature: "Custom Integrations", starter: false, professional: false, enterprise: true },
  { feature: "SLA Guarantee", starter: false, professional: false, enterprise: true },
  { feature: "Onboarding Assistance", starter: false, professional: false, enterprise: true },
  { feature: "15-Day Free Trial", starter: true, professional: true, enterprise: true },
];

const FAQS = [
  { q: "Is the 15-day trial truly free?", a: "Yes, completely free. No credit card is required to start. You get full access to all features of your chosen plan for 15 days." },
  { q: "What happens after the trial ends?", a: "After 15 days, you'll need to subscribe to continue using BillForge. If you don't subscribe, your account will be paused — your data is never deleted." },
  { q: "Can I switch plans later?", a: "Absolutely. You can upgrade or downgrade at any time. Changes take effect at the start of the next billing cycle." },
  { q: "Do you support monthly and annual billing?", a: "Currently we offer monthly billing. Annual plans with a discount are coming soon. Contact us for custom pricing." },
  { q: "Is my data safe and private?", a: "Yes. Each company gets a fully isolated database. Your data is never shared with other tenants or third parties." },
  { q: "Can I get a custom Enterprise quote?", a: "Yes! Call us at +91 93110 66483 or fill the contact form for a custom Enterprise proposal tailored to your requirements." },
];

function CheckIcon({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span className="text-xs font-semibold text-gray-700">{value}</span>;
  if (value) return <span className="material-icons text-base" style={{ color: "#1957bc" }}>check_circle</span>;
  return <span className="material-icons text-base text-gray-300">remove_circle_outline</span>;
}

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<(typeof PLANS)[0] | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicNav />

      <main>
        <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0d1f52,#1957bc)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #c14408, transparent 60%)" }} />
          <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 text-center">
            <span className="inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-4"
              style={{ backgroundColor: "#c14408", color: "white" }}>
              Pricing
            </span>
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg text-blue-100">
              All plans include a <strong className="text-amber-300">15-day free trial</strong>. No credit card required. Cancel anytime.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-5 py-2.5 text-sm font-semibold text-amber-300">
              <span className="material-icons text-base">timer</span>
              After 15 days, a subscription is required to continue using BillForge.
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all hover:shadow-2xl ${
                  plan.highlighted ? "border-2 shadow-xl" : "border-gray-200 bg-white shadow-md"
                }`}
                style={plan.highlighted ? { borderColor: "#c14408", backgroundColor: "#fffaf7" } : {}}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-5 py-1 text-xs font-extrabold text-white shadow-lg"
                    style={{ backgroundColor: "#c14408" }}>
                    Most Popular
                  </div>
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md mb-5"
                  style={{ backgroundColor: plan.highlighted ? "#c14408" : "#1957bc" }}>
                  <span className="material-icons text-xl">workspace_premium</span>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-500 min-h-[2.5rem]">{plan.description}</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-5xl font-extrabold text-gray-900">₹{plan.priceMonthly.toLocaleString("en-IN")}</span>
                  <span className="mb-1.5 text-sm text-gray-400">/month</span>
                </div>
                <div className="mt-1 text-xs font-medium" style={{ color: plan.highlighted ? "#c14408" : "#1957bc" }}>
                  + 15 days FREE trial
                </div>

                <ul className="my-7 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="material-icons text-base mt-0.5 flex-shrink-0" style={{ color: plan.highlighted ? "#c14408" : "#1957bc" }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedPlan(plan)}
                  className="w-full rounded-xl py-3.5 text-sm font-extrabold text-white shadow-lg hover:opacity-90 transition-all"
                  style={{ backgroundColor: plan.highlighted ? "#c14408" : "#1957bc" }}
                >
                  Start Free Trial
                </button>
                <p className="mt-2 text-center text-xs text-gray-400">No credit card required</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-extrabold text-gray-900 text-center">Compare all plans</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#1957bc" }}>
                  <th className="px-5 py-4 text-left font-semibold text-white">Feature</th>
                  {PLANS.map((plan) => (
                    <th key={plan.name} className="px-5 py-4 text-center font-semibold text-white">
                      {plan.name}
                      {plan.highlighted && (
                        <span className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: "#c14408" }}>★</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-5 py-3.5 font-medium text-gray-700">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center"><CheckIcon value={row.starter} /></td>
                    <td className="px-5 py-3.5 text-center"><CheckIcon value={row.professional} /></td>
                    <td className="px-5 py-3.5 text-center"><CheckIcon value={row.enterprise} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8" style={{ backgroundColor: "#f8faff" }}>
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-2xl font-extrabold text-gray-900 text-center">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <button
                    className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{faq.q}</span>
                    <span className="material-icons text-gray-400 flex-shrink-0 ml-4">
                      {openFaq === i ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-600 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8" style={{ background: "linear-gradient(135deg,#c14408,#a33506)" }}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold text-white">Still have questions?</h2>
            <p className="mt-3 text-orange-100">Our team is available to help you choose the right plan.</p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a href="tel:+919311066483" className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold shadow-xl hover:bg-orange-50 transition-all"
                style={{ color: "#c14408" }}>
                <span className="material-icons text-base">phone</span> +91 93110 66483
              </a>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-all">
                <span className="material-icons text-base">mail</span> Send a Message
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />

      {selectedPlan && (
        <RegistrationModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </div>
  );
}
