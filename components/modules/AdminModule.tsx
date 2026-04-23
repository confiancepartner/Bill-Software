"use client";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type {
  BranchRecord,
  BranchSavePayload,
  CompanyRecord,
  CompanySavePayload,
  SubscriptionRecord,
  UserRecord,
  UserSavePayload,
} from "@/lib/types";

const PLAN_PRICES: Record<string, { monthly: number; label: string; desc: string }> = {
  Starter: { monthly: 999, label: "Starter", desc: "Up to 5 users, 2 branches" },
  Professional: { monthly: 2499, label: "Professional", desc: "Up to 20 users, 10 branches" },
  Enterprise: { monthly: 5999, label: "Enterprise", desc: "Up to 100 users, 50 branches" },
};

interface AdminModuleProps {
  company: CompanyRecord | null;
  branches: BranchRecord[];
  users: UserRecord[];
  currentSubscription: SubscriptionRecord | null;
  onSaveCompany: (payload: CompanySavePayload) => Promise<void>;
  onSaveBranch: (payload: BranchSavePayload) => Promise<void>;
  onSaveUser: (payload: UserSavePayload) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function AdminModule({
  company,
  branches,
  users,
  currentSubscription,
  onSaveCompany,
  onSaveBranch,
  onSaveUser,
  onRefresh,
}: AdminModuleProps) {
  const companyDraft = useMemo(
    () => ({ id: company?.id || 0, name: company?.name || "", gstin: company?.gstin || "", email: company?.email || "", phone: company?.phone || "", address: company?.address || "" }),
    [company]
  );
  const [companyForm, setCompanyForm] = useState(companyDraft);
  const [branchDraft, setBranchDraft] = useState<BranchSavePayload>({ companyId: company?.id || 0, name: "", code: "", address: "", email: "", phone: "", isDefault: false });
  const [userDraft, setUserDraft] = useState<UserSavePayload>({ companyId: company?.id || 0, branchId: null, fullName: "", email: "", role: "staff", status: "active", password: "Admin@123" });

  const [upgradePlan, setUpgradePlan] = useState(currentSubscription?.planName || "Starter");
  const [renewMonths, setRenewMonths] = useState(1);
  const [subSaving, setSubSaving] = useState(false);
  const [subMsg, setSubMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    setCompanyForm(companyDraft);
    setBranchDraft((c) => ({ ...c, companyId: company?.id || 0 }));
    setUserDraft((c) => ({ ...c, companyId: company?.id || 0 }));
  }, [company?.id, companyDraft]);

  const flashSub = (type: "ok" | "err", text: string) => {
    setSubMsg({ type, text });
    setTimeout(() => setSubMsg(null), 4000);
  };

  const daysLeft = currentSubscription
    ? Math.ceil((new Date(currentSubscription.endDate).getTime() - Date.now()) / 86400000)
    : null;

  const trialBadge = currentSubscription?.status === "trial"
    ? "bg-amber-100 text-amber-700"
    : currentSubscription?.status === "active"
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900">Company Administration</h2>
        <p className="mt-1 text-sm text-gray-500">Manage company profile, branches, and staff access.</p>
      </div>

      {/* Subscription Panel */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="material-icons text-base" style={{ color: "#1957bc" }}>workspace_premium</span>
          Subscription &amp; Plan
        </h3>

        {currentSubscription ? (
          <div className="space-y-4">
            {subMsg && (
              <div className={`rounded-xl px-4 py-3 text-sm font-medium ${subMsg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {subMsg.text}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-xs text-gray-400 mb-0.5">Plan</div>
                <div className="font-bold text-gray-900">{currentSubscription.planName}</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-xs text-gray-400 mb-0.5">Status</div>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${trialBadge}`}>
                  {currentSubscription.status}
                </span>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-xs text-gray-400 mb-0.5">Expires</div>
                <div className="font-semibold text-gray-900 text-sm">{new Date(currentSubscription.endDate).toLocaleDateString("en-IN")}</div>
              </div>
              <div className={`rounded-xl p-3 ${daysLeft !== null && daysLeft <= 5 ? "bg-red-50" : "bg-gray-50"}`}>
                <div className="text-xs text-gray-400 mb-0.5">Days Left</div>
                <div className={`font-bold text-lg ${daysLeft !== null && daysLeft <= 5 ? "text-red-600" : "text-gray-900"}`}>
                  {daysLeft !== null ? (daysLeft > 0 ? daysLeft : "Expired") : "—"}
                </div>
              </div>
            </div>

            {daysLeft !== null && daysLeft <= 5 && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <span className="material-icons text-base">warning</span>
                Your subscription expires soon. Renew now to avoid service interruption.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Upgrade */}
              <div className="rounded-xl border border-gray-100 p-4">
                <h4 className="font-semibold text-gray-900 text-sm mb-3">Upgrade Plan</h4>
                <div className="space-y-2 mb-3">
                  {Object.entries(PLAN_PRICES).map(([key, plan]) => (
                    <label key={key} className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition ${upgradePlan === key ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" name="upgradePlan" value={key} checked={upgradePlan === key} onChange={() => setUpgradePlan(key)} className="mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{plan.label} — ₹{plan.monthly.toLocaleString("en-IN")}/mo</div>
                        <div className="text-xs text-gray-500">{plan.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: "#1957bc" }}
                  disabled={subSaving || upgradePlan === currentSubscription.planName}
                  onClick={async () => {
                    setSubSaving(true);
                    try {
                      await apiClient.upgradePlan(upgradePlan);
                      await onRefresh();
                      flashSub("ok", `Upgraded to ${upgradePlan} plan successfully!`);
                    } catch (e) {
                      flashSub("err", e instanceof Error ? e.message : "Upgrade failed");
                    } finally {
                      setSubSaving(false);
                    }
                  }}
                >
                  {subSaving ? "Upgrading..." : upgradePlan === currentSubscription.planName ? "Current Plan" : `Upgrade to ${upgradePlan}`}
                </button>
              </div>

              {/* Renew */}
              <div className="rounded-xl border border-gray-100 p-4">
                <h4 className="font-semibold text-gray-900 text-sm mb-3">Renew Subscription</h4>
                <p className="text-xs text-gray-500 mb-3">Extend your current plan by selected months.</p>
                <div className="space-y-2 mb-3">
                  {[1, 3, 6, 12].map((m) => (
                    <label key={m} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition ${renewMonths === m ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" name="renewMonths" checked={renewMonths === m} onChange={() => setRenewMonths(m)} />
                      <span className="font-medium text-sm text-gray-900">{m} Month{m > 1 ? "s" : ""}</span>
                      {m === 12 && <span className="ml-auto text-xs font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">Best Value</span>}
                    </label>
                  ))}
                </div>
                <button
                  className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: "#c14408" }}
                  disabled={subSaving}
                  onClick={async () => {
                    setSubSaving(true);
                    try {
                      const { newEndDate } = await apiClient.renewSubscription(renewMonths);
                      await onRefresh();
                      flashSub("ok", `Renewed! New expiry: ${new Date(newEndDate).toLocaleDateString("en-IN")}`);
                    } catch (e) {
                      flashSub("err", e instanceof Error ? e.message : "Renewal failed");
                    } finally {
                      setSubSaving(false);
                    }
                  }}
                >
                  {subSaving ? "Processing..." : `Renew ${renewMonths} Month${renewMonths > 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No subscription found for this account.</p>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="notion-style">
          <h3 className="notion-header">Company Profile</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="form-input" placeholder="Company name" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} />
            <input className="form-input" placeholder="GSTIN" value={companyForm.gstin} onChange={(e) => setCompanyForm({ ...companyForm, gstin: e.target.value })} />
            <input className="form-input" placeholder="Email" value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} />
            <input className="form-input" placeholder="Phone" value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} />
            <textarea className="form-input min-h-24 sm:col-span-2" placeholder="Address" value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} />
          </div>
          {company && (
            <button className="btn btn-primary mt-4" onClick={() => onSaveCompany({ id: company.id, name: companyForm.name, gstin: companyForm.gstin, email: companyForm.email, phone: companyForm.phone, address: companyForm.address })}>
              Save Company
            </button>
          )}
        </section>

        <section className="notion-style">
          <h3 className="notion-header">Add Branch</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="form-input" placeholder="Branch name" value={branchDraft.name} onChange={(e) => setBranchDraft({ ...branchDraft, name: e.target.value })} />
            <input className="form-input" placeholder="Branch code" value={branchDraft.code} onChange={(e) => setBranchDraft({ ...branchDraft, code: e.target.value })} />
            <input className="form-input" placeholder="Email" value={branchDraft.email} onChange={(e) => setBranchDraft({ ...branchDraft, email: e.target.value })} />
            <input className="form-input" placeholder="Phone" value={branchDraft.phone} onChange={(e) => setBranchDraft({ ...branchDraft, phone: e.target.value })} />
            <textarea className="form-input min-h-24 sm:col-span-2" placeholder="Address" value={branchDraft.address} onChange={(e) => setBranchDraft({ ...branchDraft, address: e.target.value })} />
          </div>
          <button
            className="btn btn-primary mt-4"
            onClick={async () => {
              await onSaveBranch({ ...branchDraft, companyId: company?.id || branchDraft.companyId });
              setBranchDraft({ companyId: company?.id || 0, name: "", code: "", address: "", email: "", phone: "", isDefault: false });
            }}
          >
            Save Branch
          </button>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Branches</h3>
            <span className="text-sm text-gray-500">{branches.length} branches</span>
          </div>
          <div className="space-y-3">
            {branches.map((branch) => (
              <div key={branch.id} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="font-semibold text-gray-900">{branch.name}</div>
                <div className="text-sm text-gray-500">{branch.code} / {branch.email || "No email"} / {branch.phone || "No phone"}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="notion-style">
          <h3 className="notion-header">Add Staff User</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="form-input" placeholder="Full name" value={userDraft.fullName} onChange={(e) => setUserDraft({ ...userDraft, fullName: e.target.value })} />
            <input className="form-input" placeholder="Email" value={userDraft.email} onChange={(e) => setUserDraft({ ...userDraft, email: e.target.value })} />
            <select className="form-input" value={userDraft.role} onChange={(e) => setUserDraft({ ...userDraft, role: e.target.value as UserSavePayload["role"] })}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <select className="form-input" value={userDraft.branchId || ""} onChange={(e) => setUserDraft({ ...userDraft, branchId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">All branches</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <input className="form-input sm:col-span-2" type="password" placeholder="Password" value={userDraft.password} onChange={(e) => setUserDraft({ ...userDraft, password: e.target.value })} />
          </div>
          <button
            className="btn btn-primary mt-4"
            onClick={async () => {
              await onSaveUser({ ...userDraft, companyId: company?.id || userDraft.companyId });
              setUserDraft({ companyId: company?.id || 0, branchId: null, fullName: "", email: "", role: "staff", status: "active", password: "Admin@123" });
            }}
          >
            Save User
          </button>
          <div className="mt-6 space-y-3">
            {users.map((user) => (
              <div key={user.id} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="font-semibold text-gray-900">{user.fullName}</div>
                <div className="text-sm text-gray-500">{user.email} / {user.role} / {user.status}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
