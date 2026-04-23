"use client";
import { useState } from "react";

export default function TenantLoginModal({ onClose }: { onClose: () => void }) {
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const trimmed = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!trimmed) {
      setError("Please enter your company workspace name.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tenant?tenant=${encodeURIComponent(trimmed)}`, { credentials: "include" });
      const info = await res.json();
      if (info.mode === "tenant" && info.tenantSlug) {
        window.location.href = `/?tenant=${encodeURIComponent(info.tenantSlug)}`;
      } else {
        setError("No workspace found with that name. Please check and try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">Login to your workspace</h3>
            <p className="text-xs text-gray-400 mt-0.5">Enter your company workspace name to continue</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
            <span className="material-icons text-base">close</span>
          </button>
        </div>

        <div className="px-6 py-6">
          <label className="form-label">Company Workspace Name</label>
          <div className="flex items-center gap-2 mt-1">
            <input
              className="form-input flex-1"
              placeholder="e.g. acme-corp"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoFocus
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            This is the workspace name you chose when registering.
          </p>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <span className="material-icons text-base">error_outline</span>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-5 w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 disabled:opacity-60 transition-all"
            style={{ backgroundColor: "#1957bc" }}
          >
            {loading ? "Checking..." : "Go to My Workspace"}
          </button>

          <div className="mt-4 border-t border-gray-100 pt-4 text-center">
            <p className="text-xs text-gray-400">Are you the software owner?</p>
            <a
              href="/superAdmin"
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
              style={{ color: "#c14408" }}
            >
              <span className="material-icons text-sm">admin_panel_settings</span>
              Super Admin Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
