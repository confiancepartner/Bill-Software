"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { BankTransaction, CashBankAccount, CompanyRecord } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type Tab = "accounts" | "transactions";

interface Props {
  company: CompanyRecord | null;
}

function emptyAccount(companyId: number): Partial<CashBankAccount> {
  return { companyId, name: "", accountType: "cash", bankName: "", accountNumber: "", ifsc: "", openingBalance: 0, isDefault: false };
}

export default function CashBankModule({ company }: Props) {
  const [tab, setTab] = useState<Tab>("accounts");
  const [accounts, setAccounts] = useState<CashBankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [editAccount, setEditAccount] = useState<Partial<CashBankAccount>>(emptyAccount(company?.id || 0));
  const [txForm, setTxForm] = useState({ accountId: 0, transactionType: "credit", amount: 0, transactionDate: new Date().toISOString().slice(0, 10), narration: "", reference: "", category: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const companyId = company?.id;

  const loadAll = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const accs = await apiClient.getCashBankAccounts(companyId);
      setAccounts(accs);
      const txs = await apiClient.getBankTransactions(companyId, selectedAccountId ? Number(selectedAccountId) : undefined);
      setTransactions(txs);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, [companyId, selectedAccountId]);

  const saveAccount = async () => {
    if (!companyId || !editAccount.name) return;
    setSaving(true); setErr(null);
    try {
      await apiClient.saveCashBankAccount({ ...editAccount, companyId } as CashBankAccount);
      await loadAll();
      setShowAccountModal(false);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  };

  const saveTx = async () => {
    if (!companyId || !txForm.accountId || !txForm.amount) return;
    setSaving(true); setErr(null);
    try {
      await apiClient.addBankTransaction({ ...txForm, companyId });
      await loadAll();
      setShowTxModal(false);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  };

  const deleteTx = async (id: number) => {
    if (!confirm("Delete this transaction?")) return;
    await apiClient.deleteBankTransaction(id);
    await loadAll();
  };

  const totalBalance = accounts.reduce((s, a) => s + a.currentBalance, 0);
  const cashAccounts = accounts.filter(a => a.accountType === "cash");
  const bankAccounts = accounts.filter(a => a.accountType === "bank");

  if (!company) return <div className="text-gray-500 text-sm p-4">Select a company to manage cash & bank.</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900">Cash & Bank</h2>
        <div className="flex gap-2">
          {tab === "accounts" && (
            <button className="btn btn-primary text-sm" onClick={() => { setEditAccount(emptyAccount(companyId!)); setShowAccountModal(true); }}>+ Add Account</button>
          )}
          {tab === "transactions" && (
            <button className="btn btn-primary text-sm" onClick={() => { setTxForm(f => ({ ...f, accountId: accounts[0]?.id || 0 })); setShowTxModal(true); }}>+ Add Entry</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#1957bc] to-blue-700 text-white p-5 shadow-sm col-span-1">
          <div className="text-sm opacity-80">Total Balance</div>
          <div className="text-2xl font-bold mt-2">{formatCurrency(totalBalance)}</div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="text-sm text-gray-500">Cash</div>
          <div className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(cashAccounts.reduce((s, a) => s + a.currentBalance, 0))}</div>
          <div className="text-xs text-gray-400 mt-1">{cashAccounts.length} account(s)</div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="text-sm text-gray-500">Bank</div>
          <div className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(bankAccounts.reduce((s, a) => s + a.currentBalance, 0))}</div>
          <div className="text-xs text-gray-400 mt-1">{bankAccounts.length} account(s)</div>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        {(["accounts", "transactions"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${tab === t ? "border-b-2 border-[#c14408] text-[#c14408]" : "text-gray-500 hover:text-gray-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {err && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{err}</div>}
      {loading && <div className="text-gray-400 text-sm py-4 text-center">Loading...</div>}

      {tab === "accounts" && !loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map(a => (
            <div key={a.id} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{a.name}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.accountType === "cash" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>{a.accountType.toUpperCase()}</span>
                </div>
                {a.isDefault && <span className="text-xs bg-orange-50 text-[#c14408] px-2 py-0.5 rounded-full">Default</span>}
              </div>
              {a.bankName && <div className="text-sm text-gray-500">{a.bankName} {a.accountNumber ? `· ****${a.accountNumber.slice(-4)}` : ""}</div>}
              <div className="pt-1 border-t border-gray-100">
                <div className="text-xs text-gray-400">Current Balance</div>
                <div className={`text-lg font-bold ${a.currentBalance >= 0 ? "text-gray-900" : "text-red-600"}`}>{formatCurrency(a.currentBalance)}</div>
              </div>
              <button className="text-xs text-blue-600 hover:underline" onClick={() => { setEditAccount({ ...a }); setShowAccountModal(true); }}>Edit</button>
            </div>
          ))}
          {accounts.length === 0 && <div className="col-span-3 text-center text-gray-400 py-8">No accounts yet.</div>}
        </div>
      )}

      {tab === "transactions" && !loading && (
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
            <label className="text-sm text-gray-600">Filter by account:</label>
            <select className="form-input w-auto text-sm" value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">All Accounts</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="bg-gray-50 text-xs uppercase text-gray-500">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Account</th>
                <th className="px-4 py-3 text-left">Narration</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Ref</th>
                <th className="px-4 py-3 text-right">Debit</th>
                <th className="px-4 py-3 text-right">Credit</th>
                <th className="px-4 py-3"></th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{t.transactionDate}</td>
                    <td className="px-4 py-3 text-gray-700">{t.accountName}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{t.narration || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{t.category}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{t.reference}</td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">{t.transactionType === "debit" ? formatCurrency(t.amount) : ""}</td>
                    <td className="px-4 py-3 text-right text-green-700 font-medium">{t.transactionType === "credit" ? formatCurrency(t.amount) : ""}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-xs text-red-500 hover:underline" onClick={() => deleteTx(t.id)}>Del</button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No transactions yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">{editAccount.id ? "Edit" : "Add"} Account</h3>
            <div>
              <label className="form-label">Account Name *</label>
              <input className="form-input" value={editAccount.name || ""} onChange={e => setEditAccount(a => ({ ...a, name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Type</label>
              <select className="form-input" value={editAccount.accountType || "cash"} onChange={e => setEditAccount(a => ({ ...a, accountType: e.target.value as "cash" | "bank" | "wallet" }))}>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="wallet">Wallet / Digital</option>
              </select>
            </div>
            {editAccount.accountType !== "cash" && (
              <>
                <div><label className="form-label">Bank Name</label><input className="form-input" value={editAccount.bankName || ""} onChange={e => setEditAccount(a => ({ ...a, bankName: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="form-label">Account No.</label><input className="form-input" value={editAccount.accountNumber || ""} onChange={e => setEditAccount(a => ({ ...a, accountNumber: e.target.value }))} /></div>
                  <div><label className="form-label">IFSC</label><input className="form-input" value={editAccount.ifsc || ""} onChange={e => setEditAccount(a => ({ ...a, ifsc: e.target.value }))} /></div>
                </div>
              </>
            )}
            <div><label className="form-label">Opening Balance (₹)</label><input className="form-input" type="number" value={editAccount.openingBalance || 0} onChange={e => setEditAccount(a => ({ ...a, openingBalance: Number(e.target.value) }))} /></div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={!!editAccount.isDefault} onChange={e => setEditAccount(a => ({ ...a, isDefault: e.target.checked }))} />
              Set as default
            </label>
            {err && <div className="text-red-600 text-sm">{err}</div>}
            <div className="flex gap-3 justify-end pt-2">
              <button className="btn btn-secondary" onClick={() => setShowAccountModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={saveAccount}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Add Transaction</h3>
            <div>
              <label className="form-label">Account *</label>
              <select className="form-input" value={txForm.accountId} onChange={e => setTxForm(f => ({ ...f, accountId: Number(e.target.value) }))}>
                <option value={0}>Select account...</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Type</label>
                <select className="form-input" value={txForm.transactionType} onChange={e => setTxForm(f => ({ ...f, transactionType: e.target.value }))}>
                  <option value="credit">Credit (Received)</option>
                  <option value="debit">Debit (Paid)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Amount (₹) *</label>
                <input className="form-input" type="number" value={txForm.amount || ""} onChange={e => setTxForm(f => ({ ...f, amount: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={txForm.transactionDate} onChange={e => setTxForm(f => ({ ...f, transactionDate: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Category</label>
                <input className="form-input" value={txForm.category} onChange={e => setTxForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Sales, Rent..." />
              </div>
            </div>
            <div><label className="form-label">Narration</label><input className="form-input" value={txForm.narration} onChange={e => setTxForm(f => ({ ...f, narration: e.target.value }))} /></div>
            <div><label className="form-label">Reference No.</label><input className="form-input" value={txForm.reference} onChange={e => setTxForm(f => ({ ...f, reference: e.target.value }))} /></div>
            {err && <div className="text-red-600 text-sm">{err}</div>}
            <div className="flex gap-3 justify-end pt-2">
              <button className="btn btn-secondary" onClick={() => setShowTxModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={saveTx}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
