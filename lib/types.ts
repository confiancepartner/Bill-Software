export type UserRole = "super_admin" | "admin" | "staff";
export type DocumentStatus = "draft" | "sent" | "paid" | "received" | "cancelled";
export type ClientStatus = "trial" | "active" | "suspended";
export type PaymentMode = "cash" | "bank" | "upi" | "cheque" | "other";
export type InvoiceTemplate = "standard" | "service" | "pos";

export interface BusinessInfo {
  name: string;
  company: string;
  address: string;
  gstin: string;
  email: string;
  phone: string;
}

export interface ClientInfo {
  name: string;
  company: string;
  address: string;
  gstin: string;
  email: string;
  phone: string;
}

export interface LineItem {
  id: string;
  description: string;
  hsnSac: string;
  quantity: number;
  rate: number;
  per: string;
  gst: number;
  amount: number;
}

export interface InvoiceTotals {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  round_off: number;
  total: number;
}

export interface SessionUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  clientId: number | null;
  companyId: number | null;
  branchId: number | null;
}

export interface CompanyRecord {
  id: number;
  clientId: number;
  name: string;
  gstin: string;
  email: string;
  phone: string;
  address: string;
}

export interface BranchRecord {
  id: number;
  companyId: number;
  name: string;
  code: string;
  address: string;
  email: string;
  phone: string;
  isDefault: boolean;
}

export interface UserRecord {
  id: number;
  clientId: number | null;
  companyId: number | null;
  branchId: number | null;
  fullName: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
}

export interface CustomerRecord {
  id: number;
  companyId: number;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
}

export interface VendorRecord {
  id: number;
  companyId: number;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
}

export interface InvoicePayment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  reference: string;
  notes: string;
  createdAt: string;
}

export interface InvoicePaymentSummary {
  invoiceTotal: number;
  totalPaid: number;
  balanceDue: number;
  payments: InvoicePayment[];
}

export interface InvoiceRecord {
  id: number;
  companyId: number;
  branchId: number | null;
  createdBy: number;
  invoiceNumber: string;
  invoiceDate: string;
  status: DocumentStatus;
  templateType: InvoiceTemplate;
  business: BusinessInfo;
  client: ClientInfo;
  items: LineItem[];
  totals: InvoiceTotals;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRecord {
  id: number;
  companyId: number;
  branchId: number | null;
  createdBy: number;
  purchaseNumber: string;
  purchaseDate: string;
  status: DocumentStatus;
  business: BusinessInfo;
  vendor: ClientInfo;
  items: LineItem[];
  totals: InvoiceTotals;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSummary {
  invoiceCount: number;
  purchaseCount: number;
  totalSales: number;
  totalPurchases: number;
  totalTaxCollected: number;
  totalTaxPaid: number;
  netTaxPosition: number;
  outstandingCount: number;
  outstandingAmount: number;
}

export interface ClientAccount {
  id: number;
  clientName: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  status: ClientStatus;
  subdomain: string;
  companyId: number | null;
  companyName: string;
  companyGstin: string;
}

export interface SubscriptionRecord {
  id: number;
  clientId: number;
  planName: string;
  status: ClientStatus;
  startDate: string;
  endDate: string;
  userLimit: number;
  branchLimit: number;
}

export interface BootstrapPayload {
  currentUser: SessionUser;
  selectedCompanyId: number | null;
  selectedBranchId: number | null;
  companies: CompanyRecord[];
  branches: BranchRecord[];
  users: UserRecord[];
  customers: CustomerRecord[];
  vendors: VendorRecord[];
  currentSubscription: SubscriptionRecord | null;
  invoices: InvoiceRecord[];
  purchases: PurchaseRecord[];
  reports: ReportSummary;
  clients: ClientAccount[];
  subscriptions: SubscriptionRecord[];
}

export interface LoginPayload {
  email: string;
  password: string;
  panel?: "superadmin" | "tenant";
}

export interface InvoiceSavePayload {
  id?: number;
  companyId: number;
  branchId: number | null;
  invoiceNumber: string;
  invoiceDate: string;
  status: DocumentStatus;
  templateType?: InvoiceTemplate;
  business: BusinessInfo;
  client: ClientInfo;
  items: LineItem[];
  notes: string;
}

export interface PurchaseSavePayload {
  id?: number;
  companyId: number;
  branchId: number | null;
  purchaseNumber: string;
  purchaseDate: string;
  status: DocumentStatus;
  business: BusinessInfo;
  vendor: ClientInfo;
  items: LineItem[];
  notes: string;
}

export interface BranchSavePayload {
  id?: number;
  companyId: number;
  name: string;
  code: string;
  address: string;
  email: string;
  phone: string;
  isDefault: boolean;
}

export interface UserSavePayload {
  id?: number;
  companyId: number;
  branchId: number | null;
  fullName: string;
  email: string;
  role: Extract<UserRole, "admin" | "staff">;
  status: "active" | "inactive";
  password?: string;
}

export interface CompanySavePayload {
  id: number;
  name: string;
  gstin: string;
  email: string;
  phone: string;
  address: string;
}

export interface ClientSavePayload {
  id?: number;
  clientName: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  status: ClientStatus;
  subdomain?: string;
  companyName: string;
  companyGstin: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  adminName: string;
  adminEmail: string;
  adminPassword?: string;
}

export interface SubscriptionSavePayload {
  id?: number;
  clientId: number;
  planName: string;
  status: ClientStatus;
  startDate: string;
  endDate: string;
  userLimit: number;
  branchLimit: number;
}

export interface RegisterPayload {
  clientName: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  companyName: string;
  companyGstin: string;
  companyAddress: string;
  adminPassword: string;
  planName: string;
}

export interface TenantInfo {
  mode: "public" | "superadmin" | "tenant";
  tenantSlug: string | null;
  tenantName: string | null;
  clientId: number | null;
}

export interface CustomerSavePayload {
  id?: number;
  companyId: number;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
}

export interface VendorSavePayload {
  id?: number;
  companyId: number;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
}

export interface PaymentSavePayload {
  invoiceId: number;
  amount: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  reference?: string;
  notes?: string;
  sendEmail?: boolean;
}

// ─── Inventory ─────────────────────────────────────────────────────────────

export interface ProductRecord {
  id: number;
  companyId: number;
  code: string;
  name: string;
  description: string;
  type: "product" | "service";
  unit: string;
  hsnSac: string;
  gstRate: number;
  purchaseRate: number;
  saleRate: number;
  openingStock: number;
  currentStock: number;
  minStock: number;
  isActive: boolean;
}

export interface ProductSavePayload {
  id?: number;
  companyId: number;
  code?: string;
  name: string;
  description?: string;
  type: "product" | "service";
  unit?: string;
  hsnSac?: string;
  gstRate: number;
  purchaseRate: number;
  saleRate: number;
  openingStock?: number;
  minStock?: number;
}

export interface GodownRecord {
  id: number;
  companyId: number;
  name: string;
  code: string;
  address: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface GodownSavePayload {
  id?: number;
  companyId: number;
  name: string;
  code?: string;
  address?: string;
  isDefault?: boolean;
}

export interface StockMovement {
  id: number;
  companyId: number;
  productId: number;
  productName: string;
  godownId: number | null;
  godownName: string;
  movementType: "in" | "out" | "transfer" | "adjustment";
  quantity: number;
  rate: number;
  referenceType: string;
  referenceId: number | null;
  notes: string;
  createdBy: number;
  movementDate: string;
  createdAt: string;
}

export interface StockMovementSavePayload {
  companyId: number;
  productId: number;
  godownId?: number | null;
  movementType: "in" | "out" | "adjustment";
  quantity: number;
  rate?: number;
  notes?: string;
  movementDate: string;
}

// ─── Cash & Bank ────────────────────────────────────────────────────────────

export interface CashBankAccount {
  id: number;
  companyId: number;
  name: string;
  accountType: "cash" | "bank" | "wallet";
  bankName: string;
  accountNumber: string;
  ifsc: string;
  openingBalance: number;
  currentBalance: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface CashBankAccountSavePayload {
  id?: number;
  companyId: number;
  name: string;
  accountType: "cash" | "bank" | "wallet";
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  openingBalance?: number;
  isDefault?: boolean;
}

export interface BankTransaction {
  id: number;
  accountId: number;
  accountName: string;
  companyId: number;
  transactionType: "credit" | "debit";
  amount: number;
  transactionDate: string;
  narration: string;
  reference: string;
  category: string;
  createdAt: string;
}

export interface BankTransactionSavePayload {
  accountId: number;
  companyId: number;
  transactionType: "credit" | "debit";
  amount: number;
  transactionDate: string;
  narration?: string;
  reference?: string;
  category?: string;
}

// ─── Recurring Invoices ─────────────────────────────────────────────────────

export interface RecurringInvoice {
  id: number;
  companyId: number;
  branchId: number | null;
  createdBy: number;
  title: string;
  frequency: "weekly" | "monthly" | "quarterly" | "yearly";
  startDate: string;
  endDate: string | null;
  nextDueDate: string;
  status: "active" | "paused" | "completed";
  client: ClientInfo;
  business: BusinessInfo;
  items: LineItem[];
  notes: string;
  autoSend: boolean;
  lastGeneratedAt: string | null;
  createdAt: string;
}

export interface RecurringSavePayload {
  id?: number;
  companyId: number;
  branchId?: number | null;
  title: string;
  frequency: "weekly" | "monthly" | "quarterly" | "yearly";
  startDate: string;
  endDate?: string | null;
  nextDueDate: string;
  status?: "active" | "paused" | "completed";
  client: ClientInfo;
  business: BusinessInfo;
  items: LineItem[];
  notes?: string;
  autoSend?: boolean;
}

// ─── POS ────────────────────────────────────────────────────────────────────

export interface POSBillItem {
  productId: number | null;
  name: string;
  hsnSac: string;
  unit: string;
  quantity: number;
  rate: number;
  gstRate: number;
  amount: number;
  gstAmount: number;
}

export interface POSBill {
  id: number;
  companyId: number;
  branchId: number | null;
  createdBy: number;
  billNumber: string;
  billDate: string;
  customerName: string;
  customerPhone: string;
  customerGstin: string;
  items: POSBillItem[];
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  paymentMode: "cash" | "card" | "upi" | "split";
  amountPaid: number;
  changeDue: number;
  status: "completed" | "cancelled" | "refunded";
  createdAt: string;
}

export interface POSBillSavePayload {
  companyId: number;
  branchId?: number | null;
  customerName?: string;
  customerPhone?: string;
  customerGstin?: string;
  items: POSBillItem[];
  discount?: number;
  paymentMode: "cash" | "card" | "upi" | "split";
  amountPaid: number;
}
