import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ToWords } from "to-words";
import type {
  BranchRecord,
  BusinessInfo,
  ClientInfo,
  CompanyRecord,
  InvoiceSavePayload,
  InvoiceTotals,
  LineItem,
  PurchaseSavePayload,
} from "@/lib/types";

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    doNotAddOnly: false,
    currencyOptions: {
      name: "Rupee",
      plural: "Rupees",
      symbol: "Rs.",
      fractionalUnit: {
        name: "Paisa",
        plural: "Paise",
        symbol: "",
      },
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function formatDate(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function numberToWords(value: number) {
  return toWords.convert(Number(value || 0));
}

export function calculateTotals(items: LineItem[]): InvoiceTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.rate),
    0
  );
  const totalTax = items.reduce(
    (sum, item) => sum + (Number(item.quantity) * Number(item.rate) * Number(item.gst)) / 100,
    0
  );
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;
  const igst = 0;
  let total = subtotal + cgst + sgst + igst;
  const round_off = Math.round(total) - total;
  total = Math.round(total);

  return { subtotal, cgst, sgst, igst, round_off, total };
}

export function buildCompanyBusinessInfo(
  company?: CompanyRecord | null,
  branch?: BranchRecord | null
): BusinessInfo {
  return {
    name: branch?.name || company?.name || "",
    company: company?.name || "",
    address: branch?.address || company?.address || "",
    gstin: company?.gstin || "",
    email: branch?.email || company?.email || "",
    phone: branch?.phone || company?.phone || "",
  };
}

export function blankClient(): ClientInfo {
  return {
    name: "",
    company: "",
    address: "",
    gstin: "",
    email: "",
    phone: "",
  };
}

export function blankLineItem(defaultTax = 18): LineItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description: "",
    hsnSac: "",
    quantity: 1,
    rate: 0,
    per: "NOS",
    gst: defaultTax,
    amount: 0,
  };
}

export function recalculateItems(items: LineItem[]) {
  return items.map((item) => ({
    ...item,
    amount: Number(item.quantity) * Number(item.rate),
  }));
}

export function createInvoiceDraft(
  company?: CompanyRecord | null,
  branch?: BranchRecord | null
): InvoiceSavePayload {
  return {
    companyId: company?.id || 0,
    branchId: branch?.id || null,
    invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`,
    invoiceDate: new Date().toISOString().slice(0, 10),
    status: "draft",
    business: buildCompanyBusinessInfo(company, branch),
    client: blankClient(),
    items: [blankLineItem()],
    notes: "",
  };
}

export function createPurchaseDraft(
  company?: CompanyRecord | null,
  branch?: BranchRecord | null
): PurchaseSavePayload {
  return {
    companyId: company?.id || 0,
    branchId: branch?.id || null,
    purchaseNumber: `PUR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`,
    purchaseDate: new Date().toISOString().slice(0, 10),
    status: "draft",
    business: buildCompanyBusinessInfo(company, branch),
    vendor: blankClient(),
    items: [blankLineItem()],
    notes: "",
  };
}
