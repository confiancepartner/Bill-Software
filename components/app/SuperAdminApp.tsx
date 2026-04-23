"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import SuperAdminModule from "@/components/modules/SuperAdminModule";
import type {
  BootstrapPayload,
  BranchSavePayload,
  ClientAccount,
  ClientSavePayload,
  SubscriptionRecord,
  SubscriptionSavePayload,
} from "@/lib/types";

export default function SuperAdminApp() {
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [bootstrapData, setBootstrapData] = useState<BootstrapPayload | null>(null);
  const [email, setEmail] = useState("superadmin@billforge.local");
  const [password, setPassword] = useState("Admin@123");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const payload = await apiClient.bootstrap();
      setBootstrapData(payload);
      setLoggedIn(true);
    } catch {
      setLoggedIn(false);
    } finally {
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    apiClient
      .me()
      .then((resp) => {
        if (resp.user.role !== "super_admin") {
          setAuthChecked(true);
          setLoggedIn(false);
          return;
        }
        return loadData();
      })
      .catch(() => {
        setAuthChecked(true);
        setLoggedIn(false);
      });
  }, []);

  const handleLogin = async () => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      const resp = await apiClient.login({ email, password, panel: "superadmin" });
      if (resp.user.role !== "super_admin") {
        throw new Error("Access denied. Super Admin credentials required.");
      }
      await loadData();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await apiClient.logout();
    setLoggedIn(false);
    setBootstrapData(null);
  };

  const refresh = async () => {
    try {
      const payload = await apiClient.bootstrap();
      setBootstrapData(payload);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to refresh");
    }
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-6 text-sm text-slate-300">
          Loading...
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="material-icons text-2xl text-indigo-400">admin_panel_settings</span>
              <span className="text-xl font-bold text-white">BillForge</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Super Admin Login</h1>
            <p className="mt-1 text-sm text-slate-400">
              Restricted to software owner only
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>

            {loginError && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {loginError}
              </div>
            )}

            <button
              disabled={loginLoading}
              onClick={handleLogin}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>

            <div className="mt-6 text-center">
              <a href="/" className="text-xs text-slate-500 hover:text-slate-300">
                ← Back to homepage
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const clients: ClientAccount[] = bootstrapData?.clients || [];
  const subscriptions: SubscriptionRecord[] = bootstrapData?.subscriptions || [];
  const currentUser = bootstrapData?.currentUser;

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const trialClients = clients.filter((c) => c.status === "trial").length;
  const suspendedClients = clients.filter((c) => c.status === "suspended").length;
  const activeSubscriptions = subscriptions.filter((s) => s.status === "active").length;

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="material-icons text-indigo-400">admin_panel_settings</span>
            <div>
              <p className="text-sm font-bold text-white">BillForge</p>
              <p className="text-xs text-slate-400">Super Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-400 sm:block">
              {currentUser?.fullName}
            </span>
            <a
              href="/"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
            >
              View Public Site
            </a>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/30"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        {loadError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {loadError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total Clients", value: totalClients, icon: "group", color: "text-blue-400" },
            { label: "Active", value: activeClients, icon: "check_circle", color: "text-green-400" },
            { label: "Trial", value: trialClients, icon: "access_time", color: "text-amber-400" },
            { label: "Suspended", value: suspendedClients, icon: "block", color: "text-red-400" },
            { label: "Active Subs", value: activeSubscriptions, icon: "receipt_long", color: "text-indigo-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                <span className={`material-icons text-base ${stat.color}`}>{stat.icon}</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Client Accounts</h2>
          {clients.length === 0 ? (
            <p className="text-sm text-slate-400">No clients yet. Add one below.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs font-medium text-slate-400">
                    <th className="pb-3 pr-4">Client / Company</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Subdomain</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-white">{client.clientName}</div>
                        <div className="text-xs text-slate-400">{client.companyName}</div>
                      </td>
                      <td className="py-3 pr-4 text-slate-300">{client.contactEmail}</td>
                      <td className="py-3 pr-4">
                        {client.subdomain ? (
                          <span className="rounded bg-indigo-900/50 px-2 py-0.5 font-mono text-xs text-indigo-300">
                            {client.subdomain}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            client.status === "active"
                              ? "bg-green-900/40 text-green-400"
                              : client.status === "trial"
                              ? "bg-amber-900/40 text-amber-400"
                              : "bg-red-900/40 text-red-400"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {client.subdomain && (
                          <a
                            href={`/?tenant=${encodeURIComponent(client.subdomain)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-400 hover:underline"
                          >
                            Preview Panel →
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white p-6">
          <SuperAdminModule
            clients={clients}
            subscriptions={subscriptions}
            onSaveClient={async (payload: ClientSavePayload) => {
              await apiClient.saveClient(payload);
              await refresh();
            }}
            onSaveSubscription={async (payload: SubscriptionSavePayload) => {
              await apiClient.saveSubscription(payload);
              await refresh();
            }}
          />
        </div>
      </main>
    </div>
  );
}
