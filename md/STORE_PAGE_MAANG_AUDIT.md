# Store Page MAANG-Level Audit

> **Audit Date:** December 2024  
> **Auditor:** AI Code Analyst  
> **Comparison Baseline:** Amazon, Google Shopping, Shopify, Meta Marketplace, Apple Store, Alibaba B2B

---

## Executive Summary

| Category | Score | Weight | Weighted Score |
|----------|-------|--------|----------------|
| Data Fetching & Caching | 8.5/10 | 15% | 1.275 |
| Virtualization & Performance | 8.0/10 | 15% | 1.200 |
| Search & Filtering | 6.5/10 | 12% | 0.780 |
| UI/UX & Design | 7.0/10 | 12% | 0.840 |
| SEO & Metadata | 7.5/10 | 10% | 0.750 |
| Accessibility (a11y) | 6.0/10 | 10% | 0.600 |
| Error Handling & Resilience | 6.5/10 | 8% | 0.520 |
| E-Commerce Features | 4.5/10 | 8% | 0.360 |
| Testing & Quality | 3.0/10 | 5% | 0.150 |
| Analytics & Monitoring | 4.0/10 | 5% | 0.200 |
| **TOTAL** | **6.68/10** | 100% | 6.675 |

**Verdict:** Good foundation with room for improvement. Strong data fetching/virtualization but missing key e-commerce features.

---

## Detailed Analysis by Category

---

## 1. Data Fetching & Caching (8.5/10)

### ✅ What's Implemented Well

| Feature | Status | Details |
|---------|--------|---------|
| React Query Integration | ✅ Excellent | `@tanstack/react-query` with proper configuration |
| Infinite Query | ✅ Excellent | `useInfiniteQuery` with 20 items per page |
| Query Key Structure | ✅ Good | Structured keys for cache invalidation |
| Stale/GC Times | ✅ Good | 60s stale, 5min GC - appropriate for catalog |
| Server-Side Initial Data | ✅ Good | SSR hydration for SEO |
| Deduplication | ✅ Automatic | React Query handles this |
| Race Condition Handling | ✅ Automatic | Built into React Query |

### ❌ Missing Features (-1.5 points)

| Feature | Impact | MAANG Reference |
|---------|--------|-----------------|
| **Optimistic Updates** | -0.3 | Amazon: Cart updates appear instant before server confirms |
| **Prefetching on Hover** | -0.4 | Shopify: Preload next page data on "Load More" hover |
| **Query Persistence** | -0.3 | Netflix: Persist cache to localStorage for instant restoration |
| **Retry with Backoff UI** | -0.2 | Google: Shows "Retrying..." with countdown |
| **Placeholder Data** | -0.3 | Instagram: Show cached stale data while refetching |

### 🔧 Recommendations

```typescript
// 1. Add prefetching on "Load More" hover
const handleLoadMoreHover = () => {
  queryClient.prefetchInfiniteQuery({
    queryKey: productQueryKeys.list(filters),
    queryFn: fetchNextPage,
    pages: 1, // Just prefetch next page
  })
}

// 2. Add placeholder data from cache
useInfiniteQuery({
  ...options,
  placeholderData: (previousData) => previousData, // Show stale data while loading
})

// 3. Persist to localStorage
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'store-cache',
})

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
})
```

---

## 2. Virtualization & Performance (8.0/10)

### ✅ What's Implemented Well

| Feature | Status | Details |
|---------|--------|---------|
| Window Virtualizer | ✅ Excellent | `useWindowVirtualizer` for page scroll |
| DOM Recycling | ✅ Good | ~30 elements regardless of product count |
| Overscan Rows | ✅ Good | 5 rows overscan for smooth scrolling |
| Intersection Observer | ✅ Good | 600px root margin for infinite scroll |
| Responsive Columns | ✅ Good | `useGridColumns` hook |
| Skeleton Loaders | ✅ Excellent | Triple-layer animation, GPU-accelerated |
| Image Preloading | ✅ Good | `ImagePreloadService` on hover |

### ❌ Missing Features (-2.0 points)

| Feature | Impact | MAANG Reference |
|---------|--------|-----------------|
| **Scroll Position Restoration** | -0.5 | Amazon: Return to exact scroll position after back navigation |
| **Dynamic Row Heights** | -0.3 | Pinterest: Masonry layouts with variable heights |
| **Scroll-Linked Animations** | -0.2 | Apple: Parallax effects on product cards |
| **Memory Budget Tracking** | -0.3 | Google Maps: Aggressively unload off-screen content |
| **Frame Budget Monitoring** | -0.3 | Netflix: Track and report frame drops |
| **Preload Next Page Images** | -0.4 | Instagram: Preload images for next page before reaching sentinel |

### 🔧 Recommendations

```typescript
// 1. Scroll Position Restoration
// In useStorePageLogic.ts
import { useScrollRestoration } from '@_shared/hooks/useScrollRestoration'

const { saveScrollPosition, restoreScrollPosition } = useScrollRestoration('store-page')

// Save before navigation
useEffect(() => {
  return () => saveScrollPosition()
}, [])

// Restore after navigation back
useEffect(() => {
  if (isNavigatingBack) {
    restoreScrollPosition()
  }
}, [])

// 2. Frame Budget Monitoring
const useFrameBudget = () => {
  useEffect(() => {
    let frameId: number
    let lastTime = performance.now()
    let frameDrops = 0

    const checkFrame = (currentTime: number) => {
      const delta = currentTime - lastTime
      if (delta > 32) { // 30fps threshold
        frameDrops++
        if (frameDrops > 5) {
          // Report to analytics
          analytics.track('frame_drops', { count: frameDrops, page: 'store' })
        }
      }
      lastTime = currentTime
      frameId = requestAnimationFrame(checkFrame)
    }
    
    frameId = requestAnimationFrame(checkFrame)
    return () => cancelAnimationFrame(frameId)
  }, [])
}

// 3. Preload Next Page Images
useEffect(() => {
  if (hasNextPage && !isFetchingNextPage) {
    // When 75% through current products, preload next batch
    const threshold = Math.floor(products.length * 0.75)
    const lastVisibleIndex = virtualizer.getVirtualItems().at(-1)?.index
    
    if (lastVisibleIndex && lastVisibleIndex >= threshold) {
      // Prefetch next page images
      prefetchNextPageImages()
    }
  }
}, [virtualizer.getVirtualItems()])
```

---

## 3. Search & Filtering (6.5/10)

### ✅ What's Implemented Well

| Feature | Status | Details |
|---------|--------|---------|
| Debounced Search | ✅ Good | 400ms debounce |
| Category Filtering | ✅ Good | Multi-select with URL sync |
| Sorting | ✅ Good | 7 sort options |
| URL State Sync | ✅ Good | Shareable URLs with filters |
| Clear Filters | ✅ Good | Single button reset |

### ❌ Missing Features (-3.5 points)

| Feature | Impact | MAANG Reference |
|---------|--------|-----------------|
| **Search Autocomplete/Suggestions** | -0.7 | Amazon: As-you-type suggestions with categories |
| **Recent Searches** | -0.3 | Google: Show last 5 searches |
| **Search Highlighting** | -0.3 | Shopify: Highlight matching terms in results |
| **Faceted Filters** | -0.5 | Amazon: Price range, brand, ratings filters |
| **Price Range Slider** | -0.4 | Most e-commerce: Min/Max price filter |
| **Filter Count Badges** | -0.3 | Alibaba: Show (23) next to category name |
| **Active Filter Tags** | -0.3 | Google Shopping: Clickable chips showing active filters |
| **Search in Category** | -0.2 | Amazon: "Search within results" |
| **Save Search/Filters** | -0.3 | B2B standard: Save frequently used filter combinations |
| **Fuzzy/Typo Tolerance** | -0.2 | Google: "Did you mean?" suggestions |

### 🔧 Recommendations

```typescript
// 1. Search Autocomplete Component
// New file: client/app/_components/store/SearchAutocomplete.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'

interface SearchSuggestion {
  type: 'product' | 'category' | 'recent'
  text: string
  id?: string
}

export function SearchAutocomplete({
  value,
  onChange,
  onSelect,
}: {
  value: string
  onChange: (v: string) => void
  onSelect: (suggestion: SearchSuggestion) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Fetch suggestions
  const { data: suggestions } = useQuery({
    queryKey: ['search-suggestions', value],
    queryFn: () => API.Store.Products.getSuggestions(value),
    enabled: value.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  })
  
  // Recent searches from localStorage
  const recentSearches = getRecentSearches()
  
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
      />
      
      {isOpen && (
        <div className="absolute top-full mt-1 w-full rounded-lg border bg-base-100 shadow-xl z-50">
          {/* Recent Searches */}
          {value.length === 0 && recentSearches.length > 0 && (
            <div className="p-2">
              <h4 className="text-xs font-semibold text-base-content/60 px-2 mb-1">
                Recent Searches
              </h4>
              {recentSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => onSelect({ type: 'recent', text: search })}
                  className="w-full text-left px-2 py-1.5 hover:bg-base-200 rounded"
                >
                  <Clock className="inline w-4 h-4 mr-2 text-base-content/50" />
                  {search}
                </button>
              ))}
            </div>
          )}
          
          {/* Suggestions */}
          {suggestions?.map((suggestion) => (
            <button
              key={suggestion.id || suggestion.text}
              onClick={() => onSelect(suggestion)}
              className="w-full text-left px-3 py-2 hover:bg-base-200"
            >
              {suggestion.type === 'product' && <Package className="inline w-4 h-4 mr-2" />}
              {suggestion.type === 'category' && <Folder className="inline w-4 h-4 mr-2" />}
              <HighlightedText text={suggestion.text} highlight={value} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// 2. Faceted Filters with Counts
// Backend needs to return: { categories: [{ id, name, count }], priceRanges: [...] }
interface FacetedFilter {
  categories: Array<{ id: string; name: string; count: number }>
  priceRanges: Array<{ min: number; max: number; count: number }>
  manufacturers: Array<{ name: string; count: number }>
  availability: { inStock: number; checkAvailability: number }
}

// 3. Price Range Slider Component
export function PriceRangeFilter({
  min,
  max,
  value,
  onChange,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (range: [number, number]) => void
}) {
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Price Range</label>
      <div className="flex gap-4">
        <Input
          type="number"
          value={value[0]}
          onChange={(e) => onChange([Number(e.target.value), value[1]])}
          placeholder="Min"
          className="w-24"
        />
        <span className="self-center">-</span>
        <Input
          type="number"
          value={value[1]}
          onChange={(e) => onChange([value[0], Number(e.target.value)])}
          placeholder="Max"
          className="w-24"
        />
      </div>
      <RangeSlider
        min={min}
        max={max}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

// 4. Active Filter Tags
export function ActiveFilterTags({
  filters,
  onRemove,
  onClearAll,
}: {
  filters: Array<{ type: string; label: string; value: string }>
  onRemove: (filter: { type: string; value: string }) => void
  onClearAll: () => void
}) {
  if (filters.length === 0) return null
  
  return (
    <div className="flex flex-wrap gap-2 py-2">
      {filters.map((filter) => (
        <span
          key={`${filter.type}-${filter.value}`}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
        >
          {filter.label}
          <button
            onClick={() => onRemove(filter)}
            className="hover:bg-primary/20 rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-base-content/60 hover:text-primary underline"
      >
        Clear all
      </button>
    </div>
  )
}
```

### Backend Changes Required

```csharp
// Add to ProductsController.cs

/// <summary>
/// Get search suggestions for autocomplete
/// </summary>
[AllowAnonymous]
[HttpGet("suggestions")]
public async Task<IResponse<List<SearchSuggestion>>> GetSuggestions(
    [FromQuery] string query,
    [FromQuery] int limit = 10)
{
    if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
    {
        return Ok("suggestions", new List<SearchSuggestion>());
    }
    
    var suggestions = await _productService.GetSearchSuggestions(query, limit);
    return Ok("suggestions_retrieved", suggestions);
}

/// <summary>
/// Get faceted filter counts
/// </summary>
[AllowAnonymous]
[HttpPost("search/public/facets")]
public async Task<IResponse<FacetedFilterResult>> GetFacets(
    [FromBody] GenericSearchFilter request)
{
    var facets = await _productService.GetFacets(request);
    return Ok("facets_retrieved", facets);
}
```

---

## 4. UI/UX & Design (7.0/10)

### ✅ What's Implemented Well

| Feature | Status | Details |
|---------|--------|---------|
| Responsive Grid | ✅ Excellent | 1/2/3/4 columns based on viewport |
| Product Card Design | ✅ Good | Clean B2B aesthetic |
| Hover Effects | ✅ Good | Smooth transitions, image preload |
| Loading States | ✅ Excellent | Triple-layer skeleton animations |
| Empty States | ✅ Good | Clear messaging with icons |
| Sticky Toolbar | ✅ Good | Stays accessible while scrolling |
| Value Propositions | ✅ Good | Trust signals visible |

### ❌ Missing Features (-3.0 points)

| Feature | Impact | MAANG Reference |
|---------|--------|-----------------|
| **Quick View Modal** | -0.5 | Amazon: Preview product without leaving page |
| **Zoom on Hover** | -0.2 | Most e-commerce: Magnify product image |
| **Gallery Carousel in Card** | -0.3 | Airbnb: Swipe through images in card |
| **Add to Wishlist** | -0.4 | Universal: Save for later |
| **Compare Products** | -0.3 | B2B standard: Side-by-side comparison |
| **Recently Viewed** | -0.3 | Amazon: "Recently viewed" section |
| **Grid/List View Toggle** | -0.2 | Most e-commerce: Switch between views |
| **Bulk Add to Cart** | -0.3 | B2B: Add multiple products at once |
| **Product Badges** | -0.2 | "New", "Sale", "Popular" indicators |
| **Animation Polish** | -0.3 | Framer Motion for page transitions |

### 🔧 Recommendations

```typescript
// 1. Quick View Modal
// New file: client/app/_components/store/QuickViewModal.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@_components/ui/Dialog'
import { Product } from '@_classes/Product'
import { ProductImageGallery, ProductHeaderInfo, AddToCartButton } from '@_components/store'

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  if (!product) return null
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="bg-base-200 p-4">
            <ProductImageGallery 
              product={serializeProduct(product)} 
              priority={true} 
            />
          </div>
          
          {/* Product Info */}
          <div className="p-6 flex flex-col">
            <ProductHeaderInfo product={product} />
            
            <div className="flex-1" />
            
            <div className="space-y-4">
              <AddToCartButton 
                product={product} 
                size="lg" 
                className="w-full" 
              />
              
              <Link 
                href={Routes.Store.product(product.id)}
                className="block text-center text-sm text-primary hover:underline"
              >
                View Full Details →
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// 2. Update ProductCard to include Quick View button
// In ProductCard.tsx, add:
<button
  onClick={(e) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(product)
  }}
  className="absolute top-2 right-2 p-2 bg-base-100/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
  aria-label="Quick view"
>
  <Eye className="w-4 h-4" />
</button>

// 3. Wishlist Feature
// New file: client/app/_features/wishlist/stores/useWishlistStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  items: string[] // Product IDs
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (productId: string) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (productId) => 
        set((state) => ({ items: [...state.items, productId] })),
      removeFromWishlist: (productId) => 
        set((state) => ({ items: state.items.filter(id => id !== productId) })),
      isInWishlist: (productId) => get().items.includes(productId),
      toggleWishlist: (productId) => {
        const { isInWishlist, addToWishlist, removeFromWishlist } = get()
        if (isInWishlist(productId)) {
          removeFromWishlist(productId)
        } else {
          addToWishlist(productId)
        }
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
)

// 4. Recently Viewed Feature
// New file: client/app/_features/store/hooks/useRecentlyViewed.ts
const MAX_RECENTLY_VIEWED = 12

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => set((state) => {
        const filtered = state.items.filter(p => p.id !== product.id)
        return { items: [product, ...filtered].slice(0, MAX_RECENTLY_VIEWED) }
      }),
    }),
    {
      name: 'recently-viewed',
    }
  )
)

// 5. Grid/List View Toggle
type ViewMode = 'grid' | 'list'

export function ViewToggle({ 
  mode, 
  onChange 
}: { 
  mode: ViewMode; 
  onChange: (mode: ViewMode) => void 
}) {
  return (
    <div className="flex border rounded-lg overflow-hidden">
      <button
        onClick={() => onChange('grid')}
        className={cn(
          'p-2',
          mode === 'grid' ? 'bg-primary text-primary-content' : 'bg-base-200'
        )}
        aria-label="Grid view"
      >
        <Grid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('list')}
        className={cn(
          'p-2',
          mode === 'list' ? 'bg-primary text-primary-content' : 'bg-base-200'
        )}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  )
}
```

---

## 5. SEO & Metadata (7.5/10)

### ✅ What's Implemented Well

| Feature | Status | Details |
|---------|--------|---------|
| Dynamic Metadata | ✅ Good | `generateMetadata` with search params |
| OpenGraph Tags | ✅ Good | Title, description, type |
| Server-Side Rendering | ✅ Good | Products in initial HTML |
| Cache Components | ✅ Excellent | `use cache` on product detail page |
| Semantic HTML | ✅ Good | Proper heading hierarchy |

### ❌ Missing Features (-2.5 points)

| Feature | Impact | MAANG Reference |
|---------|--------|-----------------|
| **Structured Data (JSON-LD)** | -0.6 | Google: Product schema for rich snippets |
| **OG Image Generation** | -0.3 | Next.js: Dynamic OG images |
| **Canonical URLs** | -0.2 | Prevent duplicate content issues |
| **Breadcrumb Schema** | -0.2 | Google: Show breadcrumbs in search |
| **Sitemap Generation** | -0.3 | Essential for SEO |
| **robots.txt Configuration** | -0.1 | Control crawler behavior |
| **Meta Keywords** | -0.1 | Still useful for some engines |
| **Twitter Card Meta** | -0.2 | Twitter-specific sharing |
| **Pagination rel="next/prev"** | -0.2 | SEO for paginated content |
| **404 Handling SEO** | -0.1 | Proper status codes |

### 🔧 Recommendations

```typescript
// 1. JSON-LD Structured Data
// Add to client/app/store/page.tsx

import { JsonLd } from '@_components/common/JsonLd'

// In generateMetadata:
export async function generateMetadata({ searchParams }: StorePageProps) {
  // ... existing code ...
  
  return {
    // ... existing metadata ...
    other: {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
    },
    alternates: {
      canonical: `https://yoursite.com/store${buildQueryString(params)}`,
    },
  }
}

// Add JSON-LD in component:
<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Medical Supply Store',
  description: 'Browse quality medical supplies',
  url: 'https://yoursite.com/store',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://yoursite.com' },
      { '@type': 'ListItem', position: 2, name: 'Store', item: 'https://yoursite.com/store' },
    ],
  },
}} />

// 2. Product Page JSON-LD
// In client/app/store/product/[id]/page.tsx

function ProductJsonLd({ product }: { product: Product }) {
  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      sku: product.sku,
      image: product.files.map(f => getProductImageUrl(product.id, f.name)),
      brand: {
        '@type': 'Brand',
        name: product.manufacturer || product.provider?.name,
      },
      offers: {
        '@type': 'Offer',
        availability: product.stock > 0 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
        priceValidUntil: getNextYear(),
        itemCondition: 'https://schema.org/NewCondition',
      },
      category: product.categories[0]?.name,
      manufacturer: {
        '@type': 'Organization',
        name: product.manufacturer,
      },
    }} />
  )
}

// 3. Dynamic OG Image
// New file: client/app/store/product/[id]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Product Image'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  
  return new ImageResponse(
    (
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: 48,
      }}>
        {/* Product image */}
        <img 
          src={getProductImageUrl(product.id, product.files[0]?.name)} 
          width={400} 
          height={400}
          style={{ objectFit: 'contain', borderRadius: 16 }}
        />
        {/* Product info */}
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 48 }}>
          <h1 style={{ color: 'white', fontSize: 48, fontWeight: 'bold' }}>
            {product.name}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 24 }}>
            {product.manufacturer}
          </p>
        </div>
      </div>
    ),
    { ...size }
  )
}

// 4. Sitemap Generation
// New file: client/app/sitemap.ts
import { MetadataRoute } from 'next'
import { API } from '@_shared'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await API.Store.Products.searchPublic({
    page: 1,
    pageSize: 10000, // Get all products
  })
  
  const products = data.payload.data
  
  const productUrls = products.map((product) => ({
    url: `https://yoursite.com/store/product/${product.id}`,
    lastModified: product.updatedAt || product.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  
  return [
    {
      url: 'https://yoursite.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://yoursite.com/store',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productUrls,
  ]
}
```

---

## 6. Accessibility (a11y) (6.0/10)

### ✅ What's Implemented Well

| Feature | Status | Details |
|---------|--------|---------|
| ARIA Labels | ✅ Good | Present on key interactive elements |
| Screen Reader Text | ✅ Good | `sr-only` class for loading states |
| Semantic Roles | ✅ Partial | `role="search"` on toolbar |
| Reduced Motion | ✅ Good | Respects `prefers-reduced-motion` |

### ❌ Missing Features (-4.0 points)

| Feature | Impact | MAANG Reference |
|---------|--------|-----------------|
| **Focus Management** | -0.6 | Trap focus in modals, manage after filter changes |
| **Keyboard Navigation** | -0.5 | Navigate product grid with arrow keys |
| **Live Regions** | -0.4 | Announce "X products found" after filtering |
| **Skip Links** | -0.3 | "Skip to products" link |
| **Focus Visible Styles** | -0.3 | Custom focus rings for all interactive elements |
| **Color Contrast Audit** | -0.3 | Ensure WCAG AA compliance |
| **Screen Reader Testing** | -0.3 | Test with NVDA/VoiceOver |
| **Alt Text for Images** | -0.2 | Dynamic alt text for product images |
| **Form Labels** | -0.2 | All inputs need associated labels |
| **Error Announcements** | -0.2 | Screen reader announces errors |
| **Heading Hierarchy** | -0.2 | Ensure logical h1 > h2 > h3 order |
| **Landmark Regions** | -0.2 | nav, main, aside properly defined |
| **Touch Target Sizes** | -0.3 | Minimum 44x44px |

### 🔧 Recommendations

```typescript
// 1. Live Region for Results Announcement
// Add to StorePageContainer.tsx

function ProductsCountAnnouncer({ 
  displayedCount, 
  totalCount, 
  isFiltered 
}: { 
  displayedCount: number
  totalCount: number
  isFiltered: boolean
}) {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      aria-atomic="true"
      className="sr-only"
    >
      {isFiltered 
        ? `Showing ${displayedCount} of ${totalCount} products with current filters`
        : `Showing ${displayedCount} of ${totalCount} products`
      }
    </div>
  )
}

// 2. Keyboard Navigation for Product Grid
// Add to VirtualizedProductGrid.tsx

const handleKeyDown = (e: KeyboardEvent, currentIndex: number) => {
  const { columns } = gridConfig
  let newIndex = currentIndex

  switch (e.key) {
    case 'ArrowRight':
      newIndex = Math.min(currentIndex + 1, products.length - 1)
      break
    case 'ArrowLeft':
      newIndex = Math.max(currentIndex - 1, 0)
      break
    case 'ArrowDown':
      newIndex = Math.min(currentIndex + columns, products.length - 1)
      break
    case 'ArrowUp':
      newIndex = Math.max(currentIndex - columns, 0)
      break
    case 'Home':
      newIndex = 0
      break
    case 'End':
      newIndex = products.length - 1
      break
    default:
      return
  }

  e.preventDefault()
  focusProduct(newIndex)
}

// 3. Skip Link
// Add to StorePageContainer.tsx at the top

<a 
  href="#product-grid"
  className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-content"
>
  Skip to products
</a>

// ... later in the component

<main id="product-grid" tabIndex={-1}>
  <VirtualizedProductGrid ... />
</main>

// 4. Focus Visible Styles
// Add to globals.css

/* Custom focus styles for accessibility */
:focus-visible {
  outline: 2px solid oklch(var(--p));
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove default outline for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

// 5. Proper Alt Text
// Update ProductImage.tsx

const getAltText = (product: SerializedProduct) => {
  return [
    product.name,
    product.manufacturer && `by ${product.manufacturer}`,
    product.categories?.[0]?.name && `in ${product.categories[0].name}`,
  ].filter(Boolean).join(' - ')
}

<Image
  alt={getAltText(product)}
  // ... other props
/>

// 6. Landmark Regions
// Update StorePageContainer structure

<div className="min-h-screen w-full">
  <header>
    <StoreHeader />
  </header>
  
  <nav aria-label="Product filters and search">
    <UnifiedStoreToolbar ... />
  </nav>
  
  <div className="flex">
    <aside aria-label="Category filters">
      <StoreFilters ... />
    </aside>
    
    <main id="product-grid" aria-label="Product catalog">
      <VirtualizedProductGrid ... />
    </main>
  </div>
</div>
```

---

## 7. Error Handling & Resilience (6.5/10)

### ✅ What's Implemented Well

| Feature | Status | Details |
|---------|--------|---------|
| Error States | ✅ Good | Clear error UI in VirtualizedProductGrid |
| Loading States | ✅ Excellent | Multiple skeleton variants |
| Empty States | ✅ Good | Helpful empty state messages |
| Try/Catch Logging | ✅ Good | Logger integration |

### ❌ Missing Features (-3.5 points)

| Feature | Impact | MAANG Reference |
|---------|--------|-----------------|
| **Error Boundary** | -0.6 | React: Catch rendering errors gracefully |
| **Retry Button** | -0.4 | Allow manual retry after failure |
| **Offline Support** | -0.4 | Service Worker + cached data fallback |
| **Network Status Indicator** | -0.3 | Show when offline/reconnecting |
| **Partial Failure Handling** | -0.3 | Show partial results if some data loads |
| **Error Tracking** | -0.3 | Sentry/Datadog integration |
| **Rate Limit Handling** | -0.3 | Handle 429 responses gracefully |
| **Timeout Handling** | -0.2 | Show timeout-specific messages |
| **Circuit Breaker** | -0.2 | Stop requests to failing service |
| **Graceful Degradation** | -0.3 | Static fallback when JS fails |
| **Error Boundary UI** | -0.2 | Beautiful error pages |

### 🔧 Recommendations

```typescript
// 1. Store Error Boundary
// New file: client/app/_components/store/StoreErrorBoundary.tsx
'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Button from '@_components/ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class StoreErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error tracking service
    logger.error('Store Error Boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
    
    // Send to Sentry if configured
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error, { extra: errorInfo })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="w-16 h-16 text-error mb-4" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-base-content/60 mb-6 max-w-md">
            We encountered an error loading the store. This has been reported automatically.
          </p>
          <Button 
            onClick={this.handleRetry}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

// 2. Offline Support Hook
// New file: client/app/_shared/hooks/useOnlineStatus.ts
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// 3. Network Status Banner
export function NetworkStatusBanner() {
  const isOnline = useOnlineStatus()
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    if (!isOnline) setWasOffline(true)
  }, [isOnline])

  if (isOnline && !wasOffline) return null

  return (
    <div className={cn(
      'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all',
      isOnline 
        ? 'bg-success text-success-content' 
        : 'bg-warning text-warning-content'
    )}>
      {isOnline ? (
        <>
          <Wifi className="inline w-4 h-4 mr-2" />
          Back online
        </>
      ) : (
        <>
          <WifiOff className="inline w-4 h-4 mr-2" />
          You're offline - showing cached data
        </>
      )}
    </div>
  )
}

// 4. Retry with Exponential Backoff
// In useProductsInfiniteQuery.ts, update retry configuration:
useInfiniteQuery({
  ...options,
  retry: (failureCount, error) => {
    // Don't retry on 4xx errors
    if (error instanceof APIError && error.status >= 400 && error.status < 500) {
      return false
    }
    return failureCount < 3
  },
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
})

// 5. Error Component with Retry
function ProductGridError({ 
  error, 
  onRetry 
}: { 
  error: Error
  onRetry: () => void 
}) {
  const isNetworkError = error.message.includes('network') || error.message.includes('fetch')
  
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-error text-6xl mb-4">
        {isNetworkError ? <WifiOff /> : <AlertTriangle />}
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {isNetworkError ? 'Connection Problem' : 'Failed to load products'}
      </h3>
      <p className="text-base-content/60 max-w-md mb-6">
        {isNetworkError 
          ? 'Please check your internet connection and try again.'
          : error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <Button onClick={onRetry} leftIcon={<RefreshCw className="w-4 h-4" />}>
        Retry
      </Button>
    </div>
  )
}
```

---

## 8. E-Commerce Features (4.5/10)

### ✅ What's Implemented Well

| Feature | Status | Details |
|---------|--------|---------|
| Add to Cart | ✅ Good | With quantity selector |
| Cart Persistence | ✅ Good | Zustand with localStorage |
| Category Filtering | ✅ Good | Clickable category tags |
| Product Detail Page | ✅ Good | Comprehensive information |
| Related Products | ✅ Good | Shows similar items |

### ❌ Missing Features (-5.5 points)

| Feature | Impact | MAANG Reference |
|---------|--------|-----------------|
| **Wishlist/Favorites** | -0.5 | Universal: Save for later |
| **Product Comparison** | -0.5 | B2B: Side-by-side specs comparison |
| **Recently Viewed** | -0.4 | Amazon: Track browsing history |
| **Quick View Modal** | -0.4 | Preview without navigation |
| **Bulk Order Form** | -0.4 | B2B: Add multiple SKUs at once |
| **Stock Notifications** | -0.3 | Alert when back in stock |
| **Share Product** | -0.2 | Social sharing buttons |
| **Product Reviews/Ratings** | -0.5 | Social proof (even without actual reviews) |
| **Size/Variant Selection** | -0.3 | If products have variants |
| **Price Alerts** | -0.3 | Notify when price drops |
| **Reorder from History** | -0.4 | B2B: Quick reorder |
| **Save Cart/Quote** | -0.4 | B2B: Save quote for later |
| **Product Bundles** | -0.3 | Frequently bought together |
| **Gift Registry** | -0.1 | For B2C potential |
| **Product Zoom** | -0.3 | Magnify image on hover |
| **360° Product View** | -0.2 | For applicable products |

### 🔧 Recommendations

See Section 4 (UI/UX) for Wishlist and Quick View implementations.

```typescript
// 1. Product Comparison Feature
// New file: client/app/_features/compare/stores/useCompareStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX_COMPARE_ITEMS = 4

interface CompareState {
  items: string[] // Product IDs
  addToCompare: (productId: string) => boolean
  removeFromCompare: (productId: string) => void
  clearCompare: () => void
  isInCompare: (productId: string) => boolean
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCompare: (productId) => {
        const { items } = get()
        if (items.length >= MAX_COMPARE_ITEMS) {
          notificationService.warning(`Maximum ${MAX_COMPARE_ITEMS} products can be compared`)
          return false
        }
        if (items.includes(productId)) return false
        set({ items: [...items, productId] })
        return true
      },
      removeFromCompare: (productId) => 
        set((state) => ({ items: state.items.filter(id => id !== productId) })),
      clearCompare: () => set({ items: [] }),
      isInCompare: (productId) => get().items.includes(productId),
    }),
    { name: 'compare-storage' }
  )
)

// 2. Compare Page
// New file: client/app/store/compare/page.tsx
export default async function ComparePage() {
  // Server component to fetch products
  return (
    <PageLayout>
      <ComparePageClient />
    </PageLayout>
  )
}

// 3. Bulk Order Component
// New file: client/app/_components/store/BulkOrderForm.tsx
'use client'

export function BulkOrderForm() {
  const [items, setItems] = useState<Array<{ sku: string; quantity: number }>>([
    { sku: '', quantity: 1 },
  ])
  
  const addRow = () => {
    setItems([...items, { sku: '', quantity: 1 }])
  }
  
  const handleSubmit = async () => {
    // Validate SKUs exist
    const validatedItems = await validateSkus(items)
    // Add all to cart
    for (const item of validatedItems) {
      addToCart(item)
    }
  }
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Bulk Order Entry</h3>
      <p className="text-sm text-base-content/60">
        Enter SKUs and quantities to quickly add multiple items
      </p>
      
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">SKU</th>
            <th className="text-left">Quantity</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>
                <Input
                  value={item.sku}
                  onChange={(e) => updateItem(index, 'sku', e.target.value)}
                  placeholder="Enter SKU"
                />
              </td>
              <td>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                  min={1}
                />
              </td>
              <td>
                <Button variant="ghost" size="sm" onClick={() => removeRow(index)}>
                  <Trash className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="flex gap-2">
        <Button variant="ghost" onClick={addRow}>
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Add All to Cart
        </Button>
      </div>
    </div>
  )
}

// 4. Share Product Component
export function ShareProduct({ product }: { product: Product }) {
  const url = typeof window !== 'undefined' 
    ? window.location.href 
    : `https://yoursite.com/store/product/${product.id}`
  
  const shareText = `Check out ${product.name}`
  
  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigator.share?.({ title: product.name, url })}
      >
        <Share2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        as="a"
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`}
        target="_blank"
      >
        <Twitter className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        as="a"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
      >
        <Linkedin className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigator.clipboard.writeText(url)}
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  )
}

// 5. Stock Notification
export function NotifyWhenAvailable({ 
  productId, 
  productName 
}: { 
  productId: string
  productName: string 
}) {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const handleSubmit = async () => {
    await API.Store.Notifications.subscribe({
      productId,
      email,
      type: 'back_in_stock',
    })
    setIsSubmitted(true)
  }
  
  if (isSubmitted) {
    return (
      <div className="text-success flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        We'll notify you when available
      </div>
    )
  }
  
  return (
    <div className="flex gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email for notification"
      />
      <Button onClick={handleSubmit}>Notify Me</Button>
    </div>
  )
}
```

---

## 9. Testing & Quality (3.0/10)

### ✅ What's Implemented

| Feature | Status | Details |
|---------|--------|---------|
| Test Infrastructure | ✅ Good | Vitest + React Testing Library |
| Test Utils | ✅ Good | renderWithProviders, test builders |

### ❌ Missing Features (-7.0 points)

| Feature | Impact | MAANG Reference |
|---------|--------|-----------------|
| **Store Component Tests** | -1.0 | No tests for ProductCard, StoreFilters, etc. |
| **Hook Tests** | -0.8 | useProductsInfiniteQuery not tested |
| **Integration Tests** | -0.8 | No store page integration tests |
| **E2E Tests** | -1.0 | No Playwright/Cypress for store flows |
| **Visual Regression** | -0.5 | No screenshot comparison tests |
| **Accessibility Tests** | -0.5 | No jest-axe or a11y testing |
| **Performance Tests** | -0.4 | No Lighthouse CI integration |
| **API Mocking** | -0.3 | MSW not used for store tests |
| **Snapshot Tests** | -0.2 | No component snapshots |
| **Load Testing** | -0.5 | No backend load tests |
| **Coverage Threshold** | -0.5 | No enforced coverage minimums |
| **Contract Testing** | -0.3 | No API contract validation |
| **Mutation Testing** | -0.2 | No mutation testing |

### 🔧 Recommendations

```typescript
// 1. ProductCard Test
// New file: client/app/_components/store/__tests__/ProductCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import ProductCard from '../ProductCard'
import { createTestProduct } from '@test-utils/testDataBuilders'

expect.extend(toHaveNoViolations)

describe('ProductCard', () => {
  const mockProduct = createTestProduct({
    name: 'Test Medical Supply',
    manufacturer: 'Acme Corp',
    stock: 10,
    categories: [{ id: 1, name: 'Equipment' }],
  })
  
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} onCategoryFilter={() => {}} />)
    
    expect(screen.getByText('Test Medical Supply')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('#Equipment')).toBeInTheDocument()
  })
  
  it('shows "Check Availability" when out of stock', () => {
    const outOfStockProduct = createTestProduct({ stock: 0 })
    render(<ProductCard product={outOfStockProduct} onCategoryFilter={() => {}} />)
    
    expect(screen.getByText('Check Availability')).toBeInTheDocument()
  })
  
  it('calls onCategoryFilter when category is clicked', async () => {
    const onCategoryFilter = vi.fn()
    render(<ProductCard product={mockProduct} onCategoryFilter={onCategoryFilter} />)
    
    await userEvent.click(screen.getByText('#Equipment'))
    
    expect(onCategoryFilter).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Equipment' })
    )
  })
  
  it('navigates to product detail on name click', () => {
    render(<ProductCard product={mockProduct} onCategoryFilter={() => {}} />)
    
    const link = screen.getByRole('link', { name: /Test Medical Supply/i })
    expect(link).toHaveAttribute('href', `/store/product/${mockProduct.id}`)
  })
  
  it('has no accessibility violations', async () => {
    const { container } = render(
      <ProductCard product={mockProduct} onCategoryFilter={() => {}} />
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  it('shows priority loading for above-the-fold products', () => {
    render(
      <ProductCard product={mockProduct} onCategoryFilter={() => {}} priority={true} />
    )
    
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })
})

// 2. useProductsInfiniteQuery Test
// New file: client/app/_features/store/hooks/__tests__/useProductsInfiniteQuery.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProductsInfiniteQuery } from '../useProductsInfiniteQuery'
import { createTestProduct } from '@test-utils/testDataBuilders'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useProductsInfiniteQuery', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })
  
  it('fetches first page of products', async () => {
    const mockProducts = [createTestProduct(), createTestProduct()]
    vi.spyOn(API.Store.Products, 'searchPublic').mockResolvedValue({
      data: {
        payload: {
          data: mockProducts,
          totalCount: 100,
          page: 1,
          pageSize: 20,
          totalPages: 5,
        },
      },
    })
    
    const { result } = renderHook(
      () => useProductsInfiniteQuery({ pageSize: 20 }),
      { wrapper: createWrapper() }
    )
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    
    expect(result.current.data?.pages).toHaveLength(1)
    expect(result.current.data?.pages[0].products).toHaveLength(2)
  })
  
  it('fetches next page when fetchNextPage is called', async () => {
    // Setup mock for both pages...
    
    const { result } = renderHook(
      () => useProductsInfiniteQuery({ pageSize: 20 }),
      { wrapper: createWrapper() }
    )
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    
    result.current.fetchNextPage()
    
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))
  })
  
  it('does not fetch when disabled', () => {
    const spy = vi.spyOn(API.Store.Products, 'searchPublic')
    
    renderHook(
      () => useProductsInfiniteQuery({ pageSize: 20, enabled: false }),
      { wrapper: createWrapper() }
    )
    
    expect(spy).not.toHaveBeenCalled()
  })
})

// 3. E2E Test with Playwright
// New file: client/e2e/store.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Store Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/store')
    await page.waitForSelector('[data-testid="product-card"]')
  })
  
  test('loads and displays products', async ({ page }) => {
    const products = page.locator('[data-testid="product-card"]')
    await expect(products.first()).toBeVisible()
    await expect(products).toHaveCountGreaterThan(0)
  })
  
  test('search filters products', async ({ page }) => {
    const searchInput = page.getByRole('searchbox', { name: /search products/i })
    await searchInput.fill('medical')
    await searchInput.press('Enter')
    
    await page.waitForResponse(resp => resp.url().includes('search'))
    
    const products = page.locator('[data-testid="product-card"]')
    await expect(products).toHaveCountGreaterThan(0)
  })
  
  test('infinite scroll loads more products', async ({ page }) => {
    const initialProducts = await page.locator('[data-testid="product-card"]').count()
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    // Wait for more products to load
    await page.waitForResponse(resp => resp.url().includes('search'))
    
    const newProductCount = await page.locator('[data-testid="product-card"]').count()
    expect(newProductCount).toBeGreaterThan(initialProducts)
  })
  
  test('add to cart works', async ({ page }) => {
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    const addToCartButton = firstProduct.getByRole('button', { name: /add to cart/i })
    
    await addToCartButton.click()
    
    // Check toast notification
    await expect(page.getByText(/added to cart/i)).toBeVisible()
    
    // Check cart badge updates
    const cartBadge = page.getByTestId('cart-badge')
    await expect(cartBadge).toHaveText('1')
  })
  
  test('category filter works', async ({ page }) => {
    // Click a category in sidebar
    const categoryFilter = page.getByRole('checkbox', { name: /equipment/i })
    await categoryFilter.click()
    
    await page.waitForResponse(resp => resp.url().includes('search'))
    
    // Verify URL updated
    await expect(page).toHaveURL(/categories=/)
  })
  
  test('keyboard navigation works', async ({ page }) => {
    await page.keyboard.press('Tab')
    
    // Skip link should be focused
    await expect(page.getByText('Skip to products')).toBeFocused()
  })
})

// 4. Visual Regression Test
// New file: client/e2e/visual/store.visual.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Store Visual Regression', () => {
  test('product grid matches snapshot', async ({ page }) => {
    await page.goto('/store')
    await page.waitForSelector('[data-testid="product-card"]')
    
    // Wait for images to load
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveScreenshot('store-product-grid.png', {
      fullPage: false,
      mask: [page.locator('[data-testid="dynamic-content"]')],
    })
  })
  
  test('product card hover state', async ({ page }) => {
    await page.goto('/store')
    const card = page.locator('[data-testid="product-card"]').first()
    
    await card.hover()
    
    await expect(card).toHaveScreenshot('product-card-hover.png')
  })
})
```

---

## 10. Analytics & Monitoring (4.0/10)

### ✅ What's Implemented

| Feature | Status | Details |
|---------|--------|---------|
| Logger Integration | ✅ Good | Centralized logger |
| Notification Service | ✅ Good | Tracks user actions |

### ❌ Missing Features (-6.0 points)

| Feature | Impact | MAANG Reference |
|---------|--------|-----------------|
| **Page View Tracking** | -0.5 | GA4: Track store page views |
| **Product Impression Tracking** | -0.6 | GA4 E-commerce: Track product views |
| **Add to Cart Tracking** | -0.4 | GA4: Track add to cart events |
| **Search Tracking** | -0.4 | Track search queries & results |
| **Filter Usage Analytics** | -0.3 | Track which filters are used |
| **Conversion Funnel** | -0.5 | Store → Cart → Checkout |
| **Real User Monitoring (RUM)** | -0.5 | Core Web Vitals tracking |
| **Error Monitoring** | -0.5 | Sentry/Datadog integration |
| **A/B Testing Framework** | -0.5 | Split testing for features |
| **Heatmaps** | -0.3 | Hotjar/FullStory integration |
| **Session Recording** | -0.3 | For UX analysis |
| **Custom Dashboards** | -0.3 | Real-time metrics |
| **Alerting** | -0.4 | Alert on error spikes |
| **Attribution Tracking** | -0.3 | Track referral sources |
| **Click Tracking** | -0.2 | Track product clicks |

### 🔧 Recommendations

```typescript
// 1. Analytics Service
// New file: client/app/_features/analytics/services/ecommerceAnalytics.ts
import { logger } from '@_core'

type ProductImpressionData = {
  id: string
  name: string
  category?: string
  position: number
  list: string
}

type AddToCartData = {
  id: string
  name: string
  quantity: number
  position?: number
}

class EcommerceAnalyticsService {
  private ga4: typeof gtag | undefined
  
  constructor() {
    if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
      this.ga4 = gtag
    }
  }
  
  // Track page view
  trackPageView(pagePath: string, pageTitle: string) {
    this.ga4?.('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    })
    logger.debug('Analytics: page_view', { pagePath, pageTitle })
  }
  
  // Track product impressions (when products are viewed in list)
  trackProductImpressions(products: ProductImpressionData[], listName: string) {
    this.ga4?.('event', 'view_item_list', {
      item_list_name: listName,
      items: products.map((p, i) => ({
        item_id: p.id,
        item_name: p.name,
        item_category: p.category,
        index: p.position,
        item_list_name: listName,
      })),
    })
  }
  
  // Track product click
  trackProductClick(product: ProductImpressionData, listName: string) {
    this.ga4?.('event', 'select_item', {
      item_list_name: listName,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        index: product.position,
      }],
    })
  }
  
  // Track product detail view
  trackProductView(product: { id: string; name: string; category?: string }) {
    this.ga4?.('event', 'view_item', {
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
      }],
    })
  }
  
  // Track add to cart
  trackAddToCart(data: AddToCartData) {
    this.ga4?.('event', 'add_to_cart', {
      items: [{
        item_id: data.id,
        item_name: data.name,
        quantity: data.quantity,
      }],
    })
    
    logger.info('Analytics: add_to_cart', { 
      productId: data.id, 
      quantity: data.quantity 
    })
  }
  
  // Track search
  trackSearch(searchTerm: string, resultsCount: number) {
    this.ga4?.('event', 'search', {
      search_term: searchTerm,
      results_count: resultsCount,
    })
  }
  
  // Track filter usage
  trackFilterApplied(filterType: string, filterValue: string) {
    this.ga4?.('event', 'filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
    })
  }
}

export const ecommerceAnalytics = new EcommerceAnalyticsService()

// 2. Use in Components
// In ProductCard.tsx:
const handleCardClick = () => {
  ecommerceAnalytics.trackProductClick({
    id: product.id,
    name: product.name,
    category: product.categories[0]?.name,
    position: index,
  }, 'store_catalog')
}

// In AddToCartButton.tsx:
ecommerceAnalytics.trackAddToCart({
  id: product.id,
  name: product.name,
  quantity,
})

// 3. Track Product Impressions with Intersection Observer
// In VirtualizedProductGrid.tsx:
useEffect(() => {
  // Track visible products for impressions
  const visibleProducts = rowsToRender.flatMap(row => 
    row.products.map((p, i) => ({
      id: p.product.id,
      name: p.product.name,
      category: p.product.categories[0]?.name,
      position: p.index,
      list: 'store_catalog',
    }))
  )
  
  if (visibleProducts.length > 0) {
    ecommerceAnalytics.trackProductImpressions(visibleProducts, 'store_catalog')
  }
}, [virtualRows])

// 4. Core Web Vitals Monitoring
// New file: client/app/_lib/webVitals.ts
import { onLCP, onFID, onCLS, onFCP, onTTFB } from 'web-vitals'

export function reportWebVitals() {
  const reportMetric = (metric: { name: string; value: number }) => {
    // Send to analytics
    gtag?.('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
      non_interaction: true,
    })
    
    // Also log for debugging
    logger.debug('Web Vital', { name: metric.name, value: metric.value })
  }
  
  onLCP(reportMetric)
  onFID(reportMetric)
  onCLS(reportMetric)
  onFCP(reportMetric)
  onTTFB(reportMetric)
}

// 5. Error Monitoring with Sentry
// Update client/app/layout.tsx:
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

---

## Implementation Priority Matrix

| Priority | Feature | Impact | Effort | ROI |
|----------|---------|--------|--------|-----|
| 🔴 P0 | Search Autocomplete | High | Medium | High |
| 🔴 P0 | Product Impressions Tracking | High | Low | Very High |
| 🔴 P0 | Error Boundary | High | Low | High |
| 🟠 P1 | Wishlist | High | Medium | High |
| 🟠 P1 | Quick View Modal | Medium | Medium | High |
| 🟠 P1 | JSON-LD Structured Data | High | Low | Very High |
| 🟠 P1 | Store Component Tests | High | High | Medium |
| 🟡 P2 | Recently Viewed | Medium | Low | High |
| 🟡 P2 | Faceted Filters | High | High | Medium |
| 🟡 P2 | Live Region Announcements | Medium | Low | High |
| 🟡 P2 | Scroll Position Restoration | Medium | Medium | Medium |
| 🟢 P3 | Product Comparison | Medium | High | Medium |
| 🟢 P3 | A/B Testing Framework | Medium | High | Medium |
| 🟢 P3 | Visual Regression Tests | Low | Medium | Low |
| 🟢 P3 | Bulk Order Form | Low | Medium | Low |

---

## Recommended Implementation Roadmap

### Phase 1: Quick Wins (1-2 weeks)
- [ ] Add Error Boundary for store
- [ ] Implement JSON-LD structured data
- [ ] Add product impression tracking
- [ ] Live region for results count
- [ ] Skip link for accessibility

### Phase 2: Core Features (2-3 weeks)
- [ ] Search autocomplete with suggestions
- [ ] Wishlist functionality
- [ ] Quick view modal
- [ ] Recently viewed products
- [ ] Active filter tags

### Phase 3: Polish & Testing (2-3 weeks)
- [ ] Comprehensive component tests
- [ ] E2E tests with Playwright
- [ ] Accessibility audit & fixes
- [ ] Performance monitoring setup
- [ ] Error monitoring (Sentry)

### Phase 4: Advanced Features (3-4 weeks)
- [ ] Faceted filters with counts
- [ ] Price range slider
- [ ] Product comparison
- [ ] Scroll position restoration
- [ ] A/B testing framework

---

## Conclusion

Your store page has a **solid foundation** with excellent data fetching patterns and virtualization. The main gaps are in **e-commerce features** (wishlist, comparison, quick view), **testing**, and **analytics**.

**Key Strengths:**
- ✅ React Query infinite scroll
- ✅ Window virtualization
- ✅ Server-side rendering
- ✅ Professional skeleton loaders
- ✅ Clean component architecture

**Critical Gaps:**
- ❌ No wishlist/favorites
- ❌ No search autocomplete
- ❌ Missing accessibility features
- ❌ No e-commerce analytics
- ❌ No test coverage for store

Following this audit and implementing the recommendations will elevate your store from **6.68/10 to 9.0+/10** - truly MAANG-level.

---

*Document generated by AI Code Analyst. For questions or clarifications, consult the development team.*

