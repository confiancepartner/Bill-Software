"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ClientAccount,
  ClientSavePayload,
  ClientStatus,
  SubscriptionRecord,
  SubscriptionSavePayload,
} from "@/lib/types";

interface SuperAdminModuleProps {
  clients: ClientAccount[];
  subscriptions: SubscriptionRecord[];
  onSaveClient: (payload: ClientSavePayload) => Promise<void>;
  onSaveSubscription: (payload: SubscriptionSavePayload) => Promise<void>;
}

export default function SuperAdminModule({
  clients,
  subscriptions,
  onSaveClient,
  onSaveSubscription,
}: SuperAdminModuleProps) {
  const [clientDraft, setClientDraft] = useState<ClientSavePayload>({
    clientName: "",
    contactName: "",
    contactEmail: "",
    phone: "",
    status: "trial",
    subdomain: "",
    companyName: "",
    companyGstin: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "Admin@123",
  });

  const [subscriptionDraft, setSubscriptionDraft] =
    useState<SubscriptionSavePayload>({
      clientId: clients[0]?.id || 0,
      planName: "Starter",
      status: "trial",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      userLimit: 5,
      branchLimit: 2,
    });

  const statusOptions = useMemo<ClientStatus[]>(
    () => ["trial", "active", "suspended"],
    []
  );

  useEffect(() => {
    if (clients.length > 0 && !subscriptionDraft.clientId) {
      setSubscriptionDraft((current) => ({
        ...current,
        clientId: clients[0].id,
      }));
    }
  }, [clients, subscriptionDraft.clientId]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900">
          Super Admin Panel
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage SaaS clients, tenant companies, and subscription plans.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="notion-style">
          <h3 className="notion-header">Add Client Tenant</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="form-input"
              placeholder="Client name"
              value={clientDraft.clientName}
              onChange={(event) =>
                setClientDraft({ ...clientDraft, clientName: event.target.value })
              }
            />
            <select
              className="form-input"
              value={clientDraft.status}
              onChange={(event) =>
                setClientDraft({
                  ...clientDraft,
                  status: event.target.value as ClientStatus,
                })
              }
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input
              className="form-input"
              placeholder="Contact name"
              value={clientDraft.contactName}
              onChange={(event) =>
                setClientDraft({ ...clientDraft, contactName: event.target.value })
              }
            />
            <input
              className="form-input"
              placeholder="Contact email"
              value={clientDraft.contactEmail}
              onChange={(event) =>
                setClientDraft({
                  ...clientDraft,
                  contactEmail: event.target.value,
                })
              }
            />
            <input
              className="form-input sm:col-span-2"
              placeholder="Phone"
              value={clientDraft.phone}
              onChange={(event) =>
                setClientDraft({ ...clientDraft, phone: event.target.value })
              }
            />
            <div className="sm:col-span-2">
              <label className="form-label">Subdomain (auto-generated if blank)</label>
              <div className="flex items-center gap-2">
                <input
                  className="form-input flex-1"
                  placeholder="e.g. acme-corp"
                  value={clientDraft.subdomain || ""}
                  onChange={(event) =>
                    setClientDraft({ ...clientDraft, subdomain: event.target.value })
                  }
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                This becomes the company&apos;s login subdomain (e.g. acme-corp.yourdomain.com)
              </p>
            </div>
            <input
              className="form-input"
              placeholder="Company name"
              value={clientDraft.companyName}
              onChange={(event) =>
                setClientDraft({ ...clientDraft, companyName: event.target.value })
              }
            />
            <input
              className="form-input"
              placeholder="Company GSTIN"
              value={clientDraft.companyGstin}
              onChange={(event) =>
                setClientDraft({
                  ...clientDraft,
                  companyGstin: event.target.value,
                })
              }
            />
            <input
              className="form-input"
              placeholder="Company email"
              value={clientDraft.companyEmail}
              onChange={(event) =>
                setClientDraft({
                  ...clientDraft,
                  companyEmail: event.target.value,
                })
              }
            />
            <input
              className="form-input"
              placeholder="Company phone"
              value={clientDraft.companyPhone}
              onChange={(event) =>
                setClientDraft({
                  ...clientDraft,
                  companyPhone: event.target.value,
                })
              }
            />
            <textarea
              className="form-input min-h-24 sm:col-span-2"
              placeholder="Company address"
              value={clientDraft.companyAddress}
              onChange={(event) =>
                setClientDraft({
                  ...clientDraft,
                  companyAddress: event.target.value,
                })
              }
            />
            <input
              className="form-input"
              placeholder="Tenant admin name"
              value={clientDraft.adminName}
              onChange={(event) =>
                setClientDraft({ ...clientDraft, adminName: event.target.value })
              }
            />
            <input
              className="form-input"
              placeholder="Tenant admin email"
              value={clientDraft.adminEmail}
              onChange={(event) =>
                setClientDraft({ ...clientDraft, adminEmail: event.target.value })
              }
            />
          </div>
          <button
            className="btn btn-primary mt-4"
            onClick={async () => {
              await onSaveClient(clientDraft);
              setClientDraft({
                clientName: "",
                contactName: "",
                contactEmail: "",
                phone: "",
                status: "trial",
                subdomain: "",
                companyName: "",
                companyGstin: "",
                companyEmail: "",
                companyPhone: "",
                companyAddress: "",
                adminName: "",
                adminEmail: "",
                adminPassword: "Admin@123",
              });
            }}
          >
            Save Client
          </button>
        </section>

        <section className="notion-style">
          <h3 className="notion-header">Subscription Management</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <select
              className="form-input sm:col-span-2"
              value={subscriptionDraft.clientId}
              onChange={(event) =>
                setSubscriptionDraft({
                  ...subscriptionDraft,
                  clientId: Number(event.target.value),
                })
              }
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.clientName}
                </option>
              ))}
            </select>
            <input
              className="form-input"
              placeholder="Plan name"
              value={subscriptionDraft.planName}
              onChange={(event) =>
                setSubscriptionDraft({
                  ...subscriptionDraft,
                  planName: event.target.value,
                })
              }
            />
            <select
              className="form-input"
              value={subscriptionDraft.status}
              onChange={(event) =>
                setSubscriptionDraft({
                  ...subscriptionDraft,
                  status: event.target.value as ClientStatus,
                })
              }
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input
              className="form-input"
              type="date"
              value={subscriptionDraft.startDate}
              onChange={(event) =>
                setSubscriptionDraft({
                  ...subscriptionDraft,
                  startDate: event.target.value,
                })
              }
            />
            <input
              className="form-input"
              type="date"
              value={subscriptionDraft.endDate}
              onChange={(event) =>
                setSubscriptionDraft({
                  ...subscriptionDraft,
                  endDate: event.target.value,
                })
              }
            />
            <input
              className="form-input"
              type="number"
              min="1"
              value={subscriptionDraft.userLimit}
              onChange={(event) =>
                setSubscriptionDraft({
                  ...subscriptionDraft,
                  userLimit: Number(event.target.value),
                })
              }
            />
            <input
              className="form-input"
              type="number"
              min="1"
              value={subscriptionDraft.branchLimit}
              onChange={(event) =>
                setSubscriptionDraft({
                  ...subscriptionDraft,
                  branchLimit: Number(event.target.value),
                })
              }
            />
          </div>
          <button
            className="btn btn-primary mt-4"
            onClick={async () => {
              await onSaveSubscription(subscriptionDraft);
            }}
          >
            Save Subscription
          </button>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Client Accounts</h3>
          <div className="mt-4 space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div className="font-semibold text-gray-900">
                  {client.clientName}
                </div>
                <div className="text-sm text-gray-500">
                  {client.companyName} / {client.contactEmail} / {client.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Subscriptions</h3>
          <div className="mt-4 space-y-3">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div className="font-semibold text-gray-900">
                  {subscription.planName}
                </div>
                <div className="text-sm text-gray-500">
                  Client #{subscription.clientId} / {subscription.status} /{" "}
                  {subscription.startDate} to {subscription.endDate}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
