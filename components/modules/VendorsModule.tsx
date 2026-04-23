"use client";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { CompanyRecord, VendorRecord, VendorSavePayload } from "@/lib/types";

interface Props {
  vendors: VendorRecord[];
  company: CompanyRecord | null;
  onRefresh: () => Promise<void>;
}

const EMPTY: Omit<VendorSavePayload, "companyId"> = {
  name: "", companyName: "", email: "", phone: "", address: "", gstin: "",
};

export default function VendorsModule({ vendors, company, onRefresh }: Props) {
  const [form, setForm] = useState<Omit<VendorSavePayload, "companyId"> & { id?: number }>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const flash = (type: "ok" | "err", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const filtered = vendors.filter((v) =>
    `${v.name} ${v.companyName} ${v.email} ${v.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!company) return;
    if (!form.name.trim()) return flash("err", "Vendor name is required");
    setSaving(true);
    try {
      await apiClient.saveVendor({ ...form, companyId: company.id });
      await onRefresh();
      setForm(EMPTY);
      flash("ok", form.id ? "Vendor updated" : "Vendor added");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this vendor?")) return;
    setDeleting(id);
    try {
      await apiClient.deleteVendor(id);
      await onRefresh();
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900">Vendor Address Book</h2>
        <p className="text-sm text-gray-500 mt-1">Save supplier/vendor details to auto-fill purchase bills instantly.</p>
      </div>

      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="material-icons text-base" style={{ color: "#c14408" }}>store</span>
            {form.id ? "Edit Vendor" : "Add Vendor"}
          </h3>
          <div>
            <label className="form-label">Vendor Name <span className="text-red-500">*</span></label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mohan Traders" />
          </div>
          <div>
            <label className="form-label">Company Name</label>
            <input className="form-input" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Mohan Traders Pvt Ltd" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vendor@company.com" />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
            </div>
          </div>
          <div>
            <label className="form-label">GSTIN</label>
            <input className="form-input" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="22AAAAA0000A1Z5" />
          </div>
          <div>
            <label className="form-label">Address</label>
            <textarea className="form-input min-h-16" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City, State PIN" />
          </div>
          <div className="flex gap-2 pt-1">
            <button className="btn btn-primary flex-1" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : form.id ? "Update" : "Add Vendor"}
            </button>
            {form.id && (
              <button className="btn btn-secondary" onClick={() => setForm(EMPTY)}>Cancel</button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{vendors.length} Vendors</h3>
            <input
              className="form-input w-48 text-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                {vendors.length === 0 ? "No vendors yet. Add your first vendor." : "No matches found."}
              </p>
            )}
            {filtered.map((v) => (
              <div key={v.id} className="flex items-start justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:border-gray-200 hover:bg-white transition">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{v.name}</div>
                  {v.companyName && <div className="text-xs text-gray-500 truncate">{v.companyName}</div>}
                  <div className="text-xs text-gray-400 mt-0.5">{[v.phone, v.email].filter(Boolean).join(" · ")}</div>
                  {v.gstin && <div className="text-xs font-mono text-orange-600 mt-0.5">GST: {v.gstin}</div>}
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button
                    onClick={() => setForm({ id: v.id, name: v.name, companyName: v.companyName, email: v.email, phone: v.phone, address: v.address, gstin: v.gstin })}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="Edit"
                  >
                    <span className="material-icons text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    disabled={deleting === v.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete"
                  >
                    <span className="material-icons text-sm">{deleting === v.id ? "hourglass_empty" : "delete_outline"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
