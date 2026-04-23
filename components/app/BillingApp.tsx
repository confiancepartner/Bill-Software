"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import OverviewModule from "@/components/modules/OverviewModule";
import InvoicesModule from "@/components/modules/InvoicesModule";
import PurchasesModule from "@/components/modules/PurchasesModule";
import ReportsModule from "@/components/modules/ReportsModule";
import AdminModule from "@/components/modules/AdminModule";
import CustomersModule from "@/components/modules/CustomersModule";
import VendorsModule from "@/components/modules/VendorsModule";
import InventoryModule from "@/components/modules/InventoryModule";
import POSModule from "@/components/modules/POSModule";
import CashBankModule from "@/components/modules/CashBankModule";
import RecurringModule from "@/components/modules/RecurringModule";
import { apiClient } from "@/lib/api-client";
import type {
  BootstrapPayload,
  BranchSavePayload,
  CompanySavePayload,
  InvoiceSavePayload,
  PurchaseSavePayload,
  UserSavePayload,
} from "@/lib/types";

type ModuleKey =
  | "overview"
  | "invoices"
  | "purchases"
  | "customers"
  | "vendors"
  | "inventory"
  | "pos"
  | "cashBank"
  | "recurring"
  | "reports"
  | "admin";

interface BillingAppProps {
  tenantSlug?: string | null;
  tenantName?: string | null;
}

export default function BillingApp({ tenantSlug, tenantName }: BillingAppProps) {
  const [bootstrap, setBootstrap] = useState<BootstrapPayload | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleKey>("overview");
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const loadBootstrap = async (companyId?: number | null, branchId?: number | null) => {
    setLoading(true);
    try {
      const payload = await apiClient.bootstrap(companyId, branchId);
      setBootstrap(payload);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load data");
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    apiClient
      .me()
      .then((resp) => {
        if (resp.user.role === "super_admin") {
          window.location.href = "/superAdmin";
          return;
        }
        return loadBootstrap();
      })
      .catch(() => {
        setBootstrap(null);
        setLoading(false);
        setAuthChecked(true);
      });
  }, []);

  const modules = useMemo(() => {
    const role = bootstrap?.currentUser.role;
    const base = [
      { key: "overview", label: "Overview", description: "Dashboard snapshot" },
      { key: "invoices", label: "Invoices", description: "GST sales invoices" },
      { key: "purchases", label: "Purchases", description: "Vendor bills & GST inputs" },
      { key: "pos", label: "POS Billing", description: "Point-of-sale quick bills" },
      { key: "inventory", label: "Inventory", description: "Products, godowns & stock" },
      { key: "cashBank", label: "Cash & Bank", description: "Accounts & transactions" },
      { key: "recurring", label: "Recurring", description: "Auto-billing schedules" },
      { key: "customers", label: "Customers", description: "Customer address book" },
      { key: "vendors", label: "Vendors", description: "Vendor/supplier address book" },
      { key: "reports", label: "Reports", description: "GST & financial reporting" },
    ];
    if (role === "admin") {
      base.push({ key: "admin", label: "Admin", description: "Company, branch & staff" });
    }
    return base as { key: ModuleKey; label: string; description: string }[];
  }, [bootstrap?.currentUser.role]);

  useEffect(() => {
    if (!modules.some((m) => m.key === activeModule)) {
      setActiveModule(modules[0]?.key || "overview");
    }
  }, [activeModule, modules]);

  if (!authChecked || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-6 text-sm text-gray-500 shadow-sm">
          Loading workspace...
        </div>
      </div>
    );
  }

  if (!bootstrap) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0e7ff,_#f8fafc_55%)] px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl bg-slate-950 p-8 text-white shadow-2xl">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-indigo-200">
              {tenantName ? tenantName : "BillForge"}
            </p>
            <h1 className="max-w-xl text-4xl font-bold leading-tight">Your Company Dashboard</h1>
            <p className="mt-5 max-w-2xl text-sm text-slate-300 sm:text-base">
              GST invoicing, purchase tracking, multi-branch management and reports — all in one place.
            </p>
            {tenantSlug && (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
                Workspace: <span className="font-mono text-indigo-300">{tenantSlug}</span>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">Secure Login</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Sign in to your workspace</h2>
            </div>
            <form
              className="space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                const fd = new FormData(event.currentTarget);
                const email = String(fd.get("email") || "");
                const password = String(fd.get("password") || "");
                setLoginLoading(true);
                setError(null);
                try {
                  const resp = await apiClient.login({ email, password, panel: "tenant" });
                  if (resp.user.role === "super_admin") {
                    window.location.href = "/superAdmin";
                    return;
                  }
                  await loadBootstrap();
                } catch (loginError) {
                  setError(loginError instanceof Error ? loginError.message : "Login failed");
                } finally {
                  setLoginLoading(false);
                }
              }}
            >
              <div>
                <label className="form-label" htmlFor="email">Email</label>
                <input id="email" name="email" className="form-input" type="email" required />
              </div>
              <div>
                <label className="form-label" htmlFor="password">Password</label>
                <input id="password" name="password" className="form-input" type="password" required />
              </div>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}
              <button className="btn btn-primary w-full" disabled={loginLoading}>
                {loginLoading ? "Signing in..." : "Login"}
              </button>
            </form>
            <div className="mt-6 text-center">
              <a href="/" className="text-xs text-gray-400 hover:text-gray-600">← Back to homepage</a>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const selectedCompany = bootstrap.companies.find((c) => c.id === bootstrap.selectedCompanyId) || null;
  const selectedBranch = bootstrap.branches.find((b) => b.id === bootstrap.selectedBranchId) || null;

  const refresh = async () => {
    await loadBootstrap(bootstrap.selectedCompanyId, bootstrap.selectedBranchId);
  };

  const renderModule = () => {
    switch (activeModule) {
      case "overview":
        return (
          <OverviewModule
            reports={bootstrap.reports}
            invoices={bootstrap.invoices}
            purchases={bootstrap.purchases}
            onNavigate={(mod) => setActiveModule(mod as ModuleKey)}
          />
        );
      case "invoices":
        return (
          <InvoicesModule
            invoices={bootstrap.invoices}
            company={selectedCompany}
            branch={selectedBranch}
            customers={bootstrap.customers || []}
            onSave={async (payload: InvoiceSavePayload) => {
              await apiClient.saveInvoice(payload);
              await refresh();
            }}
            onRefresh={refresh}
          />
        );
      case "purchases":
        return (
          <PurchasesModule
            purchases={bootstrap.purchases}
            company={selectedCompany}
            branch={selectedBranch}
            vendors={bootstrap.vendors || []}
            onSave={async (payload: PurchaseSavePayload) => {
              await apiClient.savePurchase(payload);
              await refresh();
            }}
          />
        );
      case "pos":
        return <POSModule company={selectedCompany} branch={selectedBranch} />;
      case "inventory":
        return <InventoryModule company={selectedCompany} />;
      case "cashBank":
        return <CashBankModule company={selectedCompany} />;
      case "recurring":
        return <RecurringModule company={selectedCompany} branch={selectedBranch} />;
      case "customers":
        return (
          <CustomersModule
            customers={bootstrap.customers || []}
            company={selectedCompany}
            onRefresh={refresh}
          />
        );
      case "vendors":
        return (
          <VendorsModule
            vendors={bootstrap.vendors || []}
            company={selectedCompany}
            onRefresh={refresh}
          />
        );
      case "reports":
        return <ReportsModule reports={bootstrap.reports} invoices={bootstrap.invoices} purchases={bootstrap.purchases} />;
      case "admin":
        return (
          <AdminModule
            company={selectedCompany}
            branches={bootstrap.branches}
            users={bootstrap.users}
            currentSubscription={bootstrap.currentSubscription || null}
            onSaveCompany={async (payload: CompanySavePayload) => {
              await apiClient.saveCompany(payload);
              await refresh();
            }}
            onSaveBranch={async (payload: BranchSavePayload) => {
              await apiClient.saveBranch(payload);
              await refresh();
            }}
            onSaveUser={async (payload: UserSavePayload) => {
              await apiClient.saveUser(payload);
              await refresh();
            }}
            onRefresh={refresh}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={bootstrap.currentUser}
        companies={bootstrap.companies}
        branches={bootstrap.branches}
        selectedCompanyId={bootstrap.selectedCompanyId}
        selectedBranchId={bootstrap.selectedBranchId}
        onCompanyChange={(companyId) => loadBootstrap(companyId, null)}
        onBranchChange={(branchId) => loadBootstrap(bootstrap.selectedCompanyId, branchId)}
        onLogout={async () => {
          await apiClient.logout();
          setBootstrap(null);
        }}
      />
      <main className="mx-auto grid max-w-7xl gap-6 px-3 py-6 sm:px-4 lg:grid-cols-[260px_1fr] lg:px-8">
        <Sidebar
          modules={modules}
          activeModule={activeModule}
          onChange={(moduleKey) => setActiveModule(moduleKey as ModuleKey)}
        />
        <div className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          {renderModule()}
        </div>
      </main>
    </div>
  );
}
