"use client";
import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { BranchRecord, CompanyRecord, POSBill, ProductRecord } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface CartItem {
  productId: number;
  name: string;
  unit: string;
  gstRate: number;
  rate: number;
  quantity: number;
}

interface Props {
  company: CompanyRecord | null;
  branch: BranchRecord | null;
}

export default function POSModule({ company, branch }: Props) {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bills, setBills] = useState<POSBill[]>([]);
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showBills, setShowBills] = useState(false);
  const [lastBill, setLastBill] = useState<{ billNumber: string; total: number; change: number } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const companyId = company?.id;

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    Promise.all([apiClient.getProducts(companyId), apiClient.getPOSBills(companyId)])
      .then(([p, b]) => { setProducts(p); setBills(b); })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [companyId]);

  const filteredProducts = products.filter(p =>
    p.isActive && (p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (product: ProductRecord) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.id, name: product.name, unit: product.unit, gstRate: product.gstRate, rate: product.saleRate, quantity: 1 }];
    });
    setSearch("");
    searchRef.current?.focus();
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.productId !== productId));
    else setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
  };

  const updateRate = (productId: number, rate: number) => {
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, rate } : i));
  };

  const subtotal = cart.reduce((s, i) => s + i.quantity * i.rate, 0);
  const taxableAmount = subtotal - discount;
  const cgst = cart.reduce((s, i) => s + i.quantity * i.rate * i.gstRate / 200, 0);
  const sgst = cgst;
  const total = Math.round(taxableAmount + cgst + sgst);
  const changeDue = Math.max(0, amountPaid - total);

  const checkout = async () => {
    if (!companyId || cart.length === 0) return;
    setSaving(true); setErr(null);
    try {
      const res = await apiClient.savePOSBill({
        companyId, branchId: branch?.id, customerName, customerPhone,
        items: cart, discount, amountPaid: amountPaid || total, paymentMode,
      });
      setLastBill({ billNumber: res.billNumber, total, change: changeDue });
      setCart([]);
      setDiscount(0);
      setAmountPaid(0);
      setCustomerName("Walk-in Customer");
      setCustomerPhone("");
      const newBills = await apiClient.getPOSBills(companyId);
      setBills(newBills);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  };

  if (!company) return <div className="text-gray-500 text-sm p-4">Select a company to use POS.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Point of Sale</h2>
        <button className="text-sm text-blue-600 hover:underline" onClick={() => setShowBills(v => !v)}>
          {showBills ? "← Back to POS" : `View Bills (${bills.length})`}
        </button>
      </div>

      {err && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{err}</div>}

      {lastBill && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-green-800 text-sm">
          <strong>Bill #{lastBill.billNumber}</strong> created — Total: {formatCurrency(lastBill.total)}{lastBill.change > 0 ? `, Change: ${formatCurrency(lastBill.change)}` : ""}
          <button className="ml-3 text-green-600 underline text-xs" onClick={() => setLastBill(null)}>Dismiss</button>
        </div>
      )}

      {showBills ? (
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="bg-gray-50 text-xs uppercase text-gray-500">
                <th className="px-4 py-3 text-left">Bill #</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-right">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Mode</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {bills.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{b.billNumber}</td>
                    <td className="px-4 py-3 text-gray-500">{b.billDate}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{b.customerName}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{b.items.length}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(b.total)}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{b.paymentMode}</span></td>
                  </tr>
                ))}
                {bills.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No bills yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-4">
              <input
                ref={searchRef}
                className="form-input"
                placeholder="Search products by name or code..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="mt-3 grid gap-2 grid-cols-2 sm:grid-cols-3 max-h-72 overflow-y-auto">
                {loading ? <div className="col-span-3 text-center text-gray-400 py-4 text-sm">Loading...</div> : filteredProducts.map(p => (
                  <button key={p.id} onClick={() => addToCart(p)}
                    className="rounded-xl border border-gray-200 p-3 text-left hover:border-[#c14408] hover:shadow-sm transition-all group">
                    <div className="text-xs text-gray-400 font-mono mb-1">{p.code}</div>
                    <div className="text-sm font-medium text-gray-900 group-hover:text-[#c14408] line-clamp-2">{p.name}</div>
                    <div className="mt-1 font-semibold text-gray-800 text-sm">{formatCurrency(p.saleRate)}</div>
                    {p.type === "product" && (
                      <div className={`text-xs mt-0.5 ${p.currentStock <= p.minStock ? "text-red-500" : "text-gray-400"}`}>Stock: {p.currentStock}</div>
                    )}
                  </button>
                ))}
                {filteredProducts.length === 0 && <div className="col-span-3 text-center text-gray-400 py-4 text-sm">No products found.</div>}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-gray-900">Current Bill</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="form-label text-xs">Customer</label>
                <input className="form-input text-sm" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>
              <div>
                <label className="form-label text-xs">Phone</label>
                <input className="form-input text-sm" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
              </div>
            </div>

            <div className="flex-1 space-y-2 max-h-56 overflow-y-auto">
              {cart.length === 0 && <div className="text-gray-400 text-sm text-center py-4">Click products to add to cart</div>}
              {cart.map(item => (
                <div key={item.productId} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-gray-400">Rate: ₹</span>
                      <input type="number" className="w-16 text-xs border border-gray-200 rounded px-1 py-0.5" value={item.rate} onChange={e => updateRate(item.productId, Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="w-6 h-6 rounded-full border border-gray-300 text-gray-600 text-xs hover:bg-gray-100" onClick={() => updateQty(item.productId, item.quantity - 1)}>−</button>
                    <input type="number" className="w-10 text-xs text-center border border-gray-200 rounded px-1 py-0.5" value={item.quantity} onChange={e => updateQty(item.productId, Number(e.target.value))} />
                    <button className="w-6 h-6 rounded-full border border-gray-300 text-gray-600 text-xs hover:bg-gray-100" onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                  </div>
                  <div className="text-sm font-semibold text-gray-800 w-16 text-right">{formatCurrency(item.quantity * item.rate)}</div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Discount (₹)</span>
                <input type="number" className="w-20 text-sm text-right border border-gray-200 rounded px-2 py-0.5" value={discount || ""} onChange={e => setDiscount(Number(e.target.value))} />
              </div>
              <div className="flex justify-between text-gray-600"><span>CGST</span><span>{formatCurrency(cgst)}</span></div>
              <div className="flex justify-between text-gray-600"><span>SGST</span><span>{formatCurrency(sgst)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="form-label text-xs">Payment Mode</label>
                  <select className="form-input text-sm" value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
                <div>
                  <label className="form-label text-xs">Amount Paid (₹)</label>
                  <input type="number" className="form-input text-sm" value={amountPaid || ""} placeholder={String(total)} onChange={e => setAmountPaid(Number(e.target.value))} />
                </div>
              </div>
              {amountPaid > 0 && changeDue > 0 && (
                <div className="text-sm font-semibold text-green-700 bg-green-50 rounded-lg px-3 py-2">Change due: {formatCurrency(changeDue)}</div>
              )}
            </div>

            <button className="btn btn-primary w-full text-base py-3 disabled:opacity-50" disabled={saving || cart.length === 0} onClick={checkout}>
              {saving ? "Processing..." : `Checkout — ${formatCurrency(total)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
