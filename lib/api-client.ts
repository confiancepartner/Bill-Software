import type {
  BankTransaction,
  BankTransactionSavePayload,
  BootstrapPayload,
  BranchSavePayload,
  CashBankAccount,
  CashBankAccountSavePayload,
  ClientSavePayload,
  CompanySavePayload,
  CustomerRecord,
  CustomerSavePayload,
  GodownRecord,
  GodownSavePayload,
  InvoicePaymentSummary,
  InvoiceSavePayload,
  LoginPayload,
  PaymentSavePayload,
  POSBill,
  POSBillSavePayload,
  ProductRecord,
  ProductSavePayload,
  PurchaseSavePayload,
  RecurringInvoice,
  RecurringSavePayload,
  RegisterPayload,
  SessionUser,
  StockMovement,
  StockMovementSavePayload,
  SubscriptionSavePayload,
  TenantInfo,
  UserSavePayload,
  VendorRecord,
  VendorSavePayload,
} from "@/lib/types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorPayload = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(errorPayload.message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  login(payload: LoginPayload) {
    return request<{ user: SessionUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  logout() {
    return request<void>("/api/auth/logout", { method: "POST" });
  },
  me() {
    return request<{ user: SessionUser }>("/api/auth/me");
  },
  tenant(tenantOverride?: string | null) {
    const suffix = tenantOverride ? `?tenant=${encodeURIComponent(tenantOverride)}` : "";
    return request<TenantInfo>(`/api/tenant${suffix}`);
  },
  bootstrap(companyId?: number | null, branchId?: number | null) {
    const params = new URLSearchParams();
    if (companyId) params.set("companyId", String(companyId));
    if (branchId) params.set("branchId", String(branchId));
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return request<BootstrapPayload>(`/api/bootstrap${suffix}`);
  },
  register(payload: RegisterPayload) {
    return request<{ message: string; subdomain: string; clientId: number }>(
      "/api/register",
      { method: "POST", body: JSON.stringify(payload) }
    );
  },
  createRazorpayOrder(amountInPaise: number, planName: string) {
    return request<{ orderId: string; amount: number; currency: string }>(
      "/api/razorpay/order",
      { method: "POST", body: JSON.stringify({ amountInPaise, planName }) }
    );
  },
  verifyRazorpayPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    registrationData: RegisterPayload;
  }) {
    return request<{ message: string; subdomain: string; clientId: number }>(
      "/api/razorpay/verify",
      { method: "POST", body: JSON.stringify(payload) }
    );
  },
  saveInvoice(payload: InvoiceSavePayload) {
    return request<void>("/api/invoices", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  savePurchase(payload: PurchaseSavePayload) {
    return request<void>("/api/purchases", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  saveBranch(payload: BranchSavePayload) {
    return request<void>("/api/admin/branches", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  saveUser(payload: UserSavePayload) {
    return request<void>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  saveCompany(payload: CompanySavePayload) {
    return request<void>("/api/admin/company", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  saveClient(payload: ClientSavePayload) {
    return request<void>("/api/super-admin/clients", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  saveSubscription(payload: SubscriptionSavePayload) {
    return request<void>("/api/super-admin/subscriptions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  // ─── Customers ─────────────────────────────────────────────────────────────
  getCustomers(companyId: number) {
    return request<CustomerRecord[]>(`/api/customers?companyId=${companyId}`);
  },
  saveCustomer(payload: CustomerSavePayload) {
    return request<void>("/api/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  deleteCustomer(id: number) {
    return request<void>(`/api/customers/${id}`, { method: "DELETE" });
  },
  // ─── Vendors ───────────────────────────────────────────────────────────────
  getVendors(companyId: number) {
    return request<VendorRecord[]>(`/api/vendors?companyId=${companyId}`);
  },
  saveVendor(payload: VendorSavePayload) {
    return request<void>("/api/vendors", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  deleteVendor(id: number) {
    return request<void>(`/api/vendors/${id}`, { method: "DELETE" });
  },
  // ─── Payments ──────────────────────────────────────────────────────────────
  getInvoicePayments(invoiceId: number) {
    return request<InvoicePaymentSummary>(`/api/invoices/${invoiceId}/payments`);
  },
  recordPayment(invoiceId: number, payload: PaymentSavePayload) {
    return request<void>(`/api/invoices/${invoiceId}/payments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  deletePayment(invoiceId: number, paymentId: number) {
    return request<void>(`/api/invoices/${invoiceId}/payments/${paymentId}`, {
      method: "DELETE",
    });
  },
  // ─── Share ─────────────────────────────────────────────────────────────────
  getInvoiceShareUrl(invoiceId: number) {
    return request<{ token: string; url: string }>(`/api/invoices/${invoiceId}/share`);
  },
  sendInvoiceEmail(invoiceId: number, recipientEmail?: string) {
    return request<{ message: string; shareUrl: string }>(
      `/api/invoices/${invoiceId}/send-email`,
      { method: "POST", body: JSON.stringify({ recipientEmail }) }
    );
  },
  // ─── Subscription ──────────────────────────────────────────────────────────
  upgradePlan(planName: string) {
    return request<void>("/api/admin/subscription/upgrade", {
      method: "POST",
      body: JSON.stringify({ planName }),
    });
  },
  renewSubscription(months: number = 1) {
    return request<{ message: string; newEndDate: string }>(
      "/api/admin/subscription/renew",
      { method: "POST", body: JSON.stringify({ months }) }
    );
  },
  // ─── Products / Inventory ───────────────────────────────────────────────────
  getProducts(companyId: number) {
    return request<ProductRecord[]>(`/api/products?companyId=${companyId}`);
  },
  saveProduct(payload: ProductSavePayload) {
    return request<{ id: number }>("/api/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  deleteProduct(id: number) {
    return request<void>(`/api/products/${id}`, { method: "DELETE" });
  },
  getGodowns(companyId: number) {
    return request<GodownRecord[]>(`/api/godowns?companyId=${companyId}`);
  },
  saveGodown(payload: GodownSavePayload) {
    return request<{ id: number }>("/api/godowns", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  deleteGodown(id: number) {
    return request<void>(`/api/godowns/${id}`, { method: "DELETE" });
  },
  getStockMovements(companyId: number, productId?: number) {
    const qs = productId
      ? `?companyId=${companyId}&productId=${productId}`
      : `?companyId=${companyId}`;
    return request<StockMovement[]>(`/api/stock-movements${qs}`);
  },
  addStockMovement(payload: StockMovementSavePayload) {
    return request<void>("/api/stock-movements", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  // ─── Cash & Bank ───────────────────────────────────────────────────────────
  getCashBankAccounts(companyId: number) {
    return request<CashBankAccount[]>(`/api/cash-bank/accounts?companyId=${companyId}`);
  },
  saveCashBankAccount(payload: CashBankAccountSavePayload) {
    return request<{ id: number }>("/api/cash-bank/accounts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  deleteCashBankAccount(id: number) {
    return request<void>(`/api/cash-bank/accounts/${id}`, { method: "DELETE" });
  },
  getBankTransactions(companyId: number, accountId?: number) {
    const qs = accountId
      ? `?companyId=${companyId}&accountId=${accountId}`
      : `?companyId=${companyId}`;
    return request<BankTransaction[]>(`/api/cash-bank/transactions${qs}`);
  },
  addBankTransaction(payload: BankTransactionSavePayload) {
    return request<void>("/api/cash-bank/transactions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  deleteBankTransaction(id: number) {
    return request<void>(`/api/cash-bank/transactions/${id}`, { method: "DELETE" });
  },
  // ─── Recurring Invoices ─────────────────────────────────────────────────────
  getRecurring(companyId: number) {
    return request<RecurringInvoice[]>(`/api/recurring?companyId=${companyId}`);
  },
  saveRecurring(payload: RecurringSavePayload) {
    return request<{ id: number }>("/api/recurring", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  deleteRecurring(id: number) {
    return request<void>(`/api/recurring/${id}`, { method: "DELETE" });
  },
  triggerRecurring(id: number) {
    return request<{ invoiceId: number }>(`/api/recurring/${id}/trigger`, {
      method: "POST",
    });
  },
  // ─── POS ───────────────────────────────────────────────────────────────────
  getPOSBills(companyId: number) {
    return request<POSBill[]>(`/api/pos/bills?companyId=${companyId}`);
  },
  savePOSBill(payload: POSBillSavePayload) {
    return request<{ id: number; billNumber: string }>("/api/pos/bills", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
