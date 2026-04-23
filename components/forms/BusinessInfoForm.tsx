"use client";

import type { BusinessInfo } from "@/lib/types";

interface BusinessInfoFormProps {
  business: BusinessInfo;
  documentNumber: string;
  documentDate: string;
  sectionTitle?: string;
  numberLabel?: string;
  dateLabel?: string;
  onBusinessChange: (business: BusinessInfo) => void;
  onMetaChange: (meta: { documentNumber?: string; documentDate?: string }) => void;
}

export default function BusinessInfoForm({
  business,
  documentNumber,
  documentDate,
  sectionTitle = "Business Information",
  numberLabel = "Invoice Number",
  dateLabel = "Invoice Date",
  onBusinessChange,
  onMetaChange,
}: BusinessInfoFormProps) {
  const updateBusiness = (field: keyof BusinessInfo, value: string) => {
    onBusinessChange({ ...business, [field]: value });
  };

  return (
    <div className="notion-style">
      <h2 className="notion-header">{sectionTitle}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="form-label" htmlFor="companyName">
            Company Name
          </label>
          <input
            className="form-input"
            id="companyName"
            type="text"
            value={business.name}
            onChange={(event) => updateBusiness("name", event.target.value)}
            placeholder="BillForge India Pvt Ltd"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="form-label" htmlFor="gstin">
            GSTIN/UIN
          </label>
          <input
            className="form-input"
            id="gstin"
            type="text"
            value={business.gstin}
            onChange={(event) => updateBusiness("gstin", event.target.value)}
            maxLength={15}
            placeholder="24ABCDE1234F1Z5"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label" htmlFor="address">
            Address
          </label>
          <textarea
            className="form-input min-h-24"
            id="address"
            value={business.address}
            onChange={(event) => updateBusiness("address", event.target.value)}
            placeholder="Enter registered office or branch address"
          />
        </div>
        <div>
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            className="form-input"
            id="email"
            type="email"
            value={business.email}
            onChange={(event) => updateBusiness("email", event.target.value)}
            placeholder="accounts@company.com"
          />
        </div>
        <div>
          <label className="form-label" htmlFor="phone">
            Phone
          </label>
          <input
            className="form-input"
            id="phone"
            type="text"
            value={business.phone}
            onChange={(event) => updateBusiness("phone", event.target.value)}
            placeholder="9876543210"
          />
        </div>
        <div>
          <label className="form-label" htmlFor="documentNumber">
            {numberLabel}
          </label>
          <input
            className="form-input"
            id="documentNumber"
            type="text"
            value={documentNumber}
            onChange={(event) =>
              onMetaChange({ documentNumber: event.target.value })
            }
          />
        </div>
        <div>
          <label className="form-label" htmlFor="documentDate">
            {dateLabel}
          </label>
          <input
            className="form-input"
            id="documentDate"
            type="date"
            value={documentDate}
            onChange={(event) =>
              onMetaChange({ documentDate: event.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}
