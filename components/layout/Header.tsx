"use client";

import Image from "next/image";
import type { BranchRecord, CompanyRecord, SessionUser } from "@/lib/types";

interface HeaderProps {
  currentUser: SessionUser;
  companies: CompanyRecord[];
  branches: BranchRecord[];
  selectedCompanyId: number | null;
  selectedBranchId: number | null;
  onCompanyChange: (companyId: number) => void;
  onBranchChange: (branchId: number | null) => void;
  onLogout: () => void;
}

export default function Header({
  currentUser,
  companies,
  branches,
  selectedCompanyId,
  selectedBranchId,
  onCompanyChange,
  onBranchChange,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-3 py-3 sm:px-4 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="BillForge Logo"
            width={40}
            height={40}
            className="h-8 w-8 rounded-md object-cover"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
              BillForge SaaS
            </h1>
            <p className="text-xs text-gray-500">
              GST billing MVP for companies, branches, and subscriptions
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select
              className="form-input min-w-44"
              value={selectedCompanyId || ""}
              onChange={(event) => onCompanyChange(Number(event.target.value))}
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <select
              className="form-input min-w-40"
              value={selectedBranchId || ""}
              onChange={(event) =>
                onBranchChange(
                  event.target.value ? Number(event.target.value) : null
                )
              }
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {currentUser.fullName}
              </p>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {currentUser.role.replace("_", " ")}
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
