# Quote Pricing Feature - Implementation Plan

## Overview

This plan implements the ability for sales reps to input vendor cost and customer price for quote items, following the business flow where sales reps negotiate with vendors, record agreed-upon costs, and set customer prices (which should be higher than vendor cost).

**Business Flow Alignment:**
1. Quote submitted → Auto-assigned to sales rep (Status: Unread)
2. Sales rep marks as Read (takes ownership)
3. Sales rep negotiates with vendor (external process)
4. Sales rep records vendor cost (agreed price with vendor)
5. Sales rep sets customer price (must be > vendor cost)
6. Sales rep can "Submit Quote to Customer" (Status: Approved)

---

## Architecture Principles

- **DRY (Don't Repeat Yourself)**: Reuse existing components, hooks, and patterns
- **Separation of Concerns**: Backend (data), Services (business logic), Components (UI)
- **Type Safety**: Full TypeScript coverage, type-safe API contracts
- **MAANG-Level Code Quality**: Industry best practices, comprehensive error handling
- **Existing Patterns**: Follow existing codebase patterns (OrderItem pricing, FormInput, useFormSubmit)

---

## Step-by-Step Implementation Plan

### Phase 1: Database Schema & Entity Updates (Backend)

#### 1.1 Create Database Migration

**File**: `server/Migrations/YYYYMMDDHHMMSS_AddPricingToCartProduct.cs`

**Changes**:
- Add `vendor_cost` column (decimal, nullable) to `CartProducts` table
- Add `customer_price` column (decimal, nullable) to `CartProducts` table
- Add database index for performance on quote lookups

**Rationale**: 
- Following OrderItem pattern (`BuyPrice`/`SellPrice`)
- Nullable fields allow quotes without pricing initially (backward compatible)
- Decimal type for precise financial calculations

**Migration Code Structure**:
```csharp
public partial class AddPricingToCartProduct : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<decimal>(
            name: "vendor_cost",
            table: "CartProducts",
            type: "numeric",
            nullable: true);

        migrationBuilder.AddColumn<decimal>(
            name: "customer_price",
            table: "CartProducts",
            type: "numeric",
            nullable: true);

        // Add check constraint: customer_price >= vendor_cost (if vendor_cost is set)
        migrationBuilder.AddCheckConstraint(
            name: "CK_CartProducts_CustomerPrice_GreaterThanOrEqual_VendorCost",
            table: "CartProducts",
            sql: "customer_price IS NULL OR vendor_cost IS NULL OR customer_price >= vendor_cost");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropCheckConstraint(
            name: "CK_CartProducts_CustomerPrice_GreaterThanOrEqual_VendorCost",
            table: "CartProducts");

        migrationBuilder.DropColumn(
            name: "customer_price",
            table: "CartProducts");

        migrationBuilder.DropColumn(
            name: "vendor_cost",
            table: "CartProducts");
    }
}
```

#### 1.2 Update CartProduct Entity

**File**: `server/Entities/CartProduct.cs`

**Changes**:
- Add `VendorCost` property (decimal?)
- Add `CustomerPrice` property (decimal?)
- Add XML documentation
- Follow existing naming conventions

**Code**:
```csharp
/// <summary>
/// Vendor cost (agreed price with vendor).
/// Set by sales rep after vendor negotiation.
/// </summary>
[Column("vendor_cost")]
public decimal? VendorCost { get; set; }

/// <summary>
/// Customer price (selling price to customer).
/// Must be >= VendorCost when both are set.
/// Set by sales rep before submitting quote to customer.
/// </summary>
[Column("customer_price")]
public decimal? CustomerPrice { get; set; }
```

**Rationale**: 
- Follows OrderItem pattern (`BuyPrice`/`SellPrice`)
- Nullable allows backward compatibility
- XML docs for IntelliSense and API documentation

---

### Phase 2: Backend API & Service Layer

#### 2.1 Update QuoteService (No Changes Required)

**File**: `server/Services/DB/QuoteService.cs`

**Rationale**: 
- Service uses Entity Framework Change Tracking
- Existing `Update` method handles nested entity updates automatically
- EF Core will persist CartProduct changes when Quote is updated

**Note**: Verify that `Get` method includes Products with `Include(q => q.Products)`

#### 2.2 Add Validation to QuotesController

**File**: `server/Controllers/QuotesController.cs`

**Changes**: Update `UpdateQuote` method to add business rule validation

**Validation Logic**:
```csharp
// Validate pricing rules before updating
if (quote.Products != null)
{
    foreach (var product in quote.Products)
    {
        // Business Rule: If both prices are set, customer price must be >= vendor cost
        if (product.VendorCost.HasValue && product.CustomerPrice.HasValue)
        {
            if (product.CustomerPrice.Value < product.VendorCost.Value)
            {
                return BadRequest<Quote>(
                    $"Customer price (${product.CustomerPrice}) must be greater than or equal to vendor cost (${product.VendorCost}) for product {product.ProductId}"
                );
            }
        }
        
        // Business Rule: Cannot submit quote to customer without pricing
        // (This is checked in frontend, but backend should also enforce)
        // Note: This validation might be at "Send to Customer" action, not general update
    }
}
```

**Rationale**: 
- Server-side validation for data integrity
- Clear error messages for frontend
- Business rules enforced at API boundary

#### 2.3 Add Helper Method for Pricing Validation

**File**: `server/Helpers/QuoteValidationHelper.cs` (new file)

**Purpose**: Extract validation logic for reusability and testability

**Code Structure**:
```csharp
public static class QuoteValidationHelper
{
    /// <summary>
    /// Validates pricing rules for quote products.
    /// </summary>
    public static (bool IsValid, string? ErrorMessage) ValidatePricing(IEnumerable<CartProduct> products)
    {
        foreach (var product in products)
        {
            if (product.VendorCost.HasValue && product.CustomerPrice.HasValue)
            {
                if (product.CustomerPrice.Value < product.VendorCost.Value)
                {
                    return (false, $"Customer price must be >= vendor cost for product {product.ProductId}");
                }
            }
        }
        return (true, null);
    }
}
```

**Rationale**: 
- Separation of concerns (validation logic separate from controller)
- Testable in isolation
- Reusable across controllers/services

---

### Phase 3: Frontend Entity & Type Updates

#### 3.1 Update CartProduct Class

**File**: `client/app/_classes/Product.ts`

**Changes**: Add pricing fields to `CartProduct` class

**Code**:
```typescript
export class CartProduct {
	/** Full product object (populated from API) */
	product: IProduct | null = null
	
	/** Quantity of this product in cart */
	quantity: number = 0
	
	/** Product ID (for lightweight cart storage) */
	productId: string | null = null

	/**
	 * Vendor cost (agreed price with vendor).
	 * Set by sales rep after vendor negotiation.
	 * @see business_flow.md Section 4 - Vendor Pricing Request
	 */
	vendorCost?: number | null

	/**
	 * Customer price (selling price to customer).
	 * Must be >= vendorCost when both are set.
	 * Set by sales rep before submitting quote to customer.
	 * @see business_flow.md Section 4 - Pricing Strategy & Negotiation
	 */
	customerPrice?: number | null

	// ... existing constructor ...
}
```

**Rationale**: 
- TypeScript types match backend entity
- JSDoc references business flow documentation
- Optional fields for backward compatibility

---

### Phase 4: Frontend Component Updates

#### 4.1 Create QuotePricingEditor Component

**File**: `client/app/app/quotes/[id]/_components/QuotePricingEditor.tsx` (new file)

**Purpose**: Editable pricing table component for sales reps to input vendor cost and customer price

**Pattern**: Follow `QuoteProducts.tsx` structure, but make it editable

**Features**:
- Editable vendor cost input (FormInput with type="number", step="0.01")
- Editable customer price input (FormInput with type="number", step="0.01")
- Real-time validation (customer price >= vendor cost)
- Shows calculated line total (customer price × quantity)
- Shows calculated margin (customer price - vendor cost) and margin %
- Disabled state when user cannot edit (customers, non-assigned sales reps)
- Inline error messages for validation

**Component Structure**:
```typescript
interface QuotePricingEditorProps extends QuoteComponentProps {
	/** Callback when pricing changes */
	onPricingChange?: (productId: string, vendorCost: number | null, customerPrice: number | null) => void
	/** Whether pricing fields are editable */
	editable?: boolean
}

export default function QuotePricingEditor({ 
	quote, 
	onPricingChange, 
	editable = true 
}: QuotePricingEditorProps) {
	// State for pricing edits (optimistic updates)
	// Use React Hook Form for validation
	// Display products in editable table
	// Calculate totals and margins
}
```

**UI/UX Considerations**:
- Use existing `FormInput` component (reuse from `@_components/forms/FormInput`)
- Use existing `Card` component (reuse from `@_components/ui/Card`)
- Show currency formatting ($X,XXX.XX)
- Highlight rows with validation errors
- Show helpful tooltips ("Customer price must be >= vendor cost")
- Show margin calculation (green for positive margin, red for negative)

**Reused Components**:
- `FormInput` - For number inputs (from `@_components/forms/FormInput.tsx`)
- `Card` - Container (from `@_components/ui/Card.tsx`)
- `DataGrid` - Table layout (from `@_components/tables/DataGrid.tsx` if editable table needed, or custom table)

**Rationale**: 
- New component for separation of concerns (pricing logic separate from display)
- Reuses existing UI components (DRY)
- Follows existing component patterns in codebase

#### 4.2 Update QuoteProducts Component

**File**: `client/app/app/quotes/[id]/_components/QuoteProducts.tsx`

**Changes**: 
- Add conditional rendering: show `QuotePricingEditor` for sales reps, `QuoteProducts` (read-only) for customers
- Or: Make `QuoteProducts` accept `editable` prop and conditionally render pricing inputs

**Decision**: Create separate `QuotePricingEditor` component for clarity, keep `QuoteProducts` read-only for customers

**Rationale**: 
- Separation of concerns (editing vs viewing)
- Clearer component responsibilities
- Easier to test and maintain

#### 4.3 Update Quote Details Page

**File**: `client/app/app/quotes/[id]/page.tsx`

**Changes**: 
- Import `QuotePricingEditor` component
- Conditionally render based on permissions
- Pass `onPricingChange` callback to handle updates

**Code Structure**:
```typescript
// In page component
{permissions.canUpdate && quote.status === QuoteStatus.Read && (
	<QuotePricingEditor 
		quote={quote} 
		onPricingChange={handlePricingChange}
		editable={permissions.canUpdate}
	/>
)}
{!permissions.canUpdate && (
	<QuoteProducts quote={quote} />
)}
```

**Rationale**: 
- Permission-based rendering (already established pattern)
- Only show pricing editor when quote is in "Read" status (before approval)

#### 4.4 Create useQuotePricing Hook

**File**: `client/app/app/quotes/[id]/_components/hooks/useQuotePricing.ts` (new file)

**Purpose**: Custom hook for managing quote pricing updates (DRY pattern)

**Features**:
- Handle pricing changes for individual products
- Validate pricing rules (customer price >= vendor cost)
- Update quote via API using `useFormSubmit`
- Optimistic updates for better UX
- Error handling and rollback on failure

**Pattern**: Follow `useQuoteActions` pattern (uses `useFormSubmit`)

**Code Structure**:
```typescript
export function useQuotePricing(
	quote: Quote | null,
	onRefresh?: () => Promise<void>
) {
	const { submit, isSubmitting } = useFormSubmit(
		async (updatedProducts: CartProduct[]) => {
			if (!quote?.id) throw new Error('Quote ID required')
			
			// Validate pricing rules
			// Update quote with new product pricing
			// Call API.Quotes.update
		},
		{
			successMessage: 'Pricing updated successfully',
			errorMessage: 'Failed to update pricing',
			onSuccess: onRefresh,
		}
	)

	return {
		updatePricing: submit,
		isUpdating: isSubmitting,
	}
}
```

**Rationale**: 
- DRY: Reuses `useFormSubmit` for API calls
- Separation: Pricing logic separate from component
- Testable: Can test hook independently
- Follows existing hook patterns in codebase

---

### Phase 5: Validation & Business Rules

#### 5.1 Frontend Validation Schema

**File**: `client/app/app/quotes/[id]/_components/validation/quotePricingSchema.ts` (new file)

**Purpose**: Zod schema for pricing validation

**Code**:
```typescript
import { z } from 'zod'

export const quotePricingItemSchema = z.object({
	productId: z.string().min(1),
	vendorCost: z.number().nonnegative().nullable().optional(),
	customerPrice: z.number().nonnegative().nullable().optional(),
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
		path: ['customerPrice'], // Error shown on customerPrice field
	}
)

export const quotePricingSchema = z.object({
	products: z.array(quotePricingItemSchema).min(1),
})
```

**Usage**: In `QuotePricingEditor`, use React Hook Form with this schema

**Rationale**: 
- Client-side validation for immediate feedback
- Type-safe with Zod
- Clear error messages

#### 5.2 Business Rule: Require Pricing Before Submission

**File**: `client/app/app/quotes/[id]/_components/QuoteActions.tsx`

**Changes**: Update "Send to Customer" button validation

**Validation Logic**:
```typescript
// Check if all products have customer price set
const canSendToCustomer = quote?.products?.every(
	(p) => p.customerPrice != null && p.customerPrice > 0
) ?? false

// Disable button if pricing incomplete
<Button
	disabled={isProcessing || !canSendToCustomer}
	onClick={handleSendToCustomer}
>
	Send Quote to Customer
</Button>

// Show helpful message if pricing incomplete
{!canSendToCustomer && (
	<p className="text-sm text-warning">
		Please set customer price for all products before sending quote
	</p>
)}
```

**Rationale**: 
- Prevents sending incomplete quotes
- Clear user feedback
- Business rule enforcement at UI layer

---

### Phase 6: API Integration

#### 6.1 Update Quote Update Flow

**File**: `client/app/app/quotes/[id]/_components/hooks/useQuotePricing.ts`

**Implementation**: 
- When pricing changes, create updated Quote object
- Include all products with updated pricing
- Call `API.Quotes.update<Quote>(updatedQuote)`
- Use existing API endpoint (no backend changes needed)

**Code Pattern**:
```typescript
const updatedQuote = new Quote({
	...quote,
	products: quote.products.map(p => 
		p.productId === updatedProductId
			? { ...p, vendorCost, customerPrice }
			: p
	),
})

return API.Quotes.update<Quote>(updatedQuote)
```

**Rationale**: 
- Reuses existing API endpoint
- Follows existing update pattern (`useQuoteActions`)
- Type-safe with Quote class

---

### Phase 7: UI/UX Enhancements

#### 7.1 Currency Formatting Helper

**File**: `client/app/_lib/formatting/currency.ts` (new file, or add to existing formatting utilities)

**Purpose**: Format currency values consistently

**Code**:
```typescript
export function formatCurrency(value: number | null | undefined): string {
	if (value == null) return '—'
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value)
}
```

**Usage**: Throughout pricing components

**Rationale**: 
- Consistent currency formatting
- Handles null/undefined gracefully
- Reusable across app

#### 7.2 Margin Calculation Display

**File**: `client/app/app/quotes/[id]/_components/QuotePricingEditor.tsx`

**Features**:
- Show margin amount (customerPrice - vendorCost)
- Show margin percentage ((customerPrice - vendorCost) / vendorCost × 100)
- Color coding: green for positive, red for negative, gray for missing data

**Rationale**: 
- Helps sales reps make pricing decisions
- Visual feedback for margin analysis
- Industry standard in pricing tools

#### 7.3 Total Calculations

**File**: `client/app/app/quotes/[id]/_components/QuotePricingEditor.tsx`

**Features**:
- Line total = customerPrice × quantity
- Subtotal = sum of all line totals
- Display totals at bottom of table

**Rationale**: 
- Shows quote total to sales rep
- Helps with pricing decisions
- Standard in quote/order systems

---

### Phase 8: Testing Strategy

#### 8.1 Backend Unit Tests

**File**: `server/Tests/Helpers/QuoteValidationHelperTests.cs` (new file)

**Tests**:
- Valid pricing (customer price >= vendor cost)
- Invalid pricing (customer price < vendor cost)
- Null values (should pass validation)
- Edge cases (zero values, very large numbers)

#### 8.2 Frontend Component Tests

**File**: `client/app/app/quotes/[id]/_components/__tests__/QuotePricingEditor.test.tsx`

**Tests**:
- Renders pricing inputs
- Validates pricing rules
- Calls onPricingChange callback
- Displays error messages
- Handles disabled state

#### 8.3 Integration Tests

**File**: `client/app/app/quotes/[id]/__tests__/quote-pricing-flow.test.tsx`

**Tests**:
- Full flow: Input vendor cost → Input customer price → Submit
- API integration (mock API calls)
- Error handling (network errors, validation errors)
- Permission checks (sales rep can edit, customer cannot)

---

### Phase 9: Documentation Updates

#### 9.1 Update Business Flow Documentation

**File**: `client/md/business_flow.md`

**Changes**: Update Section 4 - INTERNAL PROCESSING to reflect new pricing workflow

#### 9.2 Code Comments & JSDoc

**Files**: All new/modified files

**Requirements**:
- JSDoc/XML comments on all public methods
- Inline comments for complex business logic
- References to business_flow.md where applicable

---

## Implementation Order

### Sprint 1: Backend Foundation (Days 1-2)
1. ✅ Create database migration
2. ✅ Update CartProduct entity (backend)
3. ✅ Add validation helper
4. ✅ Update QuotesController validation
5. ✅ Test backend changes

### Sprint 2: Frontend Foundation (Days 3-4)
1. ✅ Update CartProduct class (frontend)
2. ✅ Create quotePricingSchema validation
3. ✅ Create currency formatting helper
4. ✅ Create useQuotePricing hook
5. ✅ Test frontend types and hooks

### Sprint 3: UI Components (Days 5-6)
1. ✅ Create QuotePricingEditor component
2. ✅ Update QuoteDetailsPage to use editor
3. ✅ Add margin/total calculations
4. ✅ Add validation UI feedback
5. ✅ Test component rendering and interactions

### Sprint 4: Integration & Polish (Days 7-8)
1. ✅ Integrate with existing quote actions
2. ✅ Add "Send to Customer" validation
3. ✅ Add loading states and error handling
4. ✅ Polish UI/UX (tooltips, formatting, etc.)
5. ✅ End-to-end testing

---

## Risk Mitigation

### Risk 1: Backward Compatibility
**Mitigation**: 
- Nullable fields in database (existing quotes work)
- Optional fields in TypeScript (existing code works)
- Frontend handles missing pricing gracefully

### Risk 2: Data Integrity
**Mitigation**: 
- Database check constraint (customer_price >= vendor_cost)
- Backend validation (server-side enforcement)
- Frontend validation (immediate user feedback)

### Risk 3: Performance (Large Quotes)
**Mitigation**: 
- Only load products when needed (already done)
- Optimistic updates for better UX
- Debounce rapid price changes (future enhancement)

---

## Success Criteria

✅ Sales rep can input vendor cost for each product  
✅ Sales rep can input customer price for each product  
✅ System validates customer price >= vendor cost  
✅ System prevents "Send to Customer" if pricing incomplete  
✅ Pricing data persists correctly  
✅ Customers see pricing in read-only view  
✅ All validation works (frontend + backend)  
✅ UI is intuitive and follows existing patterns  
✅ Code follows DRY principles and separation of concerns  
✅ Full test coverage for critical paths  

---

## Future Enhancements (Out of Scope)

- Bulk pricing tools (set margin % for all products)
- Pricing templates (default margins by category)
- Pricing history/audit trail
- Automated margin suggestions based on product category
- Export pricing to Excel/PDF
- Vendor cost history tracking

---

## References

- **Business Flow**: `client/md/business_flow.md` Section 4 - INTERNAL PROCESSING
- **Existing Pattern**: `server/Classes/OrderItem.cs` (BuyPrice/SellPrice pattern)
- **Existing Components**: `client/app/_components/forms/FormInput.tsx`
- **Existing Hooks**: `client/app/app/quotes/[id]/_components/hooks/useQuoteActions.ts`
- **Existing API**: `client/app/_shared/services/api.ts` (API.Quotes.update)

