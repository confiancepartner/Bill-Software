"use client";

import dynamic from "next/dynamic";
import { Button } from "../../ui/button";
import { formatDate } from "@/lib/utils";
import { InvoiceDoc } from "../Templates/Invoice";
import type { BusinessInfo, ClientInfo, InvoiceTotals, LineItem } from "@/lib/types";

interface InvoicePreviewProps {
  business: BusinessInfo;
  client: ClientInfo;
  items: LineItem[];
  documentNumber: string;
  documentDate: string;
  totals: InvoiceTotals;
}

export default function InvoicePreview({
  business,
  client,
  items,
  documentNumber,
  documentDate,
  totals,
}: InvoicePreviewProps) {
  const PDFViewer = dynamic(() => import("../../pdf/PDFViewerWrapper"), {
    ssr: false,
  });
  const PDFDownloadLink = dynamic(
    () => import("../../pdf/PDFDownloadLinkWrapper"),
    { ssr: false }
  );

  const safeDocumentNumber = documentNumber.trim() || "draft";
  const safeClientName = client.name.trim().replace(/\s+/g, "-") || "client";

  return (
    <div className="flex h-full flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-md">
      <Button className="w-full sm:w-fit">
        <PDFDownloadLink
          document={
            <InvoiceDoc
              business={business}
              client={client}
              items={items}
              invoiceNumber={documentNumber}
              invoiceDate={formatDate(documentDate)}
              totals={totals}
            />
          }
          fileName={`invoice-${safeDocumentNumber}-${safeClientName}.pdf`}
        >
          {({ loading }) => (loading ? "Preparing PDF..." : "Download PDF")}
        </PDFDownloadLink>
      </Button>

      <PDFViewer className="min-h-[620px] w-full flex-1 rounded-md border border-gray-200">
        <InvoiceDoc
          business={business}
          client={client}
          items={items}
          invoiceNumber={documentNumber}
          invoiceDate={formatDate(documentDate)}
          totals={totals}
        />
      </PDFViewer>
    </div>
  );
}
