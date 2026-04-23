"use client";
import { useMemo, useState } from "react";
import type { InvoiceRecord, PurchaseRecord, ReportSummary } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type ReportTab = "summary" | "gstr1" | "salesReg" | "pl";

interface ReportsModuleProps {
  reports: ReportSummary;
  invoices: InvoiceRecord[];
  purchases: PurchaseRecord[];
}

const TABS: { key: ReportTab; label: string }[] = [
  { key: "summary", label: "Summary" },
  { key: "gstr1", label: "GSTR-1 (HSN)" },
  { key: "salesReg", label: "Sales Register" },
  { key: "pl", label: "P&L Overview" },
];

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className={`mt-2 text-2xl font-bold ${color || "text-gray-900"}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

export default function ReportsModule({ reports, invoices, purchases }: ReportsModuleProps) {
  const [tab, setTab] = useState<ReportTab>("summary");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = !search ||
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        (inv.client.company || inv.client.name).toLowerCase().includes(search.toLowerCase());
      const matchFrom = !dateFrom || inv.invoiceDate >= dateFrom;
      const matchTo = !dateTo || inv.invoiceDate <= dateTo;
      return matchSearch && matchFrom && matchTo;
    });
  }, [invoices, search, dateFrom, dateTo]);

  const hsnSummary = useMemo(() => {
    const map = new Map<string, { hsn: string; desc: string; gstRate: number; taxableVal: number; cgst: number; sgst: number; igst: number; total: number }>();
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        const key = item.hsnSac || "MISC";
        const existing = map.get(key);
        const taxable = item.quantity * item.rate;
        const rate = item.gstRate || 0;
        const cgst = taxable * rate / 200;
        const sgst = cgst;
        if (existing) {
          existing.taxableVal += taxable;
          existing.cgst += cgst;
          existing.sgst += sgst;
          existing.total += taxable + cgst + sgst;
        } else {
          map.set(key, { hsn: key, desc: item.description || item.name, gstRate: rate, taxableVal: taxable, cgst, sgst, igst: 0, total: taxable + cgst + sgst });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.taxableVal - a.taxableVal);
  }, [invoices]);

  const plData = useMemo(() => {
    const revenue = invoices.filter(i => i.status !== "cancelled").reduce((s, i) => s + i.totals.subtotal, 0);
    const purchases_cost = purchases.reduce((s, p) => s + p.totals.subtotal, 0);
    const grossProfit = revenue - purchases_cost;
    const totalTax = invoices.filter(i => i.status !== "cancelled").reduce((s, i) => s + i.totals.cgst + i.totals.sgst + i.totals.igst, 0);
    return { revenue, purchases_cost, grossProfit, totalTax };
  }, [invoices, purchases]);

  const statusBadge = (status: string) => {
    const m: Record<string, string> = { draft: "bg-gray-100 text-gray-500", sent: "bg-blue-50 text-blue-700", paid: "bg-green-50 text-green-700", cancelled: "bg-red-50 text-red-500" };
    return m[status] || "bg-gray-100 text-gray-500";
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Reports</h2>
      </div>

      <div className="flex border-b border-gray-200">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? "border-b-2 border-[#c14408] text-[#c14408]" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total Sales" value={formatCurrency(reports.totalSales)} sub={`${reports.invoiceCount} invoices`} />
            <StatCard label="Total Purchases" value={formatCurrency(reports.totalPurchases)} sub={`${reports.purchaseCount} bills`} />
            <StatCard label="Outstanding Receivables" value={formatCurrency(reports.outstandingAmount ?? 0)} sub={`${reports.outstandingCount ?? 0} unpaid`} color="text-red-600" />
            <StatCard label="GST Collected" value={formatCurrency(reports.totalTaxCollected)} />
            <StatCard label="GST Paid (ITC)" value={formatCurrency(reports.totalTaxPaid)} />
            <StatCard
              label="Net GST Payable"
              value={formatCurrency(reports.netTaxPosition)}
              color={reports.netTaxPosition >= 0 ? "text-red-600" : "text-green-700"}
              sub={reports.netTaxPosition >= 0 ? "Payable to Govt" : "Excess Credit"}
            />
          </div>
        </div>
      )}

      {tab === "gstr1" && (
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">HSN / SAC Rate-wise Summary</h3>
            <p className="text-xs text-gray-400 mt-0.5">Computed from all non-cancelled invoices</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="bg-gray-50 text-xs uppercase text-gray-500">
                <th className="px-4 py-3 text-left">HSN/SAC</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">GST Rate</th>
                <th className="px-4 py-3 text-right">Taxable Value</th>
                <th className="px-4 py-3 text-right">CGST</th>
                <th className="px-4 py-3 text-right">SGST</th>
                <th className="px-4 py-3 text-right">Total Tax</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {hsnSummary.map(row => (
                  <tr key={row.hsn} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 font-medium">{row.hsn}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">{row.desc}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{row.gstRate}%</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(row.taxableVal)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(row.cgst)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(row.sgst)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(row.cgst + row.sgst + row.igst)}</td>
                  </tr>
                ))}
                {hsnSummary.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No invoice data.</td></tr>}
                {hsnSummary.length > 0 && (
                  <tr className="bg-gray-50 font-semibold text-sm">
                    <td colSpan={3} className="px-4 py-3 text-gray-700">Total</td>
                    <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(hsnSummary.reduce((s, r) => s + r.taxableVal, 0))}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(hsnSummary.reduce((s, r) => s + r.cgst, 0))}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(hsnSummary.reduce((s, r) => s + r.sgst, 0))}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(hsnSummary.reduce((s, r) => s + r.cgst + r.sgst, 0))}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "salesReg" && (
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <input className="form-input flex-1 min-w-40" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <label>From</label>
              <input className="form-input w-36 text-sm" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <label>To</label>
              <input className="form-input w-36 text-sm" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <span className="text-xs text-gray-400">{filteredInvoices.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="bg-gray-50 text-xs uppercase text-gray-500">
                <th className="px-4 py-3 text-left">Invoice #</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">GSTIN</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
                <th className="px-4 py-3 text-right">CGST</th>
                <th className="px-4 py-3 text-right">SGST</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(inv.invoiceDate)}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{inv.client.company || inv.client.name}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{inv.client.gstin || "—"}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(inv.totals.subtotal)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(inv.totals.cgst)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(inv.totals.sgst)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(inv.totals.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(inv.status)}`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No invoices found.</td></tr>}
                {filteredInvoices.length > 0 && (
                  <tr className="bg-gray-50 font-semibold text-sm">
                    <td colSpan={4} className="px-4 py-3 text-gray-700">Total ({filteredInvoices.length} invoices)</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(filteredInvoices.reduce((s, i) => s + i.totals.subtotal, 0))}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(filteredInvoices.reduce((s, i) => s + i.totals.cgst, 0))}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(filteredInvoices.reduce((s, i) => s + i.totals.sgst, 0))}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(filteredInvoices.reduce((s, i) => s + i.totals.total, 0))}</td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "pl" && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Profit & Loss Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-700 font-medium">Revenue (Net of Tax)</span>
                <span className="text-lg font-bold text-green-700">{formatCurrency(plData.revenue)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-700">Purchase Cost (Net of Tax)</span>
                <span className="text-lg font-semibold text-gray-900">({formatCurrency(plData.purchases_cost)})</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b-2 border-gray-300">
                <span className="text-gray-900 font-bold text-base">Gross Profit</span>
                <span className={`text-xl font-bold ${plData.grossProfit >= 0 ? "text-green-700" : "text-red-600"}`}>{formatCurrency(plData.grossProfit)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-700">GST Collected</span>
                <span className="text-gray-900">{formatCurrency(plData.totalTax)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-700">GST Input Credit</span>
                <span className="text-gray-900">{formatCurrency(reports.totalTaxPaid)}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-700 font-medium">Net GST Liability</span>
                <span className={`font-bold ${reports.netTaxPosition >= 0 ? "text-red-600" : "text-green-700"}`}>{formatCurrency(reports.netTaxPosition)}</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-[#1957bc] to-blue-700 text-white p-6 shadow-sm">
            <div className="text-sm opacity-80">Gross Profit Margin</div>
            <div className="text-3xl font-bold mt-1">
              {plData.revenue > 0 ? ((plData.grossProfit / plData.revenue) * 100).toFixed(1) : "0.0"}%
            </div>
            <div className="mt-2 text-sm opacity-70">Based on all non-cancelled invoices vs purchases</div>
          </div>
        </div>
      )}
    </div>
  );
}
