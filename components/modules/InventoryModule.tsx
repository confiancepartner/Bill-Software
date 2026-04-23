"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { CompanyRecord, GodownRecord, ProductRecord, StockMovement } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type Tab = "products" | "godowns" | "movements";

const UNITS = ["NOS", "KGS", "MTR", "LTR", "BOX", "PCS", "SET", "PAIR", "BAG", "PKT"];
const GST_RATES = [0, 5, 12, 18, 28];

interface Props {
  company: CompanyRecord | null;
  onRefresh?: () => void;
}

function emptyProduct(): Partial<ProductRecord> {
  return { name: "", code: "", type: "product", unit: "NOS", hsnSac: "", gstRate: 18, purchaseRate: 0, saleRate: 0, openingStock: 0, minStock: 0, description: "" };
}
function emptyGodown(companyId: number): Partial<GodownRecord> {
  return { companyId, name: "", code: "", address: "", isDefault: false };
}

export default function InventoryModule({ company }: Props) {
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [godowns, setGodowns] = useState<GodownRecord[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);
  const [showGodownModal, setShowGodownModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<ProductRecord>>(emptyProduct());
  const [editGodown, setEditGodown] = useState<Partial<GodownRecord>>(emptyGodown(company?.id || 0));
  const [movementForm, setMovementForm] = useState({ productId: 0, godownId: 0, movementType: "in", quantity: 1, rate: 0, notes: "", movementDate: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const companyId = company?.id;

  const loadAll = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [p, g, m] = await Promise.all([
        apiClient.getProducts(companyId),
        apiClient.getGodowns(companyId),
        apiClient.getStockMovements(companyId),
      ]);
      setProducts(p);
      setGodowns(g);
      setMovements(m);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, [companyId]);

  const saveProduct = async () => {
    if (!companyId || !editProduct.name) return;
    setSaving(true); setErr(null);
    try {
      await apiClient.saveProduct({ ...editProduct, companyId } as ProductRecord);
      await loadAll();
      setShowProductModal(false);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  };

  const saveGodown = async () => {
    if (!companyId || !editGodown.name) return;
    setSaving(true); setErr(null);
    try {
      await apiClient.saveGodown({ ...editGodown, companyId } as GodownRecord);
      await loadAll();
      setShowGodownModal(false);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  };

  const saveMovement = async () => {
    if (!companyId || !movementForm.productId) return;
    setSaving(true); setErr(null);
    try {
      await apiClient.addStockMovement({ ...movementForm, companyId });
      await loadAll();
      setShowMovementModal(false);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Deactivate this product?")) return;
    await apiClient.deleteProduct(id);
    await loadAll();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "products", label: "Products / Services" },
    { key: "godowns", label: "Godowns" },
    { key: "movements", label: "Stock Movements" },
  ];

  if (!company) return <div className="text-gray-500 text-sm p-4">Select a company to manage inventory.</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900">Inventory</h2>
        <div className="flex gap-2">
          {tab === "products" && (
            <button className="btn btn-primary text-sm" onClick={() => { setEditProduct(emptyProduct()); setShowProductModal(true); }}>+ Add Product</button>
          )}
          {tab === "godowns" && (
            <button className="btn btn-primary text-sm" onClick={() => { setEditGodown(emptyGodown(companyId!)); setShowGodownModal(true); }}>+ Add Godown</button>
          )}
          {tab === "movements" && (
            <button className="btn btn-primary text-sm" onClick={() => { setShowMovementModal(true); }}>+ Add Movement</button>
          )}
        </div>
      </div>

      <div className="flex border-b border-gray-200 gap-0">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? "border-b-2 border-[#c14408] text-[#c14408]" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {err && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{err}</div>}
      {loading && <div className="text-gray-400 text-sm py-4 text-center">Loading...</div>}

      {tab === "products" && !loading && (
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <input className="form-input flex-1" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            <span className="text-xs text-gray-400 whitespace-nowrap">{filteredProducts.length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="bg-gray-50 text-xs uppercase text-gray-500">
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Unit</th>
                <th className="px-4 py-3 text-right">GST%</th>
                <th className="px-4 py-3 text-right">Purchase</th>
                <th className="px-4 py-3 text-right">Sale</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.type === "product" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>{p.type}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.unit}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{p.gstRate}%</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(p.purchaseRate)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(p.saleRate)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${p.currentStock <= p.minStock && p.type === "product" ? "text-red-600" : "text-gray-900"}`}>{p.type === "product" ? p.currentStock : "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-xs text-blue-600 hover:underline" onClick={() => { setEditProduct({ ...p }); setShowProductModal(true); }}>Edit</button>
                        <button className="text-xs text-red-500 hover:underline" onClick={() => deleteProduct(p.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No products yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "godowns" && !loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {godowns.map(g => (
            <div key={g.id} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-900">{g.name}</div>
                  <div className="text-xs text-gray-400 font-mono">{g.code}</div>
                </div>
                {g.isDefault && <span className="text-xs bg-orange-50 text-[#c14408] px-2 py-0.5 rounded-full font-medium">Default</span>}
              </div>
              {g.address && <div className="text-sm text-gray-500 mt-1">{g.address}</div>}
              <div className="mt-3 flex gap-2">
                <button className="text-xs text-blue-600 hover:underline" onClick={() => { setEditGodown({ ...g }); setShowGodownModal(true); }}>Edit</button>
              </div>
            </div>
          ))}
          {godowns.length === 0 && <div className="col-span-3 text-center text-gray-400 py-8">No godowns yet.</div>}
        </div>
      )}

      {tab === "movements" && !loading && (
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="bg-gray-50 text-xs uppercase text-gray-500">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Godown</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-left">Notes</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {movements.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{m.movementDate}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{m.productName}</td>
                    <td className="px-4 py-3 text-gray-500">{m.godownName || "Main"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.movementType === "in" ? "bg-green-50 text-green-700" : m.movementType === "out" ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-600"}`}>
                        {m.movementType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{m.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(m.rate)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{m.notes}</td>
                  </tr>
                ))}
                {movements.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No stock movements yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">{editProduct.id ? "Edit" : "Add"} Product</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="form-label">Name *</label>
                <input className="form-input" value={editProduct.name || ""} onChange={e => setEditProduct(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Code / SKU</label>
                <input className="form-input" value={editProduct.code || ""} onChange={e => setEditProduct(p => ({ ...p, code: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Type</label>
                <select className="form-input" value={editProduct.type || "product"} onChange={e => setEditProduct(p => ({ ...p, type: e.target.value as "product" | "service" }))}>
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div>
                <label className="form-label">Unit</label>
                <select className="form-input" value={editProduct.unit || "NOS"} onChange={e => setEditProduct(p => ({ ...p, unit: e.target.value }))}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">GST Rate %</label>
                <select className="form-input" value={editProduct.gstRate ?? 18} onChange={e => setEditProduct(p => ({ ...p, gstRate: Number(e.target.value) }))}>
                  {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">HSN / SAC Code</label>
                <input className="form-input" value={editProduct.hsnSac || ""} onChange={e => setEditProduct(p => ({ ...p, hsnSac: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Purchase Rate (₹)</label>
                <input className="form-input" type="number" value={editProduct.purchaseRate || 0} onChange={e => setEditProduct(p => ({ ...p, purchaseRate: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="form-label">Sale Rate (₹)</label>
                <input className="form-input" type="number" value={editProduct.saleRate || 0} onChange={e => setEditProduct(p => ({ ...p, saleRate: Number(e.target.value) }))} />
              </div>
              {editProduct.type === "product" && (
                <>
                  <div>
                    <label className="form-label">Opening Stock</label>
                    <input className="form-input" type="number" value={editProduct.openingStock || 0} onChange={e => setEditProduct(p => ({ ...p, openingStock: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="form-label">Min Stock (Reorder)</label>
                    <input className="form-input" type="number" value={editProduct.minStock || 0} onChange={e => setEditProduct(p => ({ ...p, minStock: Number(e.target.value) }))} />
                  </div>
                </>
              )}
              <div className="sm:col-span-2">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={editProduct.description || ""} onChange={e => setEditProduct(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            {err && <div className="text-red-600 text-sm">{err}</div>}
            <div className="flex gap-3 justify-end pt-2">
              <button className="btn btn-secondary" onClick={() => setShowProductModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={saveProduct}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {showGodownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">{editGodown.id ? "Edit" : "Add"} Godown</h3>
            <div>
              <label className="form-label">Name *</label>
              <input className="form-input" value={editGodown.name || ""} onChange={e => setEditGodown(g => ({ ...g, name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Code</label>
              <input className="form-input" value={editGodown.code || ""} onChange={e => setEditGodown(g => ({ ...g, code: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Address</label>
              <textarea className="form-input" rows={2} value={editGodown.address || ""} onChange={e => setEditGodown(g => ({ ...g, address: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={!!editGodown.isDefault} onChange={e => setEditGodown(g => ({ ...g, isDefault: e.target.checked }))} />
              Set as default godown
            </label>
            {err && <div className="text-red-600 text-sm">{err}</div>}
            <div className="flex gap-3 justify-end pt-2">
              <button className="btn btn-secondary" onClick={() => setShowGodownModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={saveGodown}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {showMovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Add Stock Movement</h3>
            <div>
              <label className="form-label">Product *</label>
              <select className="form-input" value={movementForm.productId} onChange={e => setMovementForm(f => ({ ...f, productId: Number(e.target.value) }))}>
                <option value={0}>Select product...</option>
                {products.filter(p => p.type === "product").map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Godown</label>
              <select className="form-input" value={movementForm.godownId} onChange={e => setMovementForm(f => ({ ...f, godownId: Number(e.target.value) }))}>
                <option value={0}>Main / Default</option>
                {godowns.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Type</label>
                <select className="form-input" value={movementForm.movementType} onChange={e => setMovementForm(f => ({ ...f, movementType: e.target.value }))}>
                  <option value="in">Inward</option>
                  <option value="out">Outward</option>
                  <option value="transfer">Transfer</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>
              <div>
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" min={1} value={movementForm.quantity} onChange={e => setMovementForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="form-label">Rate (₹)</label>
                <input className="form-input" type="number" value={movementForm.rate} onChange={e => setMovementForm(f => ({ ...f, rate: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={movementForm.movementDate} onChange={e => setMovementForm(f => ({ ...f, movementDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="form-label">Notes</label>
              <input className="form-input" value={movementForm.notes} onChange={e => setMovementForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            {err && <div className="text-red-600 text-sm">{err}</div>}
            <div className="flex gap-3 justify-end pt-2">
              <button className="btn btn-secondary" onClick={() => setShowMovementModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={saveMovement}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
