"use client";

import type { InvoiceRecord, PurchaseRecord, ReportSummary } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OverviewModuleProps {
  reports: ReportSummary;
  invoices: InvoiceRecord[];
  purchases: PurchaseRecord[];
  onNavigate?: (module: string) => void;
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${accent ? "border-l-4" : ""}`} style={accent ? { borderLeftColor: accent } : {}}>
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

export default function OverviewModule({ reports, invoices, purchases, onNavigate }: OverviewModuleProps) {
  const recentInvoices = invoices.slice(0, 5);
  const recentPurchases = purchases.slice(0, 5);

  const netTaxPositionColor = reports.netTaxPosition >= 0 ? "#16a34a" : "#dc2626";

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: "bg-gray-100 text-gray-500",
      sent: "bg-blue-50 text-blue-700",
      paid: "bg-green-50 text-green-700",
      cancelled: "bg-red-50 text-red-500",
    };
    return map[status] || "bg-gray-100 text-gray-500";
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Sales" value={formatCurrency(reports.totalSales)} sub={`${reports.invoiceCount} invoice(s)`} accent="#1957bc" />
        <KpiCard label="Total Purchases" value={formatCurrency(reports.totalPurchases)} sub={`${reports.purchaseCount} bill(s)`} accent="#c14408" />
        <KpiCard label="Tax Collected (GST)" value={formatCurrency(reports.totalTaxCollected)} sub={`Paid: ${formatCurrency(reports.totalTaxPaid)}`} accent="#7c3aed" />
        <KpiCard
          label="Outstanding"
          value={formatCurrency(reports.outstandingAmount ?? 0)}
          sub={`${reports.outstandingCount ?? 0} unpaid invoice(s)`}
          accent="#dc2626"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Net Tax Position</div>
          <div className="mt-2 text-2xl font-bold" style={{ color: netTaxPositionColor }}>
            {reports.netTaxPosition >= 0 ? "+" : ""}{formatCurrency(reports.netTaxPosition)}
          </div>
          <div className="mt-1 text-xs text-gray-400">{reports.netTaxPosition >= 0 ? "Payable to Govt" : "Excess Input Credit"}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Invoice Count</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{reports.invoiceCount}</div>
          <div className="mt-1 text-xs text-gray-400">Total invoices raised</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Purchase Bills</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{reports.purchaseCount}</div>
          <div className="mt-1 text-xs text-gray-400">Total purchase entries</div>
        </div>
      </section>

      {onNavigate && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "New Invoice", module: "invoices" },
              { label: "New Purchase", module: "purchases" },
              { label: "POS Billing", module: "pos" },
              { label: "Cash & Bank", module: "cashBank" },
              { label: "Inventory", module: "inventory" },
              { label: "Reports", module: "reports" },
            ].map(({ label, module }) => (
              <button key={module} onClick={() => onNavigate(module)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:border-[#c14408] hover:text-[#c14408] transition-colors">
                {label}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{invoices.length} total</span>
          </div>
          <div className="space-y-2">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">{invoice.invoiceNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(invoice.status)}`}>{invoice.status}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{invoice.client.company || invoice.client.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 text-sm">{formatCurrency(invoice.totals.total)}</div>
                  <div className="text-xs text-gray-400">{formatDate(invoice.invoiceDate)}</div>
                </div>
              </div>
            ))}
            {invoices.length === 0 && <p className="text-sm text-gray-400 py-2">No invoices yet.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Purchases</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{purchases.length} total</span>
          </div>
          <div className="space-y-2">
            {recentPurchases.map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{purchase.purchaseNumber}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{purchase.vendor.company || purchase.vendor.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 text-sm">{formatCurrency(purchase.totals.total)}</div>
                  <div className="text-xs text-gray-400">{formatDate(purchase.purchaseDate)}</div>
                </div>
              </div>
            ))}
            {purchases.length === 0 && <p className="text-sm text-gray-400 py-2">No purchases yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
