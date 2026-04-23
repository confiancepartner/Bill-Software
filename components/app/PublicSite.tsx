"use client";
import { useState } from "react";
import Link from "next/link";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";
import RegistrationModal, { PLANS } from "@/components/public/RegistrationModal";

const STATS = [
  { value: "10,000+", label: "Invoices Generated" },
  { value: "500+", label: "Businesses Served" },
  { value: "100%", label: "GST Compliant" },
  { value: "15 Days", label: "Free Trial" },
];

const FEATURES_PREVIEW = [
  { icon: "receipt_long", title: "GST-Compliant Invoices", desc: "CGST, SGST & IGST breakdowns with professional PDF export in one click." },
  { icon: "store", title: "Multi-Branch Management", desc: "Run multiple branches from a single dashboard with separate books per branch." },
  { icon: "group", title: "Role-Based Access", desc: "Admin and staff roles with branch-level permissions — fully controlled access." },
  { icon: "bar_chart", title: "Real-Time Reports", desc: "Track sales, tax collected/paid, and your net GST position at a glance." },
  { icon: "shopping_bag", title: "Purchase Tracking", desc: "Record vendor bills, claim input GST, and reconcile payables effortlessly." },
  { icon: "devices", title: "Works Everywhere", desc: "Access from desktop, tablet, or mobile — responsive and always available." },
];

const STEPS = [
  { step: "01", title: "Register & Choose a Plan", desc: "Sign up with your company details, pick a plan, and start your 15-day free trial instantly." },
  { step: "02", title: "Set Up Your Company", desc: "Add branches, invite team members, and configure your GST settings in minutes." },
  { step: "03", title: "Start Billing", desc: "Create GST-compliant invoices, track purchases, and view reports — all from one dashboard." },
];

const TESTIMONIALS = [
  { name: "Rajesh Sharma", role: "Owner, Sharma Traders, Delhi", quote: "BillForge cut our invoice time by 70%. The GST breakdowns are perfect and PDF generation is instant.", avatar: "RS" },
  { name: "Priya Mehta", role: "CFO, TechNova Solutions, Bengaluru", quote: "Managing 8 branches was a nightmare before BillForge. Now everything is in one place and audit-ready.", avatar: "PM" },
  { name: "Arjun Nair", role: "Director, Nair Enterprises, Mumbai", quote: "The 15-day trial convinced us immediately. Setup was done in under an hour. Best billing SaaS for India.", avatar: "AN" },
];

export default function PublicSite() {
  const [selectedPlan, setSelectedPlan] = useState<(typeof PLANS)[0] | null>(null);

  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicNav onStartTrial={() => setSelectedPlan(PLANS[1])} />

      <main>
        <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0d1f52 0%, #1957bc 60%, #1a3a8a 100%)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #c14408 0%, transparent 50%), radial-gradient(circle at 80% 20%, #c14408 0%, transparent 40%)" }} />
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Trusted by 500+ Indian Businesses
              </div>
              <h1 className="text-5xl font-extrabold leading-tight text-white sm:text-6xl lg:text-7xl">
                India&apos;s Smartest
                <br />
                <span style={{ color: "#c14408" }}>GST Billing</span> Platform
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 leading-relaxed">
                Create GST-compliant invoices, track purchases, manage multiple branches and staff — all from one powerful dashboard. Every company gets its own secure, dedicated workspace.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-300">
                <span className="material-icons text-base">timer</span>
                15-Day Free Trial — No Credit Card Required
              </div>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <button
                  onClick={() => setSelectedPlan(PLANS[1])}
                  className="flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white shadow-xl hover:opacity-90 transition-all"
                  style={{ backgroundColor: "#c14408" }}
                >
                  <span className="material-icons text-xl">rocket_launch</span>
                  Start Free Trial
                </button>
                <Link
                  href="/features"
                  className="flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
                >
                  <span className="material-icons text-xl">play_circle</span>
                  See Features
                </Link>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-3 pb-12 sm:grid-cols-4">
                {STATS.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-5 text-center backdrop-blur-sm">
                    <div className="text-3xl font-extrabold text-white">{stat.value}</div>
                    <div className="mt-1 text-xs font-medium text-blue-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <span className="inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest text-white mb-4" style={{ backgroundColor: "#1957bc" }}>
                Core Features
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900">Everything your business needs</h2>
              <p className="mt-3 text-lg text-gray-500">
                Built specifically for Indian GST compliance — no workarounds, no complexity.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES_PREVIEW.map((f, i) => (
                <div
                  key={f.title}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-7 hover:shadow-lg hover:border-blue-200 transition-all cursor-default"
                >
                  <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-full opacity-5 transition-opacity group-hover:opacity-10"
                    style={{ backgroundColor: i % 2 === 0 ? "#1957bc" : "#c14408" }} />
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md"
                    style={{ backgroundColor: i % 2 === 0 ? "#1957bc" : "#c14408" }}>
                    <span className="material-icons text-xl">{f.icon}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/features" className="inline-flex items-center gap-2 font-semibold hover:underline" style={{ color: "#1957bc" }}>
                View all features <span className="material-icons text-base">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ backgroundColor: "#f8faff" }}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <span className="inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest text-white mb-4" style={{ backgroundColor: "#c14408" }}>
                How It Works
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900">Up and running in minutes</h2>
              <p className="mt-3 text-lg text-gray-500">Three simple steps to transform how you bill.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.step} className="relative text-center">
                  {i < STEPS.length - 1 && (
                    <div className="absolute left-full top-10 hidden w-full border-t-2 border-dashed border-gray-200 md:block" style={{ width: "calc(100% - 2rem)", left: "calc(50% + 3rem)" }} />
                  )}
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-extrabold text-white shadow-xl"
                    style={{ backgroundColor: i === 1 ? "#c14408" : "#1957bc" }}>
                    {s.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <span className="inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest text-white mb-4" style={{ backgroundColor: "#1957bc" }}>
                What Customers Say
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900">Loved by Indian businesses</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="rounded-2xl border border-gray-100 bg-gray-50 p-7 hover:shadow-md transition-all">
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="material-icons text-sm" style={{ color: "#c14408" }}>star</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: "#1957bc" }}>{t.avatar}</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8" style={{ backgroundColor: "#f8faff" }}>
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Simple, transparent pricing</h2>
              <p className="mt-2 text-gray-500">All plans include a <strong>15-day free trial</strong>. No credit card required to start.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border p-7 transition-all hover:shadow-xl ${
                    plan.highlighted ? "border-2 shadow-lg scale-105" : "border-gray-200 bg-white"
                  }`}
                  style={plan.highlighted ? { borderColor: "#c14408", backgroundColor: "#fff8f5" } : {}}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold text-white shadow"
                      style={{ backgroundColor: "#c14408" }}>
                      Most Popular
                    </div>
                  )}
                  <div className="mb-1 text-lg font-extrabold text-gray-900">{plan.name}</div>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-extrabold text-gray-900">₹{plan.priceMonthly.toLocaleString("en-IN")}</span>
                    <span className="mb-1 text-sm text-gray-400">/month</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-5">{plan.description}</p>
                  <ul className="flex-1 space-y-2.5 mb-7">
                    {plan.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="material-icons text-base" style={{ color: plan.highlighted ? "#c14408" : "#1957bc" }}>check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="w-full rounded-xl py-3 text-sm font-bold text-white shadow hover:opacity-90 transition-all"
                    style={{ backgroundColor: plan.highlighted ? "#c14408" : "#1957bc" }}
                  >
                    Start Free Trial
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/pricing" className="inline-flex items-center gap-2 font-semibold hover:underline" style={{ color: "#1957bc" }}>
                Compare all plans in detail <span className="material-icons text-base">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8" style={{ background: "linear-gradient(135deg,#c14408,#a33506)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-extrabold text-white">Ready to modernize your billing?</h2>
            <p className="mt-4 text-lg text-orange-100">
              Join 500+ Indian businesses using BillForge. Start your 15-day free trial today — no credit card needed.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={() => setSelectedPlan(PLANS[1])}
                className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold shadow-xl hover:bg-orange-50 transition-all"
                style={{ color: "#c14408" }}
              >
                <span className="material-icons">rocket_launch</span>
                Start Free Trial Now
              </button>
              <Link
                href="/contact"
                className="flex items-center gap-2 rounded-xl border-2 border-white/40 px-8 py-4 text-base font-bold text-white hover:bg-white/10 transition-all"
              >
                <span className="material-icons">phone</span>
                Talk to Sales
              </Link>
            </div>
            <p className="mt-4 text-xs text-orange-200">
              Questions? Call us at <a href="tel:+919311066483" className="font-bold underline">+91 93110 66483</a>
            </p>
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
