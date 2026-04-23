"use client";

import type { InvoiceTotals } from "@/lib/types";
import { formatCurrency, numberToWords } from "@/lib/utils";

interface InvoiceSummaryProps {
  totals: InvoiceTotals;
}

export default function InvoiceSummary({ totals }: InvoiceSummaryProps) {
  const totalInWords = numberToWords(totals.total)
    .replace(/rupees/gi, "Rupees")
    .replace(/paisa/gi, "Paise");

  return (
    <div className="notion-style">
      <h2 className="notion-header">Invoice Summary</h2>
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-600 sm:text-base">
          <span>Subtotal:</span>
          <span className="font-medium text-gray-800">
            {formatCurrency(totals.subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 sm:text-base">
          <span>CGST:</span>
          <span className="font-medium text-gray-800">
            {formatCurrency(totals.cgst)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 sm:text-base">
          <span>SGST:</span>
          <span className="font-medium text-gray-800">
            {formatCurrency(totals.sgst)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 sm:text-base">
          <span>Round Off:</span>
          <span className="font-medium text-gray-800">
            {formatCurrency(totals.round_off)}
          </span>
        </div>
        <hr className="my-2" />
        <div className="flex items-center justify-between text-base font-bold text-gray-900 sm:text-lg">
          <span>Net Total:</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <label className="form-label text-xs sm:text-sm" htmlFor="totalInWords">
          Total (in words):
        </label>
        <input
          className="form-input text-xs sm:text-sm"
          id="totalInWords"
          type="text"
          value={totalInWords}
          readOnly
        />
      </div>
    </div>
  );
}
