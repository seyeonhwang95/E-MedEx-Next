export type TenantContext = {
  tenantId: string;
  subdomain: string;
  tenantDbName: string;
  tenantDbSecretRef: string | null;
  storagePrefix: string;
  searchPrefix: string;
};

export function extractSubdomainFromHost(host?: string): string {
  const normalizedHost = (host ?? 'demo.localhost').split(':')[0].toLowerCase();

  if (normalizedHost === 'localhost' || normalizedHost === '127.0.0.1') {
    return 'demo';
  }

  return normalizedHost.split('.')[0] || 'demo';
}

export function resolveTenantFromHost(host?: string): TenantContext {
  const subdomain = extractSubdomainFromHost(host);
  const tenantId = subdomain.replace(/[^a-z0-9-]/g, '') || 'demo';

  return {
    tenantId,
    subdomain,
    tenantDbName: `emedex_${tenantId}`,
    tenantDbSecretRef: null,
    storagePrefix: `emedex-media/${tenantId}`,
    searchPrefix: `emedex-${tenantId}`,
  };
}