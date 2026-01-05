/**
 * Tenant UI Component Registry
 *
 * Dynamic component registry for template-based multi-tenant frontend.
 * Components are loaded dynamically based on tenant configuration.
 *
 * ARCHITECTURE:
 * - Uses Next.js dynamic imports for code splitting
 * - Components are loaded on-demand based on tenant config
 * - Tier-based access control enforced at runtime
 *
 * SCALABILITY:
 * - Supports thousands of tenants without per-tenant builds
 * - Each tenant can have different component selections
 * - Components are cached after first load
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Component registry with dynamic imports
 * Components are loaded on-demand to optimize bundle size
 */
export const COMPONENT_REGISTRY = {
  // =========================================================================
  // LAYOUT COMPONENTS
  // =========================================================================
  HeroSection: dynamic(() => import('./layout/HeroSection')),
  GridLayout: dynamic(() => import('./layout/GridLayout')),
  SidebarLayout: dynamic(() => import('./layout/SidebarLayout')),

  // =========================================================================
  // PRODUCT COMPONENTS
  // =========================================================================
  ProductCard: dynamic(() => import('./product/ProductCard')),
  ProductGrid: dynamic(() => import('./product/ProductGrid')),
  ProductFilters: dynamic(() => import('./product/ProductFilters')),

  // =========================================================================
  // ORDER COMPONENTS
  // =========================================================================
  QuoteForm: dynamic(() => import('./order/QuoteForm')),
  OrderHistory: dynamic(() => import('./order/OrderHistory')),
  CartWidget: dynamic(() => import('./order/CartWidget')),

  // =========================================================================
  // CONTENT COMPONENTS
  // =========================================================================
  RichText: dynamic(() => import('./content/RichText')),
  ImageGallery: dynamic(() => import('./content/ImageGallery')),
  VideoEmbed: dynamic(() => import('./content/VideoEmbed')),
} as const;

export type ComponentName = keyof typeof COMPONENT_REGISTRY;

/**
 * Tier-based component access control
 * Maps tenant tiers to allowed components
 */
export const TIER_COMPONENTS: Record<string, ComponentName[]> = {
  Trial: ['HeroSection', 'GridLayout', 'ProductCard', 'QuoteForm', 'RichText'],
  Standard: [
    'HeroSection',
    'GridLayout',
    'SidebarLayout',
    'ProductCard',
    'ProductGrid',
    'QuoteForm',
    'OrderHistory',
    'RichText',
    'ImageGallery',
    'VideoEmbed',
  ],
  Professional: [
    'HeroSection',
    'GridLayout',
    'SidebarLayout',
    'ProductCard',
    'ProductGrid',
    'ProductFilters',
    'QuoteForm',
    'OrderHistory',
    'CartWidget',
    'RichText',
    'ImageGallery',
    'VideoEmbed',
  ],
  Enterprise: Object.keys(COMPONENT_REGISTRY) as ComponentName[], // All components
};

/**
 * Get component by name with type safety
 */
export function getComponent(name: ComponentName): ComponentType<any> | null {
  return COMPONENT_REGISTRY[name] || null;
}

/**
 * Check if component is available for tenant tier
 */
export function isComponentAvailable(
  componentName: ComponentName,
  tier: string
): boolean {
  const allowedComponents = TIER_COMPONENTS[tier];
  return allowedComponents ? allowedComponents.includes(componentName) : false;
}

/**
 * Get all available components for tenant tier
 */
export function getAvailableComponents(tier: string): ComponentName[] {
  return TIER_COMPONENTS[tier] || [];
}
