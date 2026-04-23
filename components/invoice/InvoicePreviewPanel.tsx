"use client";

import type { BusinessInfo, ClientInfo, InvoiceTotals, LineItem } from "@/lib/types";
import InvoicePreview from "./Preview/InvoicePreview";

interface InvoicePreviewPanelProps {
  business: BusinessInfo;
  client: ClientInfo;
  items: LineItem[];
  documentNumber: string;
  documentDate: string;
  totals: InvoiceTotals;
}

export default function InvoicePreviewPanel(props: InvoicePreviewPanelProps) {
  return (
    <div className="sticky top-20 xl:h-[calc(100vh-7rem)]">
      <InvoicePreview {...props} />
    </div>
  );
}
