"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { InvoiceRecord } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PublicInvoicePage() {
  const { token } = useParams<{ token: string }>();
  const [invoice, setInvoice] = useState<InvoiceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/public/invoice/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Invoice not found");
        }
        return res.json() as Promise<InvoiceRecord>;
      })
      .then(setInvoice)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-400">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="text-4xl mb-3">📄</div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Invoice Not Found</h2>
          <p className="text-sm text-gray-500">{error || "This link may be invalid or expired."}</p>
        </div>
      </div>
    );
  }

  const { business, client, items, totals, invoiceNumber, invoiceDate, status, notes } = invoice;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:py-0 print:px-0">
      <div className="mx-auto max-w-3xl">
        {/* Print button */}
        <div className="mb-4 flex justify-end print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            <span className="material-icons text-base">print</span>
            Print / Download PDF
          </button>
        </div>

        <div className="rounded-2xl bg-white shadow-sm overflow-hidden print:shadow-none print:rounded-none">
          {/* Header band */}
          <div className="px-8 py-6" style={{ background: "linear-gradient(135deg, #1957bc 0%, #1542a0 100%)" }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-white">{business.name}</h1>
                {business.company && <p className="text-blue-200 text-sm">{business.company}</p>}
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white uppercase tracking-widest">INVOICE</div>
                <div className="mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wide"
                  style={{ backgroundColor: status === "paid" ? "#16a34a" : status === "sent" ? "#f59e0b" : "#6b7280", color: "white" }}>
                  {status}
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Meta row */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1 text-sm text-gray-600">
                {business.address && <div className="text-gray-500">{business.address}</div>}
                {business.gstin && <div>GSTIN: <span className="font-mono font-medium text-gray-900">{business.gstin}</span></div>}
                {business.email && <div>{business.email}</div>}
                {business.phone && <div>{business.phone}</div>}
              </div>
              <div className="text-right text-sm">
                <div className="font-bold text-gray-900 text-base">{invoiceNumber}</div>
                <div className="text-gray-500 mt-0.5">Date: {formatDate(invoiceDate)}</div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Bill to */}
            <div>
              <div className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-2">BILL TO</div>
              <div className="text-sm space-y-0.5">
                {client.company && <div className="font-bold text-gray-900">{client.company}</div>}
                <div className={client.company ? "text-gray-700" : "font-bold text-gray-900"}>{client.name}</div>
                {client.address && <div className="text-gray-500">{client.address}</div>}
                {client.gstin && <div>GSTIN: <span className="font-mono">{client.gstin}</span></div>}
                {client.email && <div className="text-gray-500">{client.email}</div>}
                {client.phone && <div className="text-gray-500">{client.phone}</div>}
              </div>
            </div>

            {/* Line items */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3 text-left w-8">#</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-center">HSN/SAC</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Rate</th>
                    <th className="px-4 py-3 text-center">GST%</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-center font-mono text-gray-500">{item.hsnSac || "—"}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{item.quantity} {item.per}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(item.rate)}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{item.gst}%</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.cgst > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>CGST</span>
                    <span>{formatCurrency(totals.cgst)}</span>
                  </div>
                )}
                {totals.sgst > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>SGST</span>
                    <span>{formatCurrency(totals.sgst)}</span>
                  </div>
                )}
                {totals.igst > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>IGST</span>
                    <span>{formatCurrency(totals.igst)}</span>
                  </div>
                )}
                {totals.round_off !== 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Round Off</span>
                    <span>{totals.round_off > 0 ? "+" : ""}{formatCurrency(totals.round_off)}</span>
                  </div>
                )}
                <div className="flex justify-between rounded-xl px-3 py-2.5 font-extrabold text-base" style={{ background: "linear-gradient(135deg, #1957bc, #1542a0)", color: "white" }}>
                  <span>Total</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>

            {notes && (
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Notes</div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{notes}</p>
              </div>
            )}

            <div className="text-center text-xs text-gray-400 pt-2">
              Generated via BillForge · <span className="font-medium">Meld Techo</span>
            </div>
          </div>
        </div>
      </div>

      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
    </div>
  );
}
