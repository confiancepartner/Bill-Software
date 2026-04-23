"use client";

import { useState } from "react";

interface LoginCardProps {
  loading: boolean;
  error: string | null;
  onSubmit: (payload: { email: string; password: string }) => Promise<void>;
}

export default function LoginCard({
  loading,
  error,
  onSubmit,
}: LoginCardProps) {
  const [email, setEmail] = useState("superadmin@billforge.local");
  const [password, setPassword] = useState("Admin@123");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0e7ff,_#f8fafc_55%)] px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl bg-slate-950 p-8 text-white shadow-2xl">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-indigo-200">
            BillForge SaaS MVP
          </p>
          <h1 className="max-w-xl text-4xl font-bold leading-tight">
            Multi-company GST billing with invoices, purchases, reports, and a
            super admin panel.
          </h1>
          <p className="mt-5 max-w-2xl text-sm text-slate-300 sm:text-base">
            This launch-ready MVP keeps the familiar BillForge experience on the
            frontend while moving the product to a real Node.js, Express, MySQL,
            and JWT-based SaaS foundation.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              "JWT auth with role-based access",
              "Company and branch-aware billing",
              "cPanel-friendly single Node entrypoint",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            Demo login seeds:
            <div className="mt-2 font-mono text-xs text-emerald-50">
              superadmin@billforge.local / Admin@123
            </div>
            <div className="font-mono text-xs text-emerald-50">
              admin@billforge.local / Admin@123
            </div>
            <div className="font-mono text-xs text-emerald-50">
              staff@billforge.local / Admin@123
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
              Secure Login
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Sign in to your workspace
            </h2>
          </div>

          <form
            className="space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              await onSubmit({ email, password });
            }}
          >
            <div>
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="form-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="form-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button className="btn btn-primary w-full" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
