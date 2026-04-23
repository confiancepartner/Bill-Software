"use client";

import type { ClientInfo } from "@/lib/types";

interface ClientInfoFormProps {
  title?: string;
  value: ClientInfo;
  onChange: (value: ClientInfo) => void;
}

export default function ClientInfoForm({
  title = "Client Information",
  value,
  onChange,
}: ClientInfoFormProps) {
  const updateField = (field: keyof ClientInfo, nextValue: string) => {
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <div className="notion-style">
      <h2 className="notion-header">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <div>
          <label className="form-label" htmlFor="partyName">
            Name
          </label>
          <input
            className="form-input"
            id="partyName"
            type="text"
            value={value.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Enter name"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="partyCompany">
            Company
          </label>
          <input
            className="form-input"
            id="partyCompany"
            type="text"
            value={value.company}
            onChange={(event) => updateField("company", event.target.value)}
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="partyEmail">
            Email
          </label>
          <input
            className="form-input"
            id="partyEmail"
            type="email"
            value={value.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="partyPhone">
            Phone
          </label>
          <input
            className="form-input"
            id="partyPhone"
            type="tel"
            value={value.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="Enter phone number"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="form-label" htmlFor="partyAddress">
            Address
          </label>
          <textarea
            className="form-input min-h-24"
            id="partyAddress"
            rows={3}
            value={value.address}
            onChange={(event) => updateField("address", event.target.value)}
            placeholder="Enter address"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="form-label" htmlFor="partyGstin">
            GSTIN
          </label>
          <input
            className="form-input"
            id="partyGstin"
            type="text"
            value={value.gstin}
            onChange={(event) => updateField("gstin", event.target.value)}
            placeholder="Enter GSTIN"
          />
        </div>
      </div>
    </div>
  );
}
