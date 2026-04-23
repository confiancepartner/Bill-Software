"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TenantLoginModal from "@/components/public/TenantLoginModal";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function PublicNav({ onStartTrial }: { onStartTrial?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg,#1957bc,#c14408)" }}
            >
              <span className="material-icons text-white text-lg">receipt_long</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-extrabold tracking-tight text-gray-900 group-hover:text-[#1957bc] transition-colors">
                BillForge
              </span>
              <span className="text-[10px] font-medium text-gray-400 tracking-widest uppercase">
                by Meld Techo
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[#1957bc] ${
                  pathname === link.href
                    ? "text-[#1957bc] font-semibold"
                    : "text-gray-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={() => setLoginOpen(true)}
              className="text-sm font-semibold border border-[#1957bc] text-[#1957bc] rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors"
            >
              Login
            </button>
            {onStartTrial ? (
              <button
                onClick={onStartTrial}
                className="text-sm font-semibold text-white rounded-lg px-5 py-2 shadow-md hover:opacity-90 transition-all"
                style={{ backgroundColor: "#c14408" }}
              >
                Start Free Trial
              </button>
            ) : (
              <Link
                href="/pricing"
                className="text-sm font-semibold text-white rounded-lg px-5 py-2 shadow-md hover:opacity-90 transition-all"
                style={{ backgroundColor: "#c14408" }}
              >
                Start Free Trial
              </Link>
            )}
          </div>

          <button
            className="lg:hidden flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-icons">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 pb-5 pt-3 lg:hidden">
            <nav className="mb-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-blue-50 hover:text-[#1957bc] ${
                    pathname === link.href
                      ? "bg-blue-50 text-[#1957bc] font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setMenuOpen(false); setLoginOpen(true); }}
                className="w-full text-center text-sm font-semibold border border-[#1957bc] text-[#1957bc] rounded-lg px-4 py-2.5"
              >
                Login
              </button>
              {onStartTrial ? (
                <button
                  onClick={() => { setMenuOpen(false); onStartTrial(); }}
                  className="w-full text-center text-sm font-semibold text-white rounded-lg px-4 py-2.5"
                  style={{ backgroundColor: "#c14408" }}
                >
                  Start Free Trial
                </button>
              ) : (
                <Link
                  href="/pricing"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center text-sm font-semibold text-white rounded-lg px-4 py-2.5"
                  style={{ backgroundColor: "#c14408" }}
                >
                  Start Free Trial
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {loginOpen && <TenantLoginModal onClose={() => setLoginOpen(false)} />}
    </>
  );
}
