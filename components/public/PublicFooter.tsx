import Link from "next/link";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Free Trial", href: "/pricing" },
    { label: "Changelog", href: "/about" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Meld Techo", href: "http://meldtecho.com/", external: true },
    { label: "Contact", href: "/contact" },
    { label: "Super Admin Login", href: "/superAdmin" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
    { label: "GST Compliance", href: "/features" },
  ],
};

export default function PublicFooter() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,#1957bc,#c14408)" }}>
                <span className="material-icons text-white text-lg">receipt_long</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-extrabold tracking-tight text-white">BillForge</span>
                <span className="text-[10px] font-medium tracking-widest uppercase text-gray-500">by Meld Techo</span>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              India&apos;s smartest GST billing platform. Built for Indian businesses — fast, compliant, and beautifully simple.
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm">
              <a href="tel:+919311066483" className="flex items-center gap-2 hover:text-white transition-colors">
                <span className="material-icons text-base text-[#c14408]">phone</span>
                +91 93110 66483
              </a>
              <a href="http://meldtecho.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <span className="material-icons text-base text-[#1957bc]">language</span>
                meldtecho.com
              </a>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{heading}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} BillForge by{" "}
              <a href="http://meldtecho.com/" target="_blank" rel="noopener noreferrer" className="text-[#1957bc] hover:underline">
                Meld Techo
              </a>
              . All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="material-icons text-sm text-green-500">verified</span>
                GST Compliant
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-icons text-sm text-[#1957bc]">lock</span>
                SSL Secured
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-icons text-sm text-[#c14408]">currency_rupee</span>
                India Made
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
