"use client";

import React, { useEffect, useState } from "react";
import type { LineItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: LineItem | null;
  isEdit?: boolean;
  sameGst: boolean;
  globalGst: number;
  onSave: (item: LineItem) => void;
}

export default function ItemModal({
  isOpen,
  onClose,
  item,
  isEdit = false,
  sameGst,
  globalGst,
  onSave,
}: ItemModalProps) {
  const [formData, setFormData] = useState<LineItem>({
    id: "",
    description: "",
    hsnSac: "",
    quantity: 1,
    rate: 0,
    per: "NOS",
    gst: 18,
    amount: 0,
  });

  useEffect(() => {
    if (isEdit && item) {
      setFormData(item);
    } else {
      setFormData({
        id: `${Date.now()}`,
        description: "",
        hsnSac: "",
        quantity: 1,
        rate: 0,
        per: "NOS",
        gst: sameGst ? globalGst : 18,
        amount: 0,
      });
    }
  }, [globalGst, isEdit, isOpen, item, sameGst]);

  const handleInputChange = (field: keyof LineItem, value: string | number) => {
    setFormData((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };
      return {
        ...next,
        gst: sameGst ? globalGst : Number(next.gst),
        amount: Number(next.quantity) * Number(next.rate),
      };
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({
      ...formData,
      gst: sameGst ? globalGst : formData.gst,
      amount: Number(formData.quantity) * Number(formData.rate),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Item" : "Add New Item"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label" htmlFor="description">
              Product Description *
            </label>
            <input
              type="text"
              id="description"
              className="form-input"
              value={formData.description}
              onChange={(event) =>
                handleInputChange("description", event.target.value)
              }
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="hsnSac">
              HSN/SAC Code
            </label>
            <input
              type="text"
              id="hsnSac"
              className="form-input"
              value={formData.hsnSac}
              onChange={(event) =>
                handleInputChange("hsnSac", event.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label" htmlFor="quantity">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                className="form-input"
                value={formData.quantity}
                onChange={(event) =>
                  handleInputChange("quantity", Number(event.target.value))
                }
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="form-label" htmlFor="per">
                Unit
              </label>
              <select
                id="per"
                className="form-input"
                value={formData.per}
                onChange={(event) => handleInputChange("per", event.target.value)}
              >
                <option value="NOS">NOS</option>
                <option value="KG">KG</option>
                <option value="LTR">LTR</option>
                <option value="MTR">MTR</option>
                <option value="SQM">SQM</option>
                <option value="SQFT">SQFT</option>
                <option value="BOX">BOX</option>
                <option value="SET">SET</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label" htmlFor="rate">
                Rate *
              </label>
              <input
                type="number"
                id="rate"
                className="form-input"
                value={formData.rate}
                onChange={(event) =>
                  handleInputChange("rate", Number(event.target.value))
                }
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="form-label" htmlFor="gst">
                GST (%)
              </label>
              {sameGst ? (
                <input
                  type="text"
                  className="form-input bg-gray-100"
                  value={`${globalGst}%`}
                  disabled
                />
              ) : (
                <select
                  id="gst"
                  className="form-input"
                  value={formData.gst}
                  onChange={(event) =>
                    handleInputChange("gst", Number(event.target.value))
                  }
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              )}
            </div>
          </div>

          <div className="rounded-md bg-gray-50 p-3">
            <div className="flex justify-between text-sm">
              <span>Amount:</span>
              <span className="font-medium">{formatCurrency(formData.amount)}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!formData.description || formData.rate <= 0}
            >
              {isEdit ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
