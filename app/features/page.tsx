import type { Metadata } from "next";
import Link from "next/link";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Features — BillForge | GST Billing Software for India",
  description:
    "Explore all BillForge features: GST-compliant invoicing, multi-branch management, role-based access, purchase tracking, real-time reports, and more. Built for Indian businesses.",
  keywords: ["GST invoice features", "billing software India", "multi-branch GST", "invoice management", "purchase tracking India"],
  openGraph: {
    title: "Features — BillForge | GST Billing Software",
    description: "Everything Indian businesses need: GST invoices, branch management, reports, and more.",
    type: "website",
  },
};

const FEATURE_SECTIONS = [
  {
    icon: "receipt_long",
    color: "#1957bc",
    title: "GST-Compliant Invoicing",
    tagline: "Professional invoices that pass every GST audit.",
    points: [
      "Automatic CGST, SGST, and IGST calculation based on supply type",
      "HSN/SAC code support for all product and service categories",
      "One-click PDF generation with company letterhead and signature",
      "Invoice numbering with custom prefix/suffix per branch",
      "Credit notes, debit notes, and revised invoice support",
      "E-invoice ready (IRN/QR integration)",
    ],
  },
  {
    icon: "store",
    color: "#c14408",
    title: "Multi-Branch Management",
    tagline: "Scale across cities without losing control.",
    points: [
      "Add unlimited branches to a single company account",
      "Each branch has its own invoice series and books",
      "Central dashboard with cross-branch consolidated reports",
      "Branch-level user assignments and permissions",
      "Separate GSTIN support for multiple registration states",
      "Switch branches in one click from the sidebar",
    ],
  },
  {
    icon: "group",
    color: "#1957bc",
    title: "Team & Role Management",
    tagline: "Give your team exactly the access they need.",
    points: [
      "Two roles: Admin (full access) and Staff (restricted)",
      "Staff users are scoped to their assigned branch only",
      "Admins can view and manage all branches",
      "Invite users by email with password setup",
      "Disable or reactivate users without deleting records",
      "Audit trail — see who created or modified invoices",
    ],
  },
  {
    icon: "bar_chart",
    color: "#c14408",
    title: "Reports & Analytics",
    tagline: "Know your business numbers at a glance.",
    points: [
      "Sales summary with monthly and annual comparison",
      "Tax collected vs tax paid — net GST position",
      "Purchase vs sales ratio reports",
      "Top customers and vendors by volume",
      "Branch-wise performance comparison",
      "Export reports to Excel and PDF",
    ],
  },
  {
    icon: "shopping_bag",
    color: "#1957bc",
    title: "Purchase Tracking",
    tagline: "Manage input tax credits with confidence.",
    points: [
      "Record vendor purchase bills with full GST breakdown",
      "Input tax credit (ITC) tracking per tax category",
      "Payable aging reports — never miss a payment",
      "Vendor master with GSTIN verification",
      "Link purchases to cost centers and branches",
      "Reconcile purchases against GSTR-2A/2B",
    ],
  },
  {
    icon: "lock",
    color: "#c14408",
    title: "Security & Privacy",
    tagline: "Your data is yours — always encrypted, always isolated.",
    points: [
      "Full multi-tenant data isolation — one DB per client",
      "JWT auth with HTTP-only secure cookies",
      "bcrypt password hashing (industry standard)",
      "HTTPS enforced in production",
      "No third-party data sharing or ad tracking",
      "Regular automated database backups",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicNav />

      <main>
        <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0d1f52,#1957bc)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #c14408, transparent 60%)" }} />
          <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 text-center">
            <span className="inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-4"
              style={{ backgroundColor: "#c14408", color: "white" }}>
              Features
            </span>
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Built for every Indian
              <br />
              <span style={{ color: "#f5a474" }}>GST-registered business</span>
            </h1>
            <p className="mt-5 text-lg text-blue-100 max-w-2xl mx-auto">
              From small traders to large enterprises — BillForge covers every billing workflow with full GST compliance built in from the ground up.
            </p>
            <Link
              href="/pricing"
              className="mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white shadow-xl hover:opacity-90 transition-all"
              style={{ backgroundColor: "#c14408" }}
            >
              <span className="material-icons">rocket_launch</span>
              Start 15-Day Free Trial
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {FEATURE_SECTIONS.map((section, index) => (
              <div
                key={section.title}
                className={`flex flex-col gap-10 md:flex-row md:items-center ${index % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
              >
                <div className="flex-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg mb-5"
                    style={{ backgroundColor: section.color }}>
                    <span className="material-icons text-2xl">{section.icon}</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-900">{section.title}</h2>
                  <p className="mt-2 text-base font-medium" style={{ color: section.color }}>{section.tagline}</p>
                  <ul className="mt-5 space-y-3">
                    {section.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="material-icons text-base mt-0.5 flex-shrink-0" style={{ color: section.color }}>check_circle</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <div className="rounded-2xl p-10 flex items-center justify-center min-h-[200px] shadow-inner"
                    style={{ backgroundColor: section.color + "10", border: `1px solid ${section.color}25` }}>
                    <span className="material-icons text-8xl opacity-20" style={{ color: section.color }}>{section.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8" style={{ backgroundColor: "#f8faff" }}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Ready to see it in action?</h2>
            <p className="mt-3 text-gray-500">Start your 15-day free trial — no credit card, no commitment.</p>
            <div className="mt-7 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white hover:opacity-90"
                style={{ backgroundColor: "#c14408" }}>
                <span className="material-icons text-base">rocket_launch</span> Start Free Trial
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border-2 px-8 py-3.5 text-sm font-bold hover:bg-blue-50"
                style={{ borderColor: "#1957bc", color: "#1957bc" }}>
                <span className="material-icons text-base">phone</span> Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
