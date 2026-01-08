# Multi-Tenant Frontend Architecture: Thousands of Tenants

**STATUS**: Architectural Design (Not in White-Label-Tenants.md v4.2)
**SCOPE**: Extends backend multi-tenancy to support thousands of tenants with custom UIs

---

## Problem Statement

The White-Label-Tenants.md document only covers **dynamic theming** (CSS variables). This works for 10-15 partners with the same UI, but **NOT** for thousands of tenants needing:

- Different page layouts
- Different workflows
- Different feature sets
- Completely custom UIs

---

## Solution: Template-Based Multi-Tenant Frontend

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                  TEMPLATE SYSTEM ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Tenant Admin Configures UI                                  │
│     ├── Page Builder (Drag & Drop)                              │
│     ├── Component Selection                                     │
│     └── Theme Customization                                     │
│                │                                                 │
│                ▼                                                 │
│  2. Configuration Stored in DB                                  │
│     └── JSON: { pages, components, theme, features }            │
│                │                                                 │
│                ▼                                                 │
│  3. Next.js Renderer (Edge)                                     │
│     ├── Fetch config from DB/CDN                                │
│     ├── Render dynamic components                               │
│     └── Apply tenant theme                                      │
│                │                                                 │
│                ▼                                                 │
│  4. User sees customized UI                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Database Schema Extension

```sql
-- Tenant UI Configuration
CREATE TABLE tenant_ui_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    version INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Page configurations
    pages JSONB NOT NULL DEFAULT '{}',
    -- { "home": { "layout": "hero-grid", "sections": [...] } }

    -- Component library selections
    enabled_components JSONB NOT NULL DEFAULT '[]',
    -- ["ProductCard", "HeroSection", "OrderForm"]

    -- Theme overrides (extends tenant branding)
    theme JSONB NOT NULL DEFAULT '{}',
    -- { "typography": {...}, "spacing": {...}, "components": {...} }

    -- Feature flags
    enabled_features JSONB NOT NULL DEFAULT '[]',
    -- ["quotes", "orders", "analytics", "multi-location"]

    -- Custom code (for Enterprise tier)
    custom_css TEXT,
    custom_js TEXT, -- Sandboxed execution

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES accounts(id),

    CONSTRAINT unique_active_config UNIQUE (tenant_id, is_active)
        WHERE is_active = true
);

-- Version history for rollback
CREATE TABLE tenant_ui_config_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL REFERENCES tenant_ui_configs(id),
    version_number INT NOT NULL,
    config_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES accounts(id),
    rollback_reason TEXT
);

-- Component library definitions (platform-wide)
CREATE TABLE ui_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- 'layout', 'product', 'order', 'content'
    description TEXT,
    props_schema JSONB NOT NULL, -- JSON Schema for component props
    min_tier VARCHAR(20) NOT NULL, -- 'trial', 'standard', 'professional', 'enterprise'
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Page template library
CREATE TABLE ui_page_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'ecommerce', 'b2b', 'healthcare'
    thumbnail_url VARCHAR(500),
    config JSONB NOT NULL,
    min_tier VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Component Library Structure

```typescript
// client/src/components/TenantUI/index.ts
// Component registry for dynamic rendering

export const COMPONENT_REGISTRY = {
  // Layout Components
  'HeroSection': dynamic(() => import('./layout/HeroSection')),
  'GridLayout': dynamic(() => import('./layout/GridLayout')),
  'SidebarLayout': dynamic(() => import('./layout/SidebarLayout')),

  // Product Components
  'ProductCard': dynamic(() => import('./product/ProductCard')),
  'ProductGrid': dynamic(() => import('./product/ProductGrid')),
  'ProductFilters': dynamic(() => import('./product/ProductFilters')),

  // Order Components
  'QuoteForm': dynamic(() => import('./order/QuoteForm')),
  'OrderHistory': dynamic(() => import('./order/OrderHistory')),
  'CartWidget': dynamic(() => import('./order/CartWidget')),

  // Content Components
  'RichText': dynamic(() => import('./content/RichText')),
  'ImageGallery': dynamic(() => import('./content/ImageGallery')),
  'VideoEmbed': dynamic(() => import('./content/VideoEmbed')),
} as const;

export type ComponentName = keyof typeof COMPONENT_REGISTRY;
```

### Dynamic Page Renderer

```typescript
// client/src/app/[...slug]/page.tsx
import { headers } from 'next/headers';
import { DynamicPageRenderer } from '@/components/TenantUI/DynamicPageRenderer';
import { getTenantUIConfig } from '@/lib/api/tenantUI';

export default async function DynamicPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const headersList = await headers();
  const tenantIdentifier = headersList.get('x-tenant-identifier');

  if (!tenantIdentifier) {
    return <div>Tenant not found</div>;
  }

  // Fetch tenant UI configuration
  const uiConfig = await getTenantUIConfig(tenantIdentifier);

  // Get page config for current route
  const pagePath = params.slug?.join('/') || 'home';
  const pageConfig = uiConfig.pages[pagePath];

  if (!pageConfig) {
    return <div>Page not found</div>;
  }

  // Render dynamic page
  return (
    <DynamicPageRenderer
      config={pageConfig}
      theme={uiConfig.theme}
      enabledComponents={uiConfig.enabled_components}
    />
  );
}
```

### Tier-Based Feature Access

```typescript
// Tier-based component access
const TIER_COMPONENTS: Record<TenantTier, ComponentName[]> = {
  Trial: ['ProductCard', 'QuoteForm', 'RichText'],
  Standard: ['ProductCard', 'ProductGrid', 'QuoteForm', 'OrderHistory', 'RichText', 'ImageGallery'],
  Professional: [...'Standard components', 'ProductFilters', 'CartWidget', 'Analytics'],
  Enterprise: ['*'], // All components + custom code
};

// Feature flags per tier
const TIER_FEATURES: Record<TenantTier, string[]> = {
  Trial: ['quotes'],
  Standard: ['quotes', 'orders', 'basic-analytics'],
  Professional: ['quotes', 'orders', 'advanced-analytics', 'multi-location'],
  Enterprise: ['*'], // All features + custom integrations
};
```

---

## Performance Considerations

### Edge Caching Strategy

```typescript
// Cache tenant UI configs at edge (Vercel Edge Config / CDN)
export const getTenantUIConfigCached = cache(async (tenantId: string) => {
  // Try edge cache first
  const cached = await edgeConfig.get(`tenant-ui:${tenantId}`);
  if (cached) return cached;

  // Fetch from DB
  const config = await db.query.tenantUIConfigs.findFirst({
    where: eq(tenantUIConfigs.tenantId, tenantId),
  });

  // Cache for 1 hour
  await edgeConfig.set(`tenant-ui:${tenantId}`, config, { ttl: 3600 });

  return config;
});
```

### Static Generation for Common Tenants

```typescript
// Generate static pages for top 100 tenants
export async function generateStaticParams() {
  const topTenants = await getTopTenants(100);

  return topTenants.map((tenant) => ({
    slug: [tenant.identifier],
  }));
}
```

---

## Migration Path

### Phase 1: Foundation (Current)
- Backend multi-tenancy ✅
- Dynamic theming only

### Phase 2: Component Library
- Build reusable component registry
- Simple page builder UI
- JSON-based configuration

### Phase 3: Advanced Customization
- Drag-and-drop page builder
- Template marketplace
- Custom CSS/JS for Enterprise tier

### Phase 4: AI-Powered Customization
- AI generates UIs based on industry
- Auto-optimize layouts for conversion
- A/B testing built-in

---

## Alternative: Separate Deployments (Enterprise Only)

For **Enterprise tier** tenants needing 100% custom UI:

```
┌────────────────────────────────────────────────────────────┐
│  Enterprise Tenant: Separate Deployment                    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐       ┌──────────────────┐            │
│  │ Tenant's Repo   │  ────>│ Vercel/AWS Deploy│            │
│  │ (Next.js)       │       │ (Isolated)       │            │
│  └─────────────────┘       └──────────────────┘            │
│          │                          │                       │
│          └──────────────────────────┼────> Shared Backend  │
│                                     │      (via API)        │
│                                     │                       │
│  - Full control over UI             │                       │
│  - Custom codebase                  │                       │
│  - Same backend API                 │                       │
│  - RLS enforced via Host header     │                       │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Pricing Model:**
- **Trial/Standard**: Shared template system
- **Professional**: Advanced templates + limited customization
- **Enterprise**: Separate deployment OR full template control

---

## Summary

**✅ For Thousands of Tenants:**
- Use **Template System** (Option 1)
- Store UI config in database
- Dynamic component rendering
- Edge caching for performance

**✅ For Enterprise Custom UIs:**
- Offer separate deployments
- Shared backend via API
- Full customization freedom

**❌ Do NOT Use:**
- Single codebase with CSS variables (doesn't scale)
- Separate frontend per tenant (operational nightmare)

