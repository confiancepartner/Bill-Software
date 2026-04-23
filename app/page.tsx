"use client";

import { useEffect, useState } from "react";
import BillingApp from "@/components/app/BillingApp";
import PublicSite from "@/components/app/PublicSite";
import type { TenantInfo } from "@/lib/types";

export default function HomePage() {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo>({
    mode: "public",
    tenantSlug: null,
    tenantName: null,
    clientId: null,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantOverride = urlParams.get("tenant");
    if (!tenantOverride) return;

    const url = `/api/tenant?tenant=${encodeURIComponent(tenantOverride)}`;
    fetch(url, { credentials: "include" })
      .then((r) => r.json())
      .then((info: TenantInfo) => {
        if (info.mode === "tenant" && info.tenantSlug) {
          setTenantInfo(info);
        }
      })
      .catch(() => {});
  }, []);

  if (tenantInfo.mode === "tenant" && tenantInfo.tenantSlug) {
    return (
      <BillingApp
        tenantSlug={tenantInfo.tenantSlug}
        tenantName={tenantInfo.tenantName}
      />
    );
  }

  return <PublicSite />;
}
