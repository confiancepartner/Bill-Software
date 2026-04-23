"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { InvoicePayment, InvoicePaymentSummary, InvoiceRecord, PaymentMode } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  invoice: InvoiceRecord;
  onClose: () => void;
  onDone: () => Promise<void>;
}

const MODES: { value: PaymentMode; label: string; icon: string }[] = [
  { value: "cash", label: "Cash", icon: "payments" },
  { value: "bank", label: "Bank Transfer", icon: "account_balance" },
  { value: "upi", label: "UPI", icon: "qr_code" },
  { value: "cheque", label: "Cheque", icon: "article" },
  { value: "other", label: "Other", icon: "more_horiz" },
];

export default function PaymentModal({ invoice, onClose, onDone }: Props) {
  const [summary, setSummary] = useState<InvoicePaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [sendEmail, setSendEmail] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMode: "cash" as PaymentMode,
    reference: "",
    notes: "",
  });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const flash = (type: "ok" | "err", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  useEffect(() => {
    apiClient.getInvoicePayments(invoice.id)
      .then(setSummary)
      .catch(() => flash("err", "Failed to load payment data"))
      .finally(() => setLoading(false));
  }, [invoice.id]);

  const handleRecord = async () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return flash("err", "Enter a valid payment amount");
    if (summary && amount > summary.balanceDue + 0.01) return flash("err", `Amount exceeds balance due (${formatCurrency(summary.balanceDue)})`);
    setSaving(true);
    try {
      await apiClient.recordPayment(invoice.id, {
        invoiceId: invoice.id,
        amount,
        paymentDate: form.paymentDate,
        paymentMode: form.paymentMode,
        reference: form.reference,
        notes: form.notes,
        sendEmail,
      });
      const fresh = await apiClient.getInvoicePayments(invoice.id);
      setSummary(fresh);
      setForm({ amount: "", paymentDate: new Date().toISOString().slice(0, 10), paymentMode: "cash", reference: "", notes: "" });
      setSendEmail(false);
      flash("ok", "Payment recorded successfully");
      await onDone();
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: InvoicePayment) => {
    if (!confirm(`Delete this ₹${p.amount} payment?`)) return;
    setDeleting(p.id);
    try {
      await apiClient.deletePayment(invoice.id, p.id);
      const fresh = await apiClient.getInvoicePayments(invoice.id);
      setSummary(fresh);
      await onDone();
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const pctPaid = summary ? Math.min(100, (summary.totalPaid / summary.invoiceTotal) * 100) : 0;
  const statusColor = !summary || summary.totalPaid === 0 ? "text-gray-500" :
    summary.balanceDue <= 0 ? "text-green-600" : "text-amber-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">Record Payment</h3>
            <p className="text-xs text-gray-400 mt-0.5">{invoice.invoiceNumber} · {invoice.client.company || invoice.client.name}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
            <span className="material-icons text-base">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {msg && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {msg.text}
            </div>
          )}

          {/* Summary bar */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Invoice Total</div>
                <div className="font-bold text-gray-900 mt-0.5">{formatCurrency(invoice.totals.total)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Paid</div>
                <div className="font-bold text-green-600 mt-0.5">{formatCurrency(summary?.totalPaid || 0)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Balance Due</div>
                <div className={`font-bold mt-0.5 ${statusColor}`}>{formatCurrency(summary?.balanceDue ?? invoice.totals.total)}</div>
              </div>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pctPaid}%`, backgroundColor: pctPaid >= 100 ? "#16a34a" : "#1957bc" }} />
            </div>
          </div>

          {/* Record form */}
          {(summary?.balanceDue ?? invoice.totals.total) > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-sm">Add Payment</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Amount (₹) <span className="text-red-500">*</span></label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder={`Max: ${formatCurrency(summary?.balanceDue ?? invoice.totals.total)}`}
                  />
                </div>
                <div>
                  <label className="form-label">Payment Date <span className="text-red-500">*</span></label>
                  <input className="form-input" type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="form-label">Payment Mode <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {MODES.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setForm({ ...form, paymentMode: m.value })}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${form.paymentMode === m.value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}
                    >
                      <span className="material-icons text-sm">{m.icon}</span>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Reference / UTR No.</label>
                <input className="form-input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Cheque no., UTR, UPI ref..." />
              </div>
              <div>
                <label className="form-label">Notes</label>
                <input className="form-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
              </div>
              {invoice.client.email && (
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" className="rounded" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
                  Send payment confirmation to <span className="font-medium text-blue-700">{invoice.client.email}</span>
                </label>
              )}
              <button className="btn btn-primary w-full" onClick={handleRecord} disabled={saving}>
                {saving ? "Recording..." : "Record Payment"}
              </button>
            </div>
          )}

          {/* Payment history */}
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
          ) : (summary?.payments?.length ?? 0) > 0 ? (
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">Payment History</h4>
              <div className="space-y-2">
                {summary!.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{formatCurrency(p.amount)}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {formatDate(p.paymentDate)} · <span className="capitalize">{p.paymentMode}</span>
                        {p.reference && ` · Ref: ${p.reference}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deleting === p.id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                    >
                      <span className="material-icons text-sm">{deleting === p.id ? "hourglass_empty" : "delete_outline"}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : !loading && (
            <p className="text-sm text-gray-400 text-center py-2">No payments recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
