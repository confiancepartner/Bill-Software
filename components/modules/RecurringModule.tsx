"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { BranchRecord, CompanyRecord, RecurringInvoice } from "@/lib/types";

interface Props {
  company: CompanyRecord | null;
  branch: BranchRecord | null;
}

function nextDate(freq: string) {
  const days: Record<string, number> = { weekly: 7, monthly: 30, quarterly: 91, yearly: 365 };
  const d = new Date(Date.now() + (days[freq] || 30) * 86400000);
  return d.toISOString().slice(0, 10);
}

export default function RecurringModule({ company, branch }: Props) {
  const [items, setItems] = useState<RecurringInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Partial<RecurringInvoice> | null>(null);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const companyId = company?.id;

  const load = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const data = await apiClient.getRecurringInvoices(companyId);
      setItems(data);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [companyId]);

  const startNew = () => {
    setEditItem({
      companyId: companyId!,
      branchId: branch?.id,
      title: "",
      frequency: "monthly",
      startDate: new Date().toISOString().slice(0, 10),
      nextDueDate: nextDate("monthly"),
      status: "active",
      autoSend: false,
      client: {},
      items: [],
      notes: "",
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!editItem || !editItem.title) return;
    setSaving(true); setErr(null);
    try {
      await apiClient.saveRecurringInvoice(editItem as RecurringInvoice);
      await load();
      setShowModal(false);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  };

  const trigger = async (id: number) => {
    setTriggering(id); setErr(null);
    try {
      const res = await apiClient.triggerRecurring(id);
      alert(`Invoice created (ID: ${res.invoiceId}). Switch to Invoices module to view it.`);
      await load();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Error"); }
    finally { setTriggering(null); }
  };

  const deleteRec = async (id: number) => {
    if (!confirm("Delete this recurring schedule?")) return;
    await apiClient.deleteRecurringInvoice(id);
    await load();
  };

  const freqLabels: Record<string, string> = { weekly: "Weekly", monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly" };
  const statusColor: Record<string, string> = { active: "bg-green-50 text-green-700", paused: "bg-yellow-50 text-yellow-700", completed: "bg-gray-100 text-gray-500" };

  if (!company) return <div className="text-gray-500 text-sm p-4">Select a company to manage recurring invoices.</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Recurring Invoices</h2>
        <button className="btn btn-primary text-sm" onClick={startNew}>+ New Schedule</button>
      </div>

      {err && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{err}</div>}
      {loading && <div className="text-gray-400 text-sm py-4 text-center">Loading...</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <div key={item.id} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-500 mt-0.5">{item.client?.name || item.client?.company || "No client set"}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[item.status] || "bg-gray-100 text-gray-500"}`}>{item.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div><span className="text-gray-400">Frequency</span><br /><span className="font-medium text-gray-700">{freqLabels[item.frequency]}</span></div>
              <div><span className="text-gray-400">Next Due</span><br /><span className="font-medium text-gray-700">{item.nextDueDate}</span></div>
              <div><span className="text-gray-400">Start</span><br />{item.startDate}</div>
              <div><span className="text-gray-400">End</span><br />{item.endDate || "—"}</div>
            </div>
            {item.lastGeneratedAt && (
              <div className="text-xs text-gray-400">Last generated: {new Date(item.lastGeneratedAt).toLocaleDateString()}</div>
            )}
            <div className="flex gap-2 pt-1 flex-wrap">
              <button className="text-xs text-blue-600 hover:underline" onClick={() => { setEditItem({ ...item }); setShowModal(true); }}>Edit</button>
              <button className="text-xs text-[#c14408] font-medium hover:underline disabled:opacity-50" disabled={triggering === item.id} onClick={() => trigger(item.id)}>
                {triggering === item.id ? "Generating..." : "Generate Now"}
              </button>
              <button className="text-xs text-red-500 hover:underline" onClick={() => deleteRec(item.id)}>Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && (
          <div className="col-span-3 text-center text-gray-400 py-10">
            <p className="text-base font-medium text-gray-500 mb-2">No recurring schedules</p>
            <p className="text-sm">Set up auto-billing for monthly retainers, subscriptions, and rent.</p>
          </div>
        )}
      </div>

      {showModal && editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">{editItem.id ? "Edit" : "New"} Recurring Schedule</h3>
            <div>
              <label className="form-label">Title *</label>
              <input className="form-input" value={editItem.title || ""} onChange={e => setEditItem(i => ({ ...i!, title: e.target.value }))} placeholder="e.g. Monthly Maintenance Contract" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Frequency</label>
                <select className="form-input" value={editItem.frequency || "monthly"} onChange={e => setEditItem(i => ({ ...i!, frequency: e.target.value as RecurringInvoice["frequency"], nextDueDate: nextDate(e.target.value) }))}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="form-input" value={editItem.status || "active"} onChange={e => setEditItem(i => ({ ...i!, status: e.target.value as RecurringInvoice["status"] }))}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={editItem.startDate || ""} onChange={e => setEditItem(i => ({ ...i!, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">End Date (optional)</label>
                <input className="form-input" type="date" value={editItem.endDate || ""} onChange={e => setEditItem(i => ({ ...i!, endDate: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Next Due Date</label>
                <input className="form-input" type="date" value={editItem.nextDueDate || ""} onChange={e => setEditItem(i => ({ ...i!, nextDueDate: e.target.value }))} />
              </div>
            </div>
            <div className="border-t pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Client Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Name</label><input className="form-input" value={editItem.client?.name || ""} onChange={e => setEditItem(i => ({ ...i!, client: { ...i!.client, name: e.target.value } }))} /></div>
                <div><label className="form-label">Company</label><input className="form-input" value={editItem.client?.company || ""} onChange={e => setEditItem(i => ({ ...i!, client: { ...i!.client, company: e.target.value } }))} /></div>
                <div><label className="form-label">Email</label><input className="form-input" type="email" value={editItem.client?.email || ""} onChange={e => setEditItem(i => ({ ...i!, client: { ...i!.client, email: e.target.value } }))} /></div>
                <div><label className="form-label">Phone</label><input className="form-input" value={editItem.client?.phone || ""} onChange={e => setEditItem(i => ({ ...i!, client: { ...i!.client, phone: e.target.value } }))} /></div>
                <div className="col-span-2"><label className="form-label">GSTIN</label><input className="form-input" value={editItem.client?.gstin || ""} onChange={e => setEditItem(i => ({ ...i!, client: { ...i!.client, gstin: e.target.value } }))} /></div>
              </div>
            </div>
            <div>
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={2} value={editItem.notes || ""} onChange={e => setEditItem(i => ({ ...i!, notes: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={!!editItem.autoSend} onChange={e => setEditItem(i => ({ ...i!, autoSend: e.target.checked }))} />
              Auto-send invoice when generated
            </label>
            {err && <div className="text-red-600 text-sm">{err}</div>}
            <div className="flex gap-3 justify-end pt-2">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
