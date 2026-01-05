'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Cookies from 'js-cookie';

/**
 * Tenant configuration from backend API
 */
interface TenantConfig {
  id: string;
  identifier: string;
  name: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  status: 'PendingSetup' | 'Active' | 'Suspended' | 'Cancelled' | 'Archived';
  tier: 'Trial' | 'Standard' | 'Professional' | 'Enterprise';
}

interface TenantContextValue {
  tenant: TenantConfig | null;
  isLoading: boolean;
  error: Error | null;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  isLoading: true,
  error: null,
});

/**
 * Tenant Provider - Loads tenant configuration and applies theming
 *
 * ARCHITECTURE:
 * - Reads tenant identifier from cookie (set by middleware)
 * - Fetches tenant config from backend API
 * - Applies CSS variables for dynamic theming
 * - Handles tenant status (suspended, cancelled, etc.)
 *
 * SECURITY NOTE:
 * - Cookie is for UI theming only, NOT security
 * - Backend validates tenant on every API call via Host header
 * - Never trust client-side tenant selection for data access
 */
export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadTenant() {
      try {
        // Get tenant identifier from cookie (set by middleware)
        const tenantIdentifier = Cookies.get('tenant-identifier');

        if (!tenantIdentifier) {
          // No tenant identifier - might be base domain
          setIsLoading(false);
          return;
        }

        // Fetch tenant configuration from API
        // Backend will validate via Host header
        const response = await fetch('/api/tenant/config', {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load tenant: ${response.statusText}`);
        }

        const tenantData: TenantConfig = await response.json();

        // Check tenant status
        if (tenantData.status !== 'Active') {
          throw new Error(`Tenant is ${tenantData.status.toLowerCase()}`);
        }

        setTenant(tenantData);

        // Apply theme CSS variables
        applyTheme(tenantData);

        // Update favicon if provided
        if (tenantData.faviconUrl) {
          updateFavicon(tenantData.faviconUrl);
        }

        // Update document title
        if (tenantData.name) {
          document.title = `${tenantData.name} - Medical Supply Platform`;
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load tenant'));
      } finally {
        setIsLoading(false);
      }
    }

    loadTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook to access tenant context
 */
export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}

/**
 * Apply tenant theme as CSS variables
 */
function applyTheme(tenant: TenantConfig) {
  const root = document.documentElement;

  if (tenant.primaryColor) {
    root.style.setProperty('--color-primary', tenant.primaryColor);
  }

  if (tenant.secondaryColor) {
    root.style.setProperty('--color-secondary', tenant.secondaryColor);
  }

  if (tenant.accentColor) {
    root.style.setProperty('--color-accent', tenant.accentColor);
  }

  // Generate color variations using Tailwind-like approach
  if (tenant.primaryColor) {
    const { light, dark } = generateColorVariations(tenant.primaryColor);
    root.style.setProperty('--color-primary-light', light);
    root.style.setProperty('--color-primary-dark', dark);
  }
}

/**
 * Update favicon dynamically
 */
function updateFavicon(faviconUrl: string) {
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
  if (link) {
    link.href = faviconUrl;
  } else {
    const newLink = document.createElement('link');
    newLink.rel = 'icon';
    newLink.href = faviconUrl;
    document.head.appendChild(newLink);
  }
}

/**
 * Generate light and dark variations of a color
 * Simple HSL manipulation - you can enhance this
 */
function generateColorVariations(hexColor: string): { light: string; dark: string } {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Convert to HSL
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r / 255:
        h = ((g / 255 - b / 255) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g / 255:
        h = ((b / 255 - r / 255) / d + 2) / 6;
        break;
      case b / 255:
        h = ((r / 255 - g / 255) / d + 4) / 6;
        break;
    }
  }

  // Generate variations
  const light = hslToHex(h, s, Math.min(l + 0.2, 0.95));
  const dark = hslToHex(h, s, Math.max(l - 0.2, 0.05));

  return { light, dark };
}

/**
 * Convert HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
