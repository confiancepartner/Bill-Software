import type { Metadata } from "next";
import Link from "next/link";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "About — BillForge | A Product of Meld Techo",
  description:
    "BillForge is an enterprise GST billing SaaS built by Meld Techo, an Indian software company dedicated to building tools for Indian businesses. Learn our story, mission, and values.",
  keywords: ["Meld Techo", "about BillForge", "Indian billing software company", "GST software India"],
  openGraph: {
    title: "About BillForge — by Meld Techo",
    description: "Built in India, for India. BillForge is Meld Techo's flagship GST billing platform.",
    type: "website",
  },
};

const VALUES = [
  { icon: "flag", title: "Made for India", desc: "Designed from the ground up for Indian GST laws, HSN codes, and business workflows — not adapted from foreign software." },
  { icon: "security", title: "Data Privacy First", desc: "Your business data is yours. Full multi-tenant isolation, no third-party sharing, and HTTPS-only access in production." },
  { icon: "support_agent", title: "Human Support", desc: "Real people answer your calls. Reach us on +91 93110 66483 — no bots, no ticketing queues for critical issues." },
  { icon: "trending_up", title: "Constant Innovation", desc: "We ship new features regularly based on customer feedback. You grow — we build the tools to match." },
];

const MILESTONES = [
  { year: "2022", event: "Meld Techo founded — building digital solutions for Indian SMEs." },
  { year: "2023", event: "BillForge concept born — after seeing GST billing pain firsthand at Indian businesses." },
  { year: "2024", event: "Beta launch: 50 businesses onboarded, core invoicing and multi-branch features shipped." },
  { year: "2025", event: "Multi-tenant SaaS relaunch with dedicated subdomains, Razorpay integration, and full GST suite." },
  { year: "2026", event: "500+ businesses served, expanding features: e-invoice, GSTR reconciliation, mobile app." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicNav />

      <main>
        <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0d1f52,#1957bc)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #c14408, transparent 60%)" }} />
          <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 text-center">
            <span className="inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-4"
              style={{ backgroundColor: "#c14408", color: "white" }}>
              About Us
            </span>
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Built in India,
              <br />
              <span style={{ color: "#f5a474" }}>for Indian businesses</span>
            </h1>
            <p className="mt-5 text-lg text-blue-100 max-w-2xl mx-auto">
              BillForge is a flagship product of <strong className="text-white">Meld Techo</strong> — an Indian software company on a mission to give every GST-registered business a modern, affordable billing tool.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Our Story</h2>
              <div className="mt-5 space-y-4 text-base text-gray-600 leading-relaxed">
                <p>
                  When GST was introduced in India, millions of businesses scrambled to update their billing. Most turned to clunky desktop software or complex spreadsheets. We saw a better way.
                </p>
                <p>
                  <strong className="text-gray-900">Meld Techo</strong> was founded to build practical, modern software for Indian businesses — not just to digitise existing workflows, but to genuinely improve them.
                </p>
                <p>
                  BillForge was born from a simple question: <em>&ldquo;Why can&apos;t every Indian business have a billing tool as polished and reliable as the best global SaaS products?&rdquo;</em>
                </p>
                <p>
                  Today, we serve 500+ businesses across India — from small traders in Tier-2 cities to multi-branch enterprises in Mumbai, Delhi, and Bengaluru.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="http://meldtecho.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white hover:opacity-90"
                  style={{ backgroundColor: "#1957bc" }}
                >
                  <span className="material-icons text-base">language</span> Visit Meld Techo
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-bold hover:bg-blue-50"
                  style={{ borderColor: "#1957bc", color: "#1957bc" }}
                >
                  <span className="material-icons text-base">phone</span> Contact Us
                </Link>
              </div>
            </div>
            <div className="rounded-2xl p-10 flex items-center justify-center min-h-[280px]"
              style={{ background: "linear-gradient(135deg,#f0f4ff,#e8edff)", border: "1px solid #c7d5f7" }}>
              <div className="text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl mx-auto shadow-xl"
                  style={{ background: "linear-gradient(135deg,#1957bc,#c14408)" }}>
                  <span className="material-icons text-white text-4xl">receipt_long</span>
                </div>
                <div className="mt-5 text-2xl font-extrabold text-gray-900">BillForge</div>
                <div className="text-sm text-gray-500 mt-1">A product of</div>
                <a href="http://meldtecho.com/" target="_blank" rel="noopener noreferrer"
                  className="mt-1 block text-lg font-extrabold hover:underline" style={{ color: "#1957bc" }}>
                  Meld Techo
                </a>
                <div className="mt-4 text-xs text-gray-400">🇮🇳 Proudly made in India</div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8" style={{ backgroundColor: "#f8faff" }}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Our Values</h2>
              <p className="mt-2 text-gray-500">What guides every decision we make at Meld Techo.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v, i) => (
                <div key={v.title} className="rounded-2xl bg-white border border-gray-100 p-6 hover:shadow-md transition-all">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow"
                    style={{ backgroundColor: i % 2 === 0 ? "#1957bc" : "#c14408" }}>
                    <span className="material-icons text-xl">{v.icon}</span>
                  </div>
                  <h3 className="font-extrabold text-gray-900">{v.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Our Journey</h2>
            <p className="mt-2 text-gray-500">From idea to India&apos;s trusted GST billing platform.</p>
          </div>
          <div className="relative">
            <div className="absolute left-5 top-0 h-full w-0.5 bg-gradient-to-b from-[#1957bc] to-[#c14408] md:left-1/2" />
            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <div key={m.year} className={`relative flex gap-6 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? "md:pr-10 md:text-right" : "md:pl-10"} pl-12 md:pl-0`}>
                    <div className={`rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-all ${i % 2 === 0 ? "md:ml-auto md:mr-0" : ""}`}
                      style={{ maxWidth: "340px", borderColor: i % 2 === 0 ? "#1957bc30" : "#c1440830" }}>
                      <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: i % 2 === 0 ? "#1957bc" : "#c14408" }}>{m.year}</span>
                      <p className="mt-1 text-sm text-gray-600">{m.event}</p>
                    </div>
                  </div>
                  <div className="absolute left-3 flex h-5 w-5 items-center justify-center rounded-full md:left-1/2 md:-translate-x-1/2 md:top-5"
                    style={{ backgroundColor: i % 2 === 0 ? "#1957bc" : "#c14408", top: "1.25rem" }}>
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <div className="hidden flex-1 md:block" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8" style={{ background: "linear-gradient(135deg,#c14408,#a33506)" }}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold text-white">Join our growing community</h2>
            <p className="mt-3 text-orange-100">Start your 15-day free trial and see why 500+ businesses choose BillForge.</p>
            <div className="mt-7 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold shadow-xl hover:bg-orange-50 transition-all"
                style={{ color: "#c14408" }}>
                <span className="material-icons text-base">rocket_launch</span> Start Free Trial
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-all">
                <span className="material-icons text-base">mail</span> Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
