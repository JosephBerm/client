# Quote Pricing PRD

## 1. Overview

- **Feature**: Quote Pricing Workflow (Vendor Cost + Customer Price)
- **Priority**: P0 (Critical - Completes core quote workflow)
- **Status**: Not Started
- **Dependencies**: Quote Management (Complete), RBAC System (Complete)
- **Estimated Effort**: 12-16 hours

## 2. Business Context

**From `business_flow.md` Section 4 - INTERNAL PROCESSING:**

> After a quote is submitted, the sales rep negotiates with vendors to get pricing.
> Once the vendor responds with pricing, the sales rep:
> 1. Records the vendor cost (what MedSource pays)
> 2. Sets the customer price (what customer pays - must be > vendor cost)
> 3. Reviews margin and totals
> 4. Submits quote to customer (Status: Approved)

**Business Value:**
- Enables sales reps to complete the full quote workflow
- Tracks profit margins per product
- Prevents sending quotes without pricing
- Creates audit trail of pricing decisions

**Business Rules:**
- Customer price MUST be ≥ Vendor cost (enforce at DB + API + UI levels)
- ALL products must have customer price before "Send to Customer"
- Vendor cost is optional (sales rep may not always get formal quote)
- Margin = Customer Price - Vendor Cost
- Margin % = (Customer Price - Vendor Cost) / Vendor Cost × 100

---

## 3. Role-Based Requirements

### Customer View

**Can:**
- View quote with final customer prices (after quote is sent)
- See line totals (quantity × customer price)
- See quote total

**Cannot:**
- See vendor cost (internal data)
- See margins
- Edit any pricing

---

### Sales Rep View

**Can:**
- View/edit pricing for quotes ASSIGNED to them
- Input vendor cost per product
- Input customer price per product
- See calculated margins (per product and total)
- Submit quote to customer (when all prices set)

**Cannot:**
- Edit pricing on quotes NOT assigned to them
- Edit pricing after quote is Approved/Converted
- See other sales reps' quotes

---

### Sales Manager View

**Can:**
- View/edit pricing for ALL quotes
- Override pricing on any quote (audit logged)
- Reassign quotes
- View margin analysis across team

**Cannot:**
- Nothing - full access to quotes

---

### Admin View

**Can:**
- Full access (same as Sales Manager)
- View pricing history/audit logs

---

## 4. User Stories

### Epic 1: Vendor Cost Input

**US-QP-001**: As a Sales Rep, I want to input vendor cost per product so that I can track my costs.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given I'm on quote detail page, when status is "Read", then I see editable vendor cost field per product
  - [ ] Given I enter vendor cost 100.00, when I blur the field, then it saves automatically
  - [ ] Given vendor cost is empty, when I view product row, then it shows "—" placeholder
  - [ ] Given I'm a customer, when viewing quote, then I do NOT see vendor cost field

---

### Epic 2: Customer Price Input

**US-QP-002**: As a Sales Rep, I want to input customer price per product so that I can set selling prices.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given I'm on quote detail page, when status is "Read", then I see editable customer price field per product
  - [ ] Given I enter customer price 150.00, when I blur the field, then it saves automatically
  - [ ] Given customer price < vendor cost, when I try to save, then validation error is shown
  - [ ] Given customer price is set, when I view product row, then line total is calculated (qty × price)

**US-QP-003**: As a Sales Rep, I want to see margin per product so that I can ensure profitability.
- **Priority**: P1
- **Acceptance Criteria**:
  - [ ] Given vendor cost is 100 and customer price is 150, when viewing, then margin shows "$50 (50%)"
  - [ ] Given vendor cost is empty, when viewing margin, then it shows "—"
  - [ ] Given margin is negative (price < cost), when viewing, then it shows in red with warning

---

### Epic 3: Quote Submission Validation

**US-QP-004**: As a Sales Rep, I want the system to prevent sending quotes without complete pricing.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given 1 product has no customer price, when I click "Send to Customer", then button is disabled
  - [ ] Given 1 product has no customer price, when I hover disabled button, then tooltip explains why
  - [ ] Given all products have customer price, when I click "Send to Customer", then quote is sent

---

## 5. Technical Architecture

### 5.1 Backend

#### Database Changes

**Migration**: `20241220_AddPricingToCartProduct.cs`

```csharp
public partial class AddPricingToCartProduct : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<decimal>(
            name: "vendor_cost",
            table: "CartProducts",
            type: "numeric(18,2)",
            nullable: true);
            
        migrationBuilder.AddColumn<decimal>(
            name: "customer_price",
            table: "CartProducts",
            type: "numeric(18,2)",
            nullable: true);
            
        // Check constraint: customer_price >= vendor_cost (when both are set)
        migrationBuilder.Sql(@"
            ALTER TABLE ""CartProducts"" 
            ADD CONSTRAINT ""CK_CartProducts_Price_GreaterThan_Cost"" 
            CHECK (customer_price IS NULL OR vendor_cost IS NULL OR customer_price >= vendor_cost)
        ");
    }
    
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            ALTER TABLE ""CartProducts"" 
            DROP CONSTRAINT ""CK_CartProducts_Price_GreaterThan_Cost""
        ");
        
        migrationBuilder.DropColumn(name: "customer_price", table: "CartProducts");
        migrationBuilder.DropColumn(name: "vendor_cost", table: "CartProducts");
    }
}
```

---

#### Entity Updates

**File**: `server/Entities/CartProduct.cs`

```csharp
// ADD to CartProduct class:

/// <summary>
/// Vendor cost (what MedSource pays vendor).
/// Set by sales rep after vendor negotiation.
/// NULL if not yet negotiated or unknown.
/// </summary>
[Column("vendor_cost")]
public decimal? VendorCost { get; set; }

/// <summary>
/// Customer price (what customer pays MedSource).
/// Must be >= VendorCost when both are set.
/// Required before quote can be sent to customer.
/// </summary>
[Column("customer_price")]
public decimal? CustomerPrice { get; set; }

/// <summary>
/// Calculated line total (CustomerPrice × Quantity).
/// Returns null if CustomerPrice is not set.
/// </summary>
[NotMapped]
public decimal? LineTotal => CustomerPrice.HasValue ? CustomerPrice.Value * Quantity : null;

/// <summary>
/// Calculated margin (CustomerPrice - VendorCost).
/// Returns null if either price is not set.
/// </summary>
[NotMapped]
public decimal? Margin => (CustomerPrice.HasValue && VendorCost.HasValue) 
    ? CustomerPrice.Value - VendorCost.Value 
    : null;

/// <summary>
/// Calculated margin percentage.
/// Returns null if either price is not set or VendorCost is 0.
/// </summary>
[NotMapped]
public decimal? MarginPercent => (CustomerPrice.HasValue && VendorCost.HasValue && VendorCost.Value > 0)
    ? Math.Round((CustomerPrice.Value - VendorCost.Value) / VendorCost.Value * 100, 2)
    : null;
```

---

#### DTOs

**File**: `server/Classes/Others/QuotePricingDTOs.cs` (NEW)

```csharp
/// <summary>
/// Request DTO for updating pricing on a single product.
/// </summary>
public class UpdateProductPricingRequest
{
    /// <summary>CartProduct ID (GUID)</summary>
    [Required]
    public Guid ProductId { get; set; }
    
    /// <summary>Vendor cost (optional)</summary>
    [Range(0, double.MaxValue, ErrorMessage = "Vendor cost must be non-negative")]
    public decimal? VendorCost { get; set; }
    
    /// <summary>Customer price (optional, but required before sending quote)</summary>
    [Range(0, double.MaxValue, ErrorMessage = "Customer price must be non-negative")]
    public decimal? CustomerPrice { get; set; }
}

/// <summary>
/// Request DTO for batch updating pricing on multiple products.
/// </summary>
public class UpdateQuotePricingRequest
{
    /// <summary>Quote ID</summary>
    [Required]
    public Guid QuoteId { get; set; }
    
    /// <summary>Product pricing updates</summary>
    [Required]
    [MinLength(1, ErrorMessage = "At least one product pricing update is required")]
    public List<UpdateProductPricingRequest> Products { get; set; } = new();
}

/// <summary>
/// Response DTO for pricing summary.
/// </summary>
public class QuotePricingSummary
{
    public Guid QuoteId { get; set; }
    public decimal? TotalVendorCost { get; set; }
    public decimal? TotalCustomerPrice { get; set; }
    public decimal? TotalMargin { get; set; }
    public decimal? TotalMarginPercent { get; set; }
    public int ProductsWithPricing { get; set; }
    public int TotalProducts { get; set; }
    public bool CanSendToCustomer { get; set; }
}
```

---

#### Service Updates

**File**: `server/Services/DB/QuoteService.cs`

```csharp
// ADD to IQuoteService interface:
Task<Quote> UpdateProductPricing(Guid quoteId, UpdateProductPricingRequest pricing);
Task<QuotePricingSummary> GetPricingSummary(Guid quoteId);

// ADD to QuoteService implementation:

public async Task<Quote> UpdateProductPricing(Guid quoteId, UpdateProductPricingRequest pricing)
{
    var quote = await _database.Quotes
        .Include(q => q.Products)
        .FirstOrDefaultAsync(q => q.Id == quoteId);
        
    if (quote == null)
        throw new KeyNotFoundException($"Quote {quoteId} not found");
        
    // Find the product
    var product = quote.Products.FirstOrDefault(p => p.Id == pricing.ProductId);
    if (product == null)
        throw new KeyNotFoundException($"Product {pricing.ProductId} not found in quote");
        
    // Validate business rule: CustomerPrice >= VendorCost
    if (pricing.CustomerPrice.HasValue && pricing.VendorCost.HasValue)
    {
        if (pricing.CustomerPrice.Value < pricing.VendorCost.Value)
        {
            throw new InvalidOperationException(
                $"Customer price ({pricing.CustomerPrice:C}) must be >= vendor cost ({pricing.VendorCost:C})"
            );
        }
    }
    
    // Update pricing
    product.VendorCost = pricing.VendorCost;
    product.CustomerPrice = pricing.CustomerPrice;
    
    await _database.SaveChangesAsync();
    
    return quote;
}

public async Task<QuotePricingSummary> GetPricingSummary(Guid quoteId)
{
    var quote = await _database.Quotes
        .Include(q => q.Products)
        .FirstOrDefaultAsync(q => q.Id == quoteId);
        
    if (quote == null)
        throw new KeyNotFoundException($"Quote {quoteId} not found");
        
    var productsWithPricing = quote.Products.Count(p => p.CustomerPrice.HasValue);
    var totalVendorCost = quote.Products.Sum(p => p.VendorCost ?? 0 * p.Quantity);
    var totalCustomerPrice = quote.Products.Sum(p => (p.CustomerPrice ?? 0) * p.Quantity);
    var totalMargin = totalCustomerPrice - totalVendorCost;
    
    return new QuotePricingSummary
    {
        QuoteId = quoteId,
        TotalVendorCost = totalVendorCost > 0 ? totalVendorCost : null,
        TotalCustomerPrice = totalCustomerPrice > 0 ? totalCustomerPrice : null,
        TotalMargin = totalMargin != 0 ? totalMargin : null,
        TotalMarginPercent = totalVendorCost > 0 ? Math.Round(totalMargin / totalVendorCost * 100, 2) : null,
        ProductsWithPricing = productsWithPricing,
        TotalProducts = quote.Products.Count,
        CanSendToCustomer = productsWithPricing == quote.Products.Count && quote.Products.Count > 0
    };
}
```

---

#### Controller Endpoints

**File**: `server/Controllers/QuotesController.cs` (ADD methods)

```csharp
/// <summary>
/// Updates pricing for a single product in a quote.
/// 
/// Authorization: SalesRep (assigned) or SalesManager+
/// </summary>
[HttpPut("{quoteId:guid}/pricing")]
public async Task<IResponse<Quote>> UpdateProductPricing(
    Guid quoteId, 
    [FromBody] UpdateProductPricingRequest request)
{
    var user = await _accountService.GetById();
    if (user == null)
        return Unauthorized<Quote>("Authentication required");
        
    // Get quote to check authorization
    var quote = await _quoteService.Get(quoteId);
    if (quote == null)
        return NotFound<Quote>($"Quote {quoteId} not found");
        
    // Authorization: SalesRep can only edit assigned quotes
    if (user.Role == AccountRole.SalesRep)
    {
        if (quote.AssignedSalesRepId != user.Id.ToString())
            return Unauthorized<Quote>("You can only edit pricing for quotes assigned to you");
    }
    else if (!user.isSalesManagerOrAbove())
    {
        return Unauthorized<Quote>("Sales Rep or above required to edit pricing");
    }
    
    // Cannot edit pricing on non-Read quotes
    if (quote.Status != QuoteStatus.Read)
    {
        return BadRequest<Quote>(
            $"Can only edit pricing on quotes with status 'Read'. Current status: {quote.Status}"
        );
    }
    
    try
    {
        var updated = await _quoteService.UpdateProductPricing(quoteId, request);
        return Ok<Quote>("pricing_updated", updated);
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest<Quote>(ex.Message);
    }
    catch (KeyNotFoundException ex)
    {
        return NotFound<Quote>(ex.Message);
    }
}

/// <summary>
/// Gets pricing summary for a quote (totals, margins, can-send status).
/// </summary>
[HttpGet("{quoteId:guid}/pricing/summary")]
public async Task<IResponse<QuotePricingSummary>> GetPricingSummary(Guid quoteId)
{
    var user = await _accountService.GetById();
    if (user == null)
        return Unauthorized<QuotePricingSummary>("Authentication required");
        
    // Authorization check (same as GetQuote)
    var quote = await _quoteService.Get(quoteId);
    if (quote == null)
        return NotFound<QuotePricingSummary>($"Quote {quoteId} not found");
        
    // Customers cannot see pricing summary (contains margin data)
    if (user.Role == AccountRole.Customer)
        return Unauthorized<QuotePricingSummary>("Customers cannot view pricing summary");
        
    // SalesRep can only see assigned quotes
    if (user.Role == AccountRole.SalesRep && quote.AssignedSalesRepId != user.Id.ToString())
        return Unauthorized<QuotePricingSummary>("You can only view pricing for assigned quotes");
        
    try
    {
        var summary = await _quoteService.GetPricingSummary(quoteId);
        return Ok<QuotePricingSummary>("summary_retrieved", summary);
    }
    catch (KeyNotFoundException ex)
    {
        return NotFound<QuotePricingSummary>(ex.Message);
    }
}
```

---

### 5.2 Frontend

#### Entity Updates

**File**: `client/app/_classes/Product.ts`

```typescript
// UPDATE CartProduct class:

export class CartProduct {
  /** Full product object (populated from API) */
  product: IProduct | null = null
  
  /** Quantity of this product in cart */
  quantity: number = 0
  
  /** Product ID (for lightweight cart storage) */
  productId: string | null = null
  
  /**
   * Vendor cost (what MedSource pays vendor).
   * Set by sales rep after vendor negotiation.
   * @see business_flow.md Section 4 - Vendor Pricing Request
   */
  vendorCost: number | null = null
  
  /**
   * Customer price (what customer pays MedSource).
   * Must be >= vendorCost when both are set.
   * @see business_flow.md Section 4 - Pricing Strategy
   */
  customerPrice: number | null = null
  
  /**
   * Calculated line total (customerPrice × quantity).
   */
  get lineTotal(): number | null {
    return this.customerPrice != null ? this.customerPrice * this.quantity : null
  }
  
  /**
   * Calculated margin (customerPrice - vendorCost).
   */
  get margin(): number | null {
    if (this.customerPrice == null || this.vendorCost == null) return null
    return this.customerPrice - this.vendorCost
  }
  
  /**
   * Calculated margin percentage.
   */
  get marginPercent(): number | null {
    if (this.margin == null || this.vendorCost == null || this.vendorCost === 0) return null
    return Math.round((this.margin / this.vendorCost) * 100 * 100) / 100
  }
  
  constructor(param?: Partial<CartProduct>) {
    if (param) {
      Object.assign(this, param)
    }
  }
}
```

---

#### Validation Schema

**File**: `client/app/_core/validation/validation-schemas.ts`

```typescript
// ADD to validation schemas:

/**
 * Product pricing validation schema.
 * Used in QuotePricingEditor component.
 */
export const productPricingSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  vendorCost: z.coerce.number().nonnegative('Vendor cost must be non-negative').nullable(),
  customerPrice: z.coerce.number().nonnegative('Customer price must be non-negative').nullable(),
}).refine(
  (data) => {
    // If both are set, customer price must be >= vendor cost
    if (data.vendorCost != null && data.customerPrice != null) {
      return data.customerPrice >= data.vendorCost
    }
    return true
  },
  {
    message: 'Customer price must be greater than or equal to vendor cost',
    path: ['customerPrice'],
  }
)

export type ProductPricingFormData = z.infer<typeof productPricingSchema>

/**
 * Quote pricing summary type (from API).
 */
export interface QuotePricingSummary {
  quoteId: string
  totalVendorCost: number | null
  totalCustomerPrice: number | null
  totalMargin: number | null
  totalMarginPercent: number | null
  productsWithPricing: number
  totalProducts: number
  canSendToCustomer: boolean
}
```

---

#### API Integration

**File**: `client/app/_shared/services/api.ts`

```typescript
// ADD to API.Quotes object:

Quotes: {
  // ... existing methods ...
  
  /**
   * Updates pricing for a single product in a quote.
   * @param quoteId - Quote ID
   * @param productId - CartProduct ID
   * @param vendorCost - Vendor cost (nullable)
   * @param customerPrice - Customer price (nullable)
   */
  updateProductPricing: async (
    quoteId: string,
    productId: string,
    vendorCost: number | null,
    customerPrice: number | null
  ) => HttpService.put<Quote>(`/quotes/${quoteId}/pricing`, {
    productId,
    vendorCost,
    customerPrice,
  }),
  
  /**
   * Gets pricing summary for a quote.
   * @param quoteId - Quote ID
   */
  getPricingSummary: async (quoteId: string) =>
    HttpService.get<QuotePricingSummary>(`/quotes/${quoteId}/pricing/summary`),
},
```

---

#### Custom Hook

**File**: `client/app/app/quotes/[id]/_components/hooks/useQuotePricing.ts` (NEW)

```typescript
/**
 * useQuotePricing Hook
 * 
 * Manages quote pricing updates (vendor cost, customer price).
 * Uses useFormSubmit for DRY API handling.
 * 
 * @module app/quotes/[id]/_components/hooks/useQuotePricing
 */

'use client'

import { useCallback, useMemo } from 'react'

import { useFormSubmit, API } from '@_shared'
import { productPricingSchema, type ProductPricingFormData } from '@_core/validation/validation-schemas'

import type Quote from '@_classes/Quote'
import type { QuotePricingSummary } from '@_core/validation/validation-schemas'

export interface UseQuotePricingReturn {
  /** Update pricing for a single product */
  updatePricing: (data: ProductPricingFormData) => Promise<{ success: boolean }>
  /** Whether pricing update is in progress */
  isUpdating: boolean
  /** Validate pricing data (client-side) */
  validatePricing: (data: ProductPricingFormData) => { valid: boolean; errors: string[] }
  /** Check if all products have customer price set */
  canSendToCustomer: (quote: Quote | null) => boolean
}

export function useQuotePricing(
  quote: Quote | null,
  onRefresh?: () => Promise<void>
): UseQuotePricingReturn {
  const quoteId = quote?.id
  
  // API call wrapped in useFormSubmit for DRY error handling
  const { submit, isSubmitting } = useFormSubmit(
    async (data: ProductPricingFormData) => {
      if (!quoteId) throw new Error('Quote ID required')
      
      return API.Quotes.updateProductPricing(
        quoteId,
        data.productId,
        data.vendorCost,
        data.customerPrice
      )
    },
    {
      successMessage: 'Pricing updated',
      errorMessage: 'Failed to update pricing',
      componentName: 'useQuotePricing',
      actionName: 'updatePricing',
      onSuccess: async () => {
        await onRefresh?.()
      },
    }
  )
  
  const updatePricing = useCallback(
    async (data: ProductPricingFormData) => {
      return submit(data)
    },
    [submit]
  )
  
  const validatePricing = useCallback(
    (data: ProductPricingFormData): { valid: boolean; errors: string[] } => {
      const result = productPricingSchema.safeParse(data)
      if (result.success) {
        return { valid: true, errors: [] }
      }
      return {
        valid: false,
        errors: result.error.errors.map(e => e.message),
      }
    },
    []
  )
  
  const canSendToCustomer = useCallback(
    (q: Quote | null): boolean => {
      if (!q?.products || q.products.length === 0) return false
      return q.products.every(p => p.customerPrice != null && p.customerPrice > 0)
    },
    []
  )
  
  return {
    updatePricing,
    isUpdating: isSubmitting,
    validatePricing,
    canSendToCustomer,
  }
}
```

---

#### Component

**File**: `client/app/app/quotes/[id]/_components/QuotePricingEditor.tsx` (NEW)

```typescript
/**
 * QuotePricingEditor Component
 * 
 * Editable pricing table for sales reps to input vendor cost and customer price.
 * Shows calculated margins and totals.
 * 
 * @module app/quotes/[id]/_components/QuotePricingEditor
 */

'use client'

import { useState, useCallback } from 'react'
import { DollarSign, AlertTriangle, CheckCircle } from 'lucide-react'

import { formatCurrency } from '@_lib/formatting'

import Card from '@_components/ui/Card'
import { FormInput } from '@_components/forms'

import type Quote from '@_classes/Quote'
import type { CartProduct } from '@_classes/Product'

import { useQuotePricing } from './hooks/useQuotePricing'
import type { UseQuotePermissionsReturn } from './hooks/useQuotePermissions'

interface QuotePricingEditorProps {
  quote: Quote | null
  permissions: UseQuotePermissionsReturn
  onRefresh?: () => Promise<void>
}

export default function QuotePricingEditor({
  quote,
  permissions,
  onRefresh,
}: QuotePricingEditorProps) {
  const { updatePricing, isUpdating, validatePricing, canSendToCustomer } = useQuotePricing(quote, onRefresh)
  
  // Local state for optimistic updates
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [localPricing, setLocalPricing] = useState<Record<string, { vendorCost: string; customerPrice: string }>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const products = quote?.products ?? []
  const editable = permissions.canUpdate && quote?.status === 'Read'
  
  // Initialize local pricing from quote
  const getLocalValue = useCallback(
    (productId: string, field: 'vendorCost' | 'customerPrice'): string => {
      if (localPricing[productId]?.[field] !== undefined) {
        return localPricing[productId][field]
      }
      const product = products.find(p => p.productId === productId)
      const value = product?.[field]
      return value != null ? value.toString() : ''
    },
    [localPricing, products]
  )
  
  const handleBlur = useCallback(
    async (productId: string, field: 'vendorCost' | 'customerPrice') => {
      const vendorCostStr = getLocalValue(productId, 'vendorCost')
      const customerPriceStr = getLocalValue(productId, 'customerPrice')
      
      const data = {
        productId,
        vendorCost: vendorCostStr ? parseFloat(vendorCostStr) : null,
        customerPrice: customerPriceStr ? parseFloat(customerPriceStr) : null,
      }
      
      // Validate
      const validation = validatePricing(data)
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, [productId]: validation.errors[0] }))
        return
      }
      
      setErrors(prev => ({ ...prev, [productId]: '' }))
      setEditingProduct(null)
      
      // Update via API
      await updatePricing(data)
    },
    [getLocalValue, validatePricing, updatePricing]
  )
  
  const handleChange = useCallback(
    (productId: string, field: 'vendorCost' | 'customerPrice', value: string) => {
      setEditingProduct(productId)
      setLocalPricing(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          [field]: value,
        },
      }))
    },
    []
  )
  
  // Calculate totals
  const totals = products.reduce(
    (acc, p) => {
      const vendorCost = p.vendorCost ?? 0
      const customerPrice = p.customerPrice ?? 0
      const qty = p.quantity
      
      acc.vendorTotal += vendorCost * qty
      acc.customerTotal += customerPrice * qty
      acc.marginTotal += (customerPrice - vendorCost) * qty
      
      return acc
    },
    { vendorTotal: 0, customerTotal: 0, marginTotal: 0 }
  )
  
  const marginPercent = totals.vendorTotal > 0
    ? Math.round((totals.marginTotal / totals.vendorTotal) * 100 * 100) / 100
    : 0
  
  if (!quote) return null
  
  return (
    <Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-base-content">Pricing</h3>
            <p className="text-sm text-base-content/60">
              {canSendToCustomer(quote) ? (
                <span className="text-success flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> Ready to send
                </span>
              ) : (
                <span className="text-warning flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> Set all customer prices
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
      
      {/* Pricing Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Vendor Cost</th>
              <th>Customer Price</th>
              <th>Line Total</th>
              <th>Margin</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const productId = product.productId ?? ''
              const error = errors[productId]
              const margin = product.margin
              const marginPct = product.marginPercent
              
              return (
                <tr key={productId} className={error ? 'bg-error/10' : ''}>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-medium">{product.product?.name || 'Unknown'}</span>
                      <span className="text-xs text-base-content/60">
                        SKU: {product.product?.sku || '—'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-primary badge-sm">{product.quantity}</span>
                  </td>
                  <td>
                    {editable ? (
                      <FormInput
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={getLocalValue(productId, 'vendorCost')}
                        onChange={(e) => handleChange(productId, 'vendorCost', e.target.value)}
                        onBlur={() => handleBlur(productId, 'vendorCost')}
                        disabled={isUpdating}
                        className="w-28"
                      />
                    ) : (
                      <span>{product.vendorCost != null ? formatCurrency(product.vendorCost) : '—'}</span>
                    )}
                  </td>
                  <td>
                    {editable ? (
                      <FormInput
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={getLocalValue(productId, 'customerPrice')}
                        onChange={(e) => handleChange(productId, 'customerPrice', e.target.value)}
                        onBlur={() => handleBlur(productId, 'customerPrice')}
                        disabled={isUpdating}
                        className="w-28"
                        error={error ? { message: error } : undefined}
                      />
                    ) : (
                      <span>{product.customerPrice != null ? formatCurrency(product.customerPrice) : '—'}</span>
                    )}
                  </td>
                  <td>
                    {product.lineTotal != null ? (
                      <span className="font-medium">{formatCurrency(product.lineTotal)}</span>
                    ) : (
                      <span className="text-base-content/40">—</span>
                    )}
                  </td>
                  <td>
                    {margin != null ? (
                      <span className={margin >= 0 ? 'text-success' : 'text-error'}>
                        {formatCurrency(margin)} ({marginPct}%)
                      </span>
                    ) : (
                      <span className="text-base-content/40">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={2}>Totals</td>
              <td>{formatCurrency(totals.vendorTotal)}</td>
              <td>{formatCurrency(totals.customerTotal)}</td>
              <td>{formatCurrency(totals.customerTotal)}</td>
              <td>
                <span className={totals.marginTotal >= 0 ? 'text-success' : 'text-error'}>
                  {formatCurrency(totals.marginTotal)} ({marginPercent}%)
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  )
}
```

---

#### Barrel Export Update

**File**: `client/app/app/quotes/[id]/_components/index.ts`

```typescript
// ADD:
export { default as QuotePricingEditor } from './QuotePricingEditor'
export * from './hooks/useQuotePricing'
```

---

### 5.3 RBAC Implementation

#### Backend Authorization
- `[Authorize]` on controller endpoints
- Role check: SalesRep can only edit assigned quotes
- SalesManager+ can edit any quote
- Customers CANNOT see vendor cost or margins

#### Frontend Guards
```tsx
// In QuoteDetailsPage:
{permissions.canUpdate && quote.status === QuoteStatus.Read && (
  <QuotePricingEditor 
    quote={quote} 
    permissions={permissions}
    onRefresh={refresh}
  />
)}

// In QuoteActions (update "Send to Customer" button):
<Button
  disabled={isProcessing || !canSendToCustomer(quote)}
  onClick={handleSendToCustomer}
>
  Send Quote to Customer
</Button>
```

---

## 6. Implementation Plan

### Phase 1: Database & Backend (Day 1)
- [ ] Create migration `AddPricingToCartProduct.cs`
- [ ] Run migration: `dotnet ef database update`
- [ ] Update `CartProduct.cs` entity
- [ ] Create `QuotePricingDTOs.cs`
- [ ] Add service methods to `QuoteService.cs`
- [ ] Add controller endpoints to `QuotesController.cs`
- [ ] Test endpoints with Postman/Swagger

### Phase 2: Frontend Foundation (Day 2)
- [ ] Update `CartProduct` class in `Product.ts`
- [ ] Add validation schema `productPricingSchema`
- [ ] Add API methods to `api.ts`
- [ ] Create `useQuotePricing` hook
- [ ] Test hook with mock data

### Phase 3: UI Components (Day 3)
- [ ] Create `QuotePricingEditor` component
- [ ] Update barrel exports
- [ ] Integrate into `QuoteDetailsPage`
- [ ] Update `QuoteActions` to check `canSendToCustomer`
- [ ] Test all role scenarios

### Phase 4: Testing (Day 4)
- [ ] Unit tests for `QuotePricingEditor`
- [ ] Unit tests for `useQuotePricing`
- [ ] RBAC tests (customer cannot see, sales rep can edit assigned)
- [ ] Integration test (full pricing workflow)

---

## 7. Testing Requirements

### Unit Tests

#### Component Tests
```typescript
// QuotePricingEditor.test.tsx
describe('QuotePricingEditor', () => {
  it('should render pricing inputs when editable', () => {
    // Render as sales rep with permission
  })
  
  it('should show validation error when customer price < vendor cost', () => {
    // Enter invalid pricing, verify error
  })
  
  it('should calculate margins correctly', () => {
    // Set prices, verify margin display
  })
  
  it('should disable inputs when not editable', () => {
    // Render as customer, verify inputs disabled
  })
})
```

#### Hook Tests
```typescript
// useQuotePricing.test.ts
describe('useQuotePricing', () => {
  it('should call API on updatePricing', async () => {
    // Mock API, call updatePricing, verify call
  })
  
  it('should validate pricing data', () => {
    // Test validatePricing with various inputs
  })
  
  it('should correctly determine canSendToCustomer', () => {
    // Test with complete/incomplete pricing
  })
})
```

### RBAC Security Tests
```typescript
describe('Quote Pricing RBAC', () => {
  it('should allow sales rep to edit assigned quote pricing', () => {})
  it('should deny sales rep from editing unassigned quote pricing', () => {})
  it('should deny customer from seeing vendor cost', () => {})
  it('should deny customer from seeing margins', () => {})
  it('should allow sales manager to edit any quote pricing', () => {})
})
```

### Integration Tests
```typescript
describe('Quote Pricing Workflow', () => {
  it('should complete full pricing workflow', async () => {
    // 1. Sales rep opens assigned quote (status: Read)
    // 2. Sales rep enters vendor cost for product 1
    // 3. Sales rep enters customer price for product 1
    // 4. Margin is calculated and displayed
    // 5. Repeat for all products
    // 6. "Send to Customer" button becomes enabled
    // 7. Sales rep clicks send
    // 8. Quote status changes to Approved
  })
})
```

---

## 8. Dependencies

### Reused Components
- `FormInput` from `@_components/forms`
- `Card` from `@_components/ui`
- `Button` from `@_components/ui`

### Reused Hooks
- `useFormSubmit` from `@_shared/hooks`
- `useQuotePermissions` from local hooks

### Reused Services
- `API.Quotes.update` from `@_shared/services/api`

### New Files
```
server/
├── Migrations/20241220_AddPricingToCartProduct.cs
└── Classes/Others/QuotePricingDTOs.cs

client/
└── app/app/quotes/[id]/_components/
    ├── QuotePricingEditor.tsx
    └── hooks/useQuotePricing.ts
```

### Modified Files
```
server/
├── Entities/CartProduct.cs
├── Services/DB/QuoteService.cs
└── Controllers/QuotesController.cs

client/
├── app/_classes/Product.ts
├── app/_core/validation/validation-schemas.ts
├── app/_shared/services/api.ts
└── app/app/quotes/[id]/_components/index.ts
```

---

## 9. Success Criteria

- [ ] Sales rep can input vendor cost per product
- [ ] Sales rep can input customer price per product
- [ ] System validates customer price >= vendor cost
- [ ] Margins are calculated and displayed correctly
- [ ] "Send to Customer" is disabled until all prices set
- [ ] Customer cannot see vendor cost or margins
- [ ] All tests passing (95%+ coverage)
- [ ] No TypeScript errors
- [ ] Barrel exports implemented

