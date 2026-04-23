"use client";

import { useMemo, useState } from "react";
import type { LineItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import ItemModal from "./ItemModal";

interface LineItemsTableProps {
  title?: string;
  items: LineItem[];
  sameGst: boolean;
  globalGst: number;
  onChange: (items: LineItem[]) => void;
  onSameGstChange: (value: boolean) => void;
  onGlobalGstChange: (value: number) => void;
}

export default function LineItemsTable({
  title = "Items",
  items,
  sameGst,
  globalGst,
  onChange,
  onSameGstChange,
  onGlobalGstChange,
}: LineItemsTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LineItem | null>(null);

  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        gst: sameGst ? globalGst : item.gst,
        amount: Number(item.quantity) * Number(item.rate),
      })),
    [globalGst, items, sameGst]
  );

  const handleSave = (item: LineItem) => {
    if (editingItem) {
      onChange(
        normalizedItems.map((currentItem) =>
          currentItem.id === editingItem.id ? item : currentItem
        )
      );
    } else {
      onChange([...normalizedItems, item]);
    }
  };

  const handleSameGstToggle = (checked: boolean) => {
    onSameGstChange(checked);
    if (checked) {
      onChange(
        normalizedItems.map((item) => ({
          ...item,
          gst: globalGst,
        }))
      );
    }
  };

  const handleGlobalTaxChange = (nextValue: number) => {
    onGlobalGstChange(nextValue);
    if (sameGst) {
      onChange(
        normalizedItems.map((item) => ({
          ...item,
          gst: nextValue,
        }))
      );
    }
  };

  return (
    <div className="notion-style">
      <div className="mb-4 flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
        <h2 className="notion-header mb-0">{title}</h2>
        <div className="flex w-full flex-col items-start space-y-2 sm:w-auto sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <label className="flex items-center text-xs font-medium text-gray-700 sm:text-sm">
            <input
              type="checkbox"
              checked={sameGst}
              onChange={(event) => handleSameGstToggle(event.target.checked)}
              className="mr-2 h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:h-4 sm:w-4"
            />
            Apply same GST to all items
          </label>
          {sameGst && (
            <select
              value={globalGst}
              onChange={(event) => handleGlobalTaxChange(Number(event.target.value))}
              className="form-input w-auto text-xs sm:text-sm"
            >
              <option value={0}>GST 0%</option>
              <option value={5}>GST 5%</option>
              <option value={12}>GST 12%</option>
              <option value={18}>GST 18%</option>
              <option value={28}>GST 28%</option>
            </select>
          )}
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto"
          >
            <span className="material-icons mr-1 text-xs sm:mr-2 sm:text-sm">
              add
            </span>
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="block sm:hidden">
        {normalizedItems.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No items added yet. Click &quot;Add&quot; to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {normalizedItems.map((item) => (
              <div key={item.id} className="rounded-lg border bg-gray-50 p-3">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <div
                      className="text-sm font-medium"
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                    >
                      {item.description || "Click to edit"}
                    </div>
                    <div className="text-xs text-gray-500">
                      HSN/SAC: {item.hsnSac}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <span className="material-icons text-sm">edit</span>
                    </button>
                    <button
                      onClick={() =>
                        onChange(
                          normalizedItems.filter(
                            (currentItem) => currentItem.id !== item.id
                          )
                        )
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Qty: {item.quantity}</div>
                  <div>Rate: {formatCurrency(item.rate)}</div>
                  <div>Per: {item.per}</div>
                  <div>GST: {item.gst}%</div>
                </div>
                <div className="mt-2 border-t border-gray-200 pt-2 text-sm font-medium">
                  Amount: {formatCurrency(item.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead>
            <tr className="table-header text-left text-gray-600">
              <th className="table-cell rounded-l-md text-xs font-medium sm:text-sm">
                Description
              </th>
              <th className="table-cell text-xs font-medium sm:text-sm">
                HSN/SAC
              </th>
              <th className="table-cell text-xs font-medium sm:text-sm">Qty</th>
              <th className="table-cell text-xs font-medium sm:text-sm">Rate</th>
              <th className="table-cell text-xs font-medium sm:text-sm">Per</th>
              <th className="table-cell text-xs font-medium sm:text-sm">GST %</th>
              <th className="table-cell text-xs font-medium sm:text-sm">
                Amount
              </th>
              <th className="table-cell rounded-r-md text-xs font-medium sm:text-sm">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {normalizedItems.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="table-cell py-8 text-center text-xs text-gray-500 sm:text-sm"
                >
                  No items added yet. Click &quot;Add Item&quot; to get started.
                </td>
              </tr>
            ) : (
              normalizedItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td
                    className="table-cell cursor-pointer text-xs hover:bg-gray-50 sm:text-sm"
                    onClick={() => {
                      setEditingItem(item);
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="flex items-center">
                      <span className="material-icons mr-2 text-xs text-gray-400 sm:text-sm">
                        edit
                      </span>
                      {item.description || "Click to edit"}
                    </div>
                  </td>
                  <td className="table-cell text-xs sm:text-sm">{item.hsnSac}</td>
                  <td className="table-cell text-xs sm:text-sm">{item.quantity}</td>
                  <td className="table-cell text-xs sm:text-sm">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="table-cell text-xs sm:text-sm">{item.per}</td>
                  <td className="table-cell text-xs sm:text-sm">{item.gst}%</td>
                  <td className="table-cell text-xs sm:text-sm">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <span className="material-icons text-xs sm:text-sm">
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          onChange(
                            normalizedItems.filter(
                              (currentItem) => currentItem.id !== item.id
                            )
                          )
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <span className="material-icons text-xs sm:text-sm">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        isEdit={!!editingItem}
        sameGst={sameGst}
        globalGst={globalGst}
        onSave={handleSave}
      />
    </div>
  );
}
