"use client";
import { useState } from "react";
import Link from "next/link";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";

const CONTACT_INFO = [
  {
    icon: "phone",
    color: "#c14408",
    title: "Call Us",
    line1: "+91 93110 66483",
    line2: "Mon–Sat, 9 AM – 7 PM IST",
    href: "tel:+919311066483",
    linkLabel: "Call Now",
  },
  {
    icon: "language",
    color: "#1957bc",
    title: "Company Website",
    line1: "meldtecho.com",
    line2: "Explore Meld Techo products",
    href: "http://meldtecho.com/",
    linkLabel: "Visit Website",
  },
  {
    icon: "email",
    color: "#c14408",
    title: "Email Support",
    line1: "support@meldtecho.com",
    line2: "We reply within 24 business hours",
    href: "mailto:support@meldtecho.com",
    linkLabel: "Send Email",
  },
  {
    icon: "location_on",
    color: "#1957bc",
    title: "Headquarters",
    line1: "India",
    line2: "Serving businesses nationwide",
    href: null,
    linkLabel: null,
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 1000));
    setStatus("sent");
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicNav />

      <main>
        <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0d1f52,#1957bc)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #c14408, transparent 60%)" }} />
          <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 text-center">
            <span className="inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-4"
              style={{ backgroundColor: "#c14408", color: "white" }}>
              Contact
            </span>
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              We&apos;re here to help
            </h1>
            <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
              Have questions about BillForge? Want a demo? Reach out to our team — we respond quickly.
            </p>
            <a
              href="tel:+919311066483"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-base font-bold shadow-xl hover:bg-orange-50 transition-all"
              style={{ color: "#c14408" }}
            >
              <span className="material-icons text-xl">phone</span>
              +91 93110 66483
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-16">
            {CONTACT_INFO.map((info) => (
              <div key={info.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center hover:shadow-md transition-all">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow"
                  style={{ backgroundColor: info.color }}>
                  <span className="material-icons text-xl">{info.icon}</span>
                </div>
                <h3 className="font-bold text-gray-900">{info.title}</h3>
                <p className="mt-1 text-sm font-semibold text-gray-700">{info.line1}</p>
                <p className="text-xs text-gray-400 mt-0.5">{info.line2}</p>
                {info.href && info.linkLabel && (
                  <a
                    href={info.href}
                    target={info.href.startsWith("http") ? "_blank" : undefined}
                    rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                    style={{ color: info.color }}
                  >
                    {info.linkLabel} <span className="material-icons text-sm">arrow_forward</span>
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Send us a message</h2>
              <p className="mt-2 text-gray-500">We&apos;ll get back to you within 24 business hours.</p>

              {status === "sent" ? (
                <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
                  <span className="material-icons text-4xl text-green-500 block mb-3">check_circle</span>
                  <h3 className="text-lg font-bold text-green-800">Message sent!</h3>
                  <p className="mt-2 text-sm text-green-700">Thank you for reaching out. We&apos;ll respond within 24 hours.</p>
                  <button
                    onClick={() => { setStatus("idle"); setForm({ name: "", email: "", phone: "", company: "", subject: "", message: "" }); }}
                    className="mt-5 rounded-xl px-6 py-2.5 text-sm font-bold text-white hover:opacity-90"
                    style={{ backgroundColor: "#1957bc" }}
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="form-label">Your Name *</label>
                      <input className="form-input" placeholder="Rajesh Sharma" required value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label">Email *</label>
                      <input className="form-input" type="email" placeholder="you@company.com" required value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="form-label">Phone</label>
                      <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label">Company Name</label>
                      <input className="form-input" placeholder="Acme Corp" value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Subject</label>
                    <select className="form-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                      <option value="">Select a topic...</option>
                      <option>Demo Request</option>
                      <option>Pricing Inquiry</option>
                      <option>Technical Support</option>
                      <option>Enterprise Sales</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Message *</label>
                    <textarea
                      className="form-input resize-none"
                      rows={5}
                      placeholder="Tell us how we can help you..."
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-lg hover:opacity-90 disabled:opacity-60 transition-all"
                    style={{ backgroundColor: "#c14408" }}
                  >
                    {status === "sending" ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8">
                <h3 className="text-xl font-extrabold text-gray-900 mb-4">Frequently asked before contacting</h3>
                <div className="space-y-5">
                  {[
                    { q: 'How do I start my trial?', a: 'Click Start Free Trial on the pricing page, fill in your company details, and your account is live in minutes.' },
                    { q: "Do I need a credit card?", a: "No. The 15-day trial is completely free. Payment is only required after the trial ends if you wish to continue." },
                    { q: "Can I get a product demo?", a: "Yes — call +91 93110 66483 or send us a message and we'll schedule a live demo at your convenience." },
                  ].map((item) => (
                    <div key={item.q}>
                      <p className="font-semibold text-sm text-gray-900">{item.q}</p>
                      <p className="mt-1 text-sm text-gray-500">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-8 text-white"
                style={{ background: "linear-gradient(135deg,#1957bc,#0d3a8a)" }}>
                <span className="material-icons text-4xl text-blue-200 mb-4 block">headset_mic</span>
                <h3 className="text-xl font-extrabold">Need immediate help?</h3>
                <p className="mt-2 text-sm text-blue-100">Call our support line directly. We pick up Mon–Sat, 9 AM to 7 PM IST.</p>
                <a
                  href="tel:+919311066483"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold hover:bg-blue-50 transition-all"
                  style={{ color: "#1957bc" }}
                >
                  <span className="material-icons text-base">phone</span>
                  +91 93110 66483
                </a>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-600">
                  Ready to get started without waiting?
                </p>
                <Link href="/pricing"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-all"
                  style={{ backgroundColor: "#c14408" }}>
                  <span className="material-icons text-base">rocket_launch</span>
                  Start 15-Day Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
