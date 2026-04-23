"use client";
import { useEffect, useMemo, useState } from "react";
import BusinessInfoForm from "@/components/forms/BusinessInfoForm";
import ClientInfoForm from "@/components/forms/ClientInfoForm";
import InvoiceSummary from "@/components/forms/InvoiceSummary";
import LineItemsTable from "@/components/forms/LineItemsTable";
import type {
  BranchRecord,
  CompanyRecord,
  PurchaseRecord,
  PurchaseSavePayload,
  VendorRecord,
} from "@/lib/types";
import {
  calculateTotals,
  createPurchaseDraft,
  formatCurrency,
  formatDate,
  recalculateItems,
} from "@/lib/utils";

interface PurchasesModuleProps {
  purchases: PurchaseRecord[];
  company: CompanyRecord | null;
  branch: BranchRecord | null;
  vendors: VendorRecord[];
  onSave: (payload: PurchaseSavePayload) => Promise<void>;
}

function toDraft(record: PurchaseRecord): PurchaseSavePayload {
  return {
    id: record.id,
    companyId: record.companyId,
    branchId: record.branchId,
    purchaseNumber: record.purchaseNumber,
    purchaseDate: record.purchaseDate,
    status: record.status,
    business: record.business,
    vendor: record.vendor,
    items: record.items,
    notes: record.notes,
  };
}

export default function PurchasesModule({
  purchases,
  company,
  branch,
  vendors,
  onSave,
}: PurchasesModuleProps) {
  const [draft, setDraft] = useState<PurchaseSavePayload>(() =>
    createPurchaseDraft(company, branch)
  );
  const [sameGst, setSameGst] = useState(true);
  const [globalGst, setGlobalGst] = useState(18);
  const [saving, setSaving] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const [showVendorPicker, setShowVendorPicker] = useState(false);

  useEffect(() => {
    setDraft((current) => {
      if (!current.id) return createPurchaseDraft(company, branch);
      return { ...current, companyId: company?.id || current.companyId, branchId: branch?.id || null };
    });
  }, [branch, company]);

  const normalizedItems = useMemo(() => recalculateItems(draft.items), [draft.items]);
  const totals = useMemo(() => calculateTotals(normalizedItems), [normalizedItems]);

  const filteredVendors = vendors.filter((v) =>
    `${v.name} ${v.companyName}`.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Purchase Register</h2>
            <p className="text-sm text-gray-500">Track vendor bills and GST-input purchases for the selected branch.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              className="form-input w-40"
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as PurchaseSavePayload["status"] })}
            >
              <option value="draft">Draft</option>
              <option value="received">Received</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="btn btn-secondary" onClick={() => setDraft(createPurchaseDraft(company, branch))}>
              New Purchase
            </button>
            <button
              className="btn btn-primary"
              disabled={saving || !draft.companyId}
              onClick={async () => {
                setSaving(true);
                try {
                  await onSave({ ...draft, branchId: draft.branchId || null, items: normalizedItems });
                  setDraft(createPurchaseDraft(company, branch));
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Saving..." : draft.id ? "Update Purchase" : "Save Purchase"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <BusinessInfoForm
            business={draft.business}
            documentNumber={draft.purchaseNumber}
            documentDate={draft.purchaseDate}
            sectionTitle="Company / Branch"
            numberLabel="Purchase Number"
            dateLabel="Purchase Date"
            onBusinessChange={(business) => setDraft({ ...draft, business })}
            onMetaChange={(meta) =>
              setDraft({
                ...draft,
                purchaseNumber: meta.documentNumber ?? draft.purchaseNumber,
                purchaseDate: meta.documentDate ?? draft.purchaseDate,
              })
            }
          />

          {/* Vendor Picker */}
          {vendors.length > 0 && (
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-orange-800 flex items-center gap-1.5">
                  <span className="material-icons text-base">store</span>
                  Pick from Vendor Book
                </p>
                <button
                  onClick={() => setShowVendorPicker(!showVendorPicker)}
                  className="text-xs text-orange-700 font-medium hover:underline"
                >
                  {showVendorPicker ? "Hide" : "Show"}
                </button>
              </div>
              {showVendorPicker && (
                <>
                  <input
                    className="form-input mb-2 text-sm"
                    placeholder="Search vendor..."
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                  />
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {filteredVendors.slice(0, 8).map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setDraft({
                            ...draft,
                            vendor: {
                              name: v.name,
                              company: v.companyName || v.name,
                              email: v.email,
                              phone: v.phone,
                              address: v.address,
                              gstin: v.gstin,
                            },
                          });
                          setShowVendorPicker(false);
                          setVendorSearch("");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-orange-100 transition"
                      >
                        <span className="material-icons text-orange-500 text-sm">store</span>
                        <span className="font-medium text-orange-900">{v.name}</span>
                        {v.companyName && <span className="text-orange-600 truncate">{v.companyName}</span>}
                      </button>
                    ))}
                    {filteredVendors.length === 0 && (
                      <p className="text-xs text-orange-500 text-center py-2">No vendors match.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <ClientInfoForm
            title="Vendor Information"
            value={draft.vendor}
            onChange={(vendor) => setDraft({ ...draft, vendor })}
          />
          <div className="notion-style">
            <label className="form-label" htmlFor="purchaseNotes">Notes</label>
            <textarea
              id="purchaseNotes"
              className="form-input min-h-24"
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              placeholder="Optional remarks for this purchase"
            />
          </div>
          <InvoiceSummary totals={totals} />
        </div>

        <div className="space-y-6">
          <LineItemsTable
            title="Purchase Items"
            items={normalizedItems}
            sameGst={sameGst}
            globalGst={globalGst}
            onChange={(items) => setDraft({ ...draft, items })}
            onSameGstChange={setSameGst}
            onGlobalGstChange={setGlobalGst}
          />

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Purchases</h3>
              <span className="text-sm text-gray-500">{purchases.length} records</span>
            </div>
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <button
                  key={purchase.id}
                  onClick={() => setDraft(toDraft(purchase))}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left transition hover:border-gray-200 hover:bg-white"
                >
                  <div>
                    <div className="font-semibold text-gray-900">{purchase.purchaseNumber}</div>
                    <div className="text-sm text-gray-500">
                      {purchase.vendor.company || purchase.vendor.name} · {formatDate(purchase.purchaseDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(purchase.totals.total)}</div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">{purchase.status}</div>
                  </div>
                </button>
              ))}
              {purchases.length === 0 && (
                <p className="text-sm text-gray-500">No purchases saved yet for this selection.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
