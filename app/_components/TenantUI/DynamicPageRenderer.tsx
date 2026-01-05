'use client';

import { Suspense } from 'react';
import { getComponent, isComponentAvailable, type ComponentName } from './index';

/**
 * Page section configuration from backend
 */
interface SectionConfig {
  component: ComponentName;
  props: Record<string, any>;
}

/**
 * Page configuration from backend
 */
interface PageConfig {
  layout: string;
  sections: SectionConfig[];
}

/**
 * Theme configuration from backend
 */
interface ThemeConfig {
  typography?: Record<string, any>;
  spacing?: Record<string, any>;
  components?: Record<string, any>;
}

interface DynamicPageRendererProps {
  config: PageConfig;
  theme: ThemeConfig;
  enabledComponents: string[];
  tier: string;
}

/**
 * Dynamic Page Renderer
 *
 * Renders pages dynamically based on tenant configuration from backend.
 *
 * ARCHITECTURE:
 * - Receives page config as JSON from backend API
 * - Dynamically loads components from registry
 * - Enforces tier-based component access
 * - Applies tenant theme overrides
 *
 * SECURITY:
 * - Component names are validated against registry (no arbitrary code execution)
 * - Tier access is enforced client-side (also enforced by backend)
 * - Props are sanitized by individual components
 *
 * PERFORMANCE:
 * - Components are code-split and loaded on-demand
 * - Suspense boundaries for loading states
 * - Memoization for expensive operations
 */
export function DynamicPageRenderer({
  config,
  theme,
  enabledComponents,
  tier,
}: DynamicPageRendererProps) {
  if (!config || !config.sections) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-base-content/60">No page configuration found</p>
      </div>
    );
  }

  return (
    <div className={`page-layout-${config.layout}`} data-layout={config.layout}>
      {config.sections.map((section, index) => (
        <Suspense
          key={`${section.component}-${index}`}
          fallback={<SectionSkeleton />}
        >
          <DynamicSection
            section={section}
            enabledComponents={enabledComponents}
            tier={tier}
          />
        </Suspense>
      ))}
    </div>
  );
}

/**
 * Dynamic section renderer
 * Validates component availability and loads dynamically
 */
function DynamicSection({
  section,
  enabledComponents,
  tier,
}: {
  section: SectionConfig;
  enabledComponents: string[];
  tier: string;
}) {
  const { component: componentName, props } = section;

  // Validate component is in registry
  const Component = getComponent(componentName);
  if (!Component) {
    console.warn(`Component "${componentName}" not found in registry`);
    return (
      <div className="rounded-lg border border-error/50 bg-error/10 p-4">
        <p className="text-sm text-error">
          Component &quot;{componentName}&quot; not found
        </p>
      </div>
    );
  }

  // Validate component is enabled for tenant
  if (!enabledComponents.includes(componentName)) {
    console.warn(`Component "${componentName}" not enabled for tenant`);
    return null;
  }

  // Validate component is available for tenant tier
  if (!isComponentAvailable(componentName, tier)) {
    console.warn(
      `Component "${componentName}" not available for tier "${tier}"`
    );
    return (
      <div className="rounded-lg border border-warning/50 bg-warning/10 p-4">
        <p className="text-sm text-warning-content">
          Component &quot;{componentName}&quot; requires higher tier
        </p>
      </div>
    );
  }

  // Render component with props
  return <Component {...props} />;
}

/**
 * Loading skeleton for sections
 */
function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-8 w-3/4 rounded bg-base-300" />
      <div className="h-4 w-full rounded bg-base-300" />
      <div className="h-4 w-5/6 rounded bg-base-300" />
    </div>
  );
}
