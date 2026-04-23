"use client";
import { useEffect, useMemo, useState } from "react";
import BusinessInfoForm from "@/components/forms/BusinessInfoForm";
import ClientInfoForm from "@/components/forms/ClientInfoForm";
import InvoiceSummary from "@/components/forms/InvoiceSummary";
import LineItemsTable from "@/components/forms/LineItemsTable";
import InvoicePreviewPanel from "@/components/invoice/InvoicePreviewPanel";
import PaymentModal from "@/components/app/PaymentModal";
import { apiClient } from "@/lib/api-client";
import type {
  BranchRecord,
  CompanyRecord,
  CustomerRecord,
  InvoiceRecord,
  InvoiceSavePayload,
} from "@/lib/types";
import {
  calculateTotals,
  createInvoiceDraft,
  formatCurrency,
  formatDate,
  recalculateItems,
} from "@/lib/utils";

interface InvoicesModuleProps {
  invoices: InvoiceRecord[];
  company: CompanyRecord | null;
  branch: BranchRecord | null;
  customers: CustomerRecord[];
  onSave: (payload: InvoiceSavePayload) => Promise<void>;
  onRefresh: () => Promise<void>;
}

function toDraft(record: InvoiceRecord): InvoiceSavePayload {
  return {
    id: record.id,
    companyId: record.companyId,
    branchId: record.branchId,
    invoiceNumber: record.invoiceNumber,
    invoiceDate: record.invoiceDate,
    status: record.status,
    business: record.business,
    client: record.client,
    items: record.items,
    notes: record.notes,
  };
}

function getStatusBadge(status: string, totalPaid?: number, total?: number) {
  if (totalPaid !== undefined && total !== undefined && totalPaid > 0) {
    if (totalPaid >= total) return { label: "Paid", cls: "bg-green-100 text-green-700" };
    return { label: `Partial (${formatCurrency(totalPaid)})`, cls: "bg-amber-100 text-amber-700" };
  }
  const map: Record<string, { label: string; cls: string }> = {
    draft: { label: "Draft", cls: "bg-gray-100 text-gray-600" },
    sent: { label: "Sent", cls: "bg-blue-100 text-blue-700" },
    paid: { label: "Paid", cls: "bg-green-100 text-green-700" },
    cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-600" },
  };
  return map[status] || { label: status, cls: "bg-gray-100 text-gray-600" };
}

export default function InvoicesModule({
  invoices,
  company,
  branch,
  customers,
  onSave,
  onRefresh,
}: InvoicesModuleProps) {
  const [draft, setDraft] = useState<InvoiceSavePayload>(() =>
    createInvoiceDraft(company, branch)
  );
  const [sameGst, setSameGst] = useState(true);
  const [globalGst, setGlobalGst] = useState(18);
  const [saving, setSaving] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceRecord | null>(null);
  const [shareLoading, setShareLoading] = useState<number | null>(null);
  const [emailInvoice, setEmailInvoice] = useState<InvoiceRecord | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailAddr, setEmailAddr] = useState("");
  const [msgInvoice, setMsgInvoice] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);

  useEffect(() => {
    setDraft((current) => {
      if (!current.id) return createInvoiceDraft(company, branch);
      return { ...current, companyId: company?.id || current.companyId, branchId: branch?.id || null };
    });
  }, [branch, company]);

  useEffect(() => {
    const uniqueTaxes = Array.from(new Set(draft.items.map((i) => i.gst)));
    if (uniqueTaxes.length <= 1) { setSameGst(true); setGlobalGst(uniqueTaxes[0] ?? 18); }
    else setSameGst(false);
  }, [draft.items]);

  const normalizedItems = useMemo(() => recalculateItems(draft.items), [draft.items]);
  const totals = useMemo(() => calculateTotals(normalizedItems), [normalizedItems]);

  const filteredCustomers = customers.filter((c) =>
    `${c.name} ${c.companyName}`.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleShareLink = async (invoice: InvoiceRecord) => {
    setShareLoading(invoice.id);
    try {
      const { url } = await apiClient.getInvoiceShareUrl(invoice.id);
      await navigator.clipboard.writeText(url);
      setMsgInvoice(`Share link copied: ${url}`);
      setTimeout(() => setMsgInvoice(null), 4000);
    } catch {
      setMsgInvoice("Could not generate share link.");
      setTimeout(() => setMsgInvoice(null), 3000);
    } finally {
      setShareLoading(null);
    }
  };

  const handleSendEmail = async () => {
    if (!emailInvoice) return;
    setEmailSending(true);
    try {
      const { shareUrl } = await apiClient.sendInvoiceEmail(emailInvoice.id, emailAddr || undefined);
      setEmailInvoice(null);
      setEmailAddr("");
      setMsgInvoice(`Email sent! Share link: ${shareUrl}`);
      setTimeout(() => setMsgInvoice(null), 5000);
      await onRefresh();
    } catch (e) {
      setMsgInvoice(e instanceof Error ? e.message : "Email send failed");
      setTimeout(() => setMsgInvoice(null), 3500);
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Invoice Workspace</h2>
            <p className="text-sm text-gray-500">Build and save GST invoices for the selected company and branch.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              className="form-input w-40"
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as InvoiceSavePayload["status"] })}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="btn btn-secondary" onClick={() => setDraft(createInvoiceDraft(company, branch))}>
              New Invoice
            </button>
            <button
              className="btn btn-primary"
              disabled={saving || !draft.companyId}
              onClick={async () => {
                setSaving(true);
                try {
                  await onSave({ ...draft, branchId: draft.branchId || null, items: normalizedItems });
                  setDraft(createInvoiceDraft(company, branch));
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Saving..." : draft.id ? "Update Invoice" : "Save Invoice"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <BusinessInfoForm
            business={draft.business}
            documentNumber={draft.invoiceNumber}
            documentDate={draft.invoiceDate}
            onBusinessChange={(business) => setDraft({ ...draft, business })}
            onMetaChange={(meta) =>
              setDraft({
                ...draft,
                invoiceNumber: meta.documentNumber ?? draft.invoiceNumber,
                invoiceDate: meta.documentDate ?? draft.invoiceDate,
              })
            }
          />

          {/* Customer Picker */}
          {customers.length > 0 && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-blue-800 flex items-center gap-1.5">
                  <span className="material-icons text-base">contacts</span>
                  Pick from Address Book
                </p>
                <button
                  onClick={() => setShowCustomerPicker(!showCustomerPicker)}
                  className="text-xs text-blue-700 font-medium hover:underline"
                >
                  {showCustomerPicker ? "Hide" : "Show"}
                </button>
              </div>
              {showCustomerPicker && (
                <>
                  <input
                    className="form-input mb-2 text-sm"
                    placeholder="Search customer..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {filteredCustomers.slice(0, 8).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setDraft({
                            ...draft,
                            client: {
                              name: c.name,
                              company: c.companyName || c.name,
                              email: c.email,
                              phone: c.phone,
                              address: c.address,
                              gstin: c.gstin,
                            },
                          });
                          setShowCustomerPicker(false);
                          setCustomerSearch("");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-blue-100 transition"
                      >
                        <span className="material-icons text-blue-500 text-sm">person</span>
                        <span className="font-medium text-blue-900">{c.name}</span>
                        {c.companyName && <span className="text-blue-600 truncate">{c.companyName}</span>}
                      </button>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <p className="text-xs text-blue-500 text-center py-2">No customers match.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <ClientInfoForm
            title="Client Information"
            value={draft.client}
            onChange={(client) => setDraft({ ...draft, client })}
          />
          <LineItemsTable
            items={normalizedItems}
            sameGst={sameGst}
            globalGst={globalGst}
            onChange={(items) => setDraft({ ...draft, items })}
            onSameGstChange={setSameGst}
            onGlobalGstChange={setGlobalGst}
          />
          <div className="notion-style">
            <label className="form-label" htmlFor="invoiceNotes">Notes</label>
            <textarea
              id="invoiceNotes"
              className="form-input min-h-24"
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              placeholder="Optional notes or payment terms"
            />
          </div>
          <InvoiceSummary totals={totals} />
        </div>

        <div className="space-y-6">
          <InvoicePreviewPanel
            business={draft.business}
            client={draft.client}
            items={normalizedItems}
            documentNumber={draft.invoiceNumber}
            documentDate={draft.invoiceDate}
            totals={totals}
          />
        </div>
      </div>

      {/* Saved invoices list */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Saved Invoices</h3>
          <span className="text-sm text-gray-500">{invoices.length} records</span>
        </div>

        {msgInvoice && (
          <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
            {msgInvoice}
          </div>
        )}

        <div className="space-y-3">
          {invoices.map((invoice) => {
            const badge = getStatusBadge(invoice.status);
            return (
              <div
                key={invoice.id}
                className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:border-gray-200 hover:bg-white transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setDraft(toDraft(invoice))}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{invoice.invoiceNumber}</span>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {invoice.client.company || invoice.client.name} · {formatDate(invoice.invoiceDate)}
                    </div>
                  </button>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-semibold text-gray-900 text-sm">{formatCurrency(invoice.totals.total)}</span>
                    <button
                      title="Record Payment"
                      onClick={() => setPaymentInvoice(invoice)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition"
                    >
                      <span className="material-icons text-sm">payments</span>
                    </button>
                    <button
                      title="Copy Share Link"
                      onClick={() => handleShareLink(invoice)}
                      disabled={shareLoading === invoice.id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    >
                      <span className="material-icons text-sm">{shareLoading === invoice.id ? "hourglass_empty" : "link"}</span>
                    </button>
                    <button
                      title="Send via Email"
                      onClick={() => { setEmailInvoice(invoice); setEmailAddr(invoice.client.email || ""); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition"
                    >
                      <span className="material-icons text-sm">email</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {invoices.length === 0 && (
            <p className="text-sm text-gray-500">No invoices saved yet for this selection.</p>
          )}
        </div>
      </div>

      {/* Payment modal */}
      {paymentInvoice && (
        <PaymentModal
          invoice={paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          onDone={onRefresh}
        />
      )}

      {/* Send email modal */}
      {emailInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="font-extrabold text-gray-900 mb-1">Send Invoice via Email</h3>
            <p className="text-xs text-gray-400 mb-4">{emailInvoice.invoiceNumber} · {emailInvoice.client.company || emailInvoice.client.name}</p>
            <label className="form-label">Recipient Email</label>
            <input
              className="form-input mt-1 mb-4"
              type="email"
              value={emailAddr}
              onChange={(e) => setEmailAddr(e.target.value)}
              placeholder="customer@example.com"
            />
            <div className="flex gap-2">
              <button className="btn btn-primary flex-1" onClick={handleSendEmail} disabled={emailSending}>
                {emailSending ? "Sending..." : "Send Email"}
              </button>
              <button className="btn btn-secondary" onClick={() => setEmailInvoice(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
