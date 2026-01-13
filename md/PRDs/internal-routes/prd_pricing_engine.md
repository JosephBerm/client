# Advanced Pricing Engine PRD

## 1. Overview

-   **Feature**: Advanced B2B Pricing Engine (Price Lists, Volume Tiers, Contract Pricing, Margin Protection)
-   **Priority**: P0 (B2B Essential - Business Plan Phase 1)
-   **Status**: Not Started
-   **Dependencies**: Product Management (Complete), Customer Management (Complete), RBAC System (Complete)
-   **Estimated Effort**: 120-160 hours (4-5 weeks)
-   **Business Plan Reference**: Section 4.4, Appendix A ("Advanced Pricing Engine | HIGH | 120h | $18,000")

---

## 2. Business Context

**From Business Plan Section 4.4:**

> "Advanced Pricing (tiered, contract) - **HIGH** - B2B essential - 160-220 hours"

**From ERP & Pricing Research Document:**

For MedSource Pro (medical supply distribution), advanced pricing is essential because:

-   **Contract Pricing**: Hospital systems negotiate annual contracts with fixed pricing
-   **Volume Discounts**: Large orders get better pricing (quantity breaks)
-   **Customer-Specific**: Each customer may have unique negotiated pricing
-   **Time-Based**: Promotions, seasonal pricing, contract validity periods
-   **Margin Protection**: Ensure minimum margins are maintained to prevent unprofitable deals

**Competitive Context:**
| Competitor | Pricing Capability | Our Advantage |
|------------|-------------------|---------------|
| OroCommerce | Complex rule engine, steep learning curve | Simpler, faster setup |
| BigCommerce B2B | Limited B2B pricing, add-on dependent | Native, purpose-built |
| Generic CPQ | Overkill for SMB distributors | Right-sized for target market |

**B2B Trust Factor:**
B2B buyers frequently ask "Why is this the price?" - especially for negotiated contracts. Our pricing engine provides **full explainability** with audit trails showing exactly which rules were applied.

---

## 2.1 MAANG-Level Design Principles (Guardrails)

These constraints are **mandatory** to ensure the pricing engine is scalable, reliable, secure, and not over-engineered.

### Determinism (Consistency)

-   Pricing must be **pure/deterministic**: same inputs → same output.
-   No time-dependent behavior unless an explicit `PriceDate` is provided.
-   All calculations use **decimal** (not float/double).
-   Rounding is **explicit and centralized** (see Technical Architecture).

### Separation of Concerns (Don’t Build a CPQ Monster)

-   **V1 is not a general-purpose rules engine.** We implement a small, composable, testable “waterfall”:
    -   Base price → Contract price list → Volume tier → (Optional) Promotion list → Margin protection
-   No expression DSL, no recursive rule graphs, no arbitrary scripting.
-   Extensibility is achieved by **adding new waterfall steps** (code + tests), not by adding a fragile runtime rule language.

### Reliability + Security (Never Lose Money, Never Leak Sensitive Data)

-   Margin protection is enforced server-side; client cannot bypass it.
-   Vendor cost and margin data are **never returned** to Customer role (response shaping).
-   Customer-supplied `CustomerId` is **never trusted** (anti-horizontal-escalation).

### Performance (Predictable, Fast, Batching-First)

-   The pricing API supports **bulk pricing** to avoid N+1 calls for product lists/carts.
-   The pricing service uses **batch DB queries** (single round-trip per request where possible).
-   Avoid DB writes on read-path pricing calls (no “audit log per browse”).

### Scalability (High Cardinality Pricing)

-   Data model must support:
    -   100K+ products per tenant
    -   10K+ customers per tenant
    -   1M+ price list items per tenant (worst-case contract catalogs)
-   Indexes and uniqueness constraints are required (see Database section).

### Explicit Non-Goals (Avoid Over-Engineering)

-   Multi-currency is out of scope (single currency per tenant for v1).
-   Unit-of-measure conversions are out of scope (assumes product prices are per default unit).
-   Complex promotion stacking/coupon engines are out of scope (can be added later as a new waterfall step).

---

## 3. Role-Based Requirements

### Customer View

**Can:**

-   See their final calculated prices on products
-   See their assigned contract/price list name
-   View volume discount tiers available to them
-   See price breakdown on quotes/orders

**Cannot:**

-   See vendor cost
-   See margin calculations
-   Manage price lists
-   See other customers' pricing

**UI Elements:**

-   Product cards show customer's price (not base price)
-   Quote/Order line items show "Your Price" with optional discount badge
-   Volume tier table visible on product detail page

---

### Sales Rep View

**Can:**

-   View customer prices (calculated)
-   See which price list/rules applied
-   See effective margin percentage
-   View price breakdown in quotes
-   See margin protection warnings

**Cannot:**

-   Create/edit price lists
-   Modify volume tiers
-   See tenant-wide pricing configuration
-   Override margin protection

**UI Elements:**

-   Quote editor shows: Base Price → Your Price → Margin %
-   Margin indicator (green/yellow/red based on threshold)
-   "Price List Applied" badge on line items

---

### Sales Manager View

**Can:**

-   All Sales Rep capabilities
-   View all price lists and their assignments
-   See pricing analytics (average margins, discounts given)
-   Override pricing on individual quotes (with audit)
-   Assign customers to price lists

**Cannot:**

-   Create/delete price lists (Admin only)
-   Modify global pricing rules
-   Disable margin protection

---

### Admin View

**Can:**

-   Full pricing management:
    -   Create/Edit/Delete price lists
    -   Configure volume pricing tiers
    -   Set margin protection thresholds
    -   Assign price lists to customers
-   View pricing audit logs
-   Configure global pricing settings
-   Export pricing data

**UI Elements:**

-   Pricing Dashboard in Admin section
-   Price List Management CRUD
-   Volume Tier Configuration
-   Customer Assignment Matrix
-   Audit Log Viewer

---

## 4. User Stories

### Epic 1: Price Calculation

**US-PRICE-001**: As a Customer, I want to see my negotiated contract price so I can verify my special pricing is applied.

-   **Priority**: P0
-   **Acceptance Criteria**:
    -   [ ] Given I have a contract price list assigned, when I view a product, then I see my contract price (not list price)
    -   [ ] Given I add items to cart, when I view cart totals, then prices reflect my contract
    -   [ ] Given I order 100 units with a volume tier, when calculated, then I get the best applicable price

**US-PRICE-002**: As a Sales Rep, I want to see the margin on each quote line item so I can ensure profitability.

-   **Priority**: P0
-   **Acceptance Criteria**:
    -   [ ] Given I view a quote, when I see line items, then each shows: Base Price, Customer Price, Margin %
    -   [ ] Given margin is below 10%, when displayed, then it shows a red warning indicator
    -   [ ] Given margin protection triggered, when viewing, then I see "(Margin Protected)" label

**US-PRICE-003**: As a system, I want to explain why a price was calculated so buyers trust the pricing.

-   **Priority**: P0
-   **Acceptance Criteria**:
    -   [ ] Given a price calculation with `IncludeBreakdown=true`, when returned, then it includes `appliedRules[]` array
    -   [ ] Given `IncludeBreakdown=false`, when returned, then `appliedRules[]` is empty (performance optimization)
    -   [ ] Each rule shows: type, name, price before, price after, explanation
    -   [ ] Given multiple rules applied, when viewing breakdown, then order matches waterfall sequence

---

### Epic 2: Price List Management

**US-PRICE-004**: As an Admin, I want to create named price lists so I can organize customer pricing strategies.

-   **Priority**: P0
-   **Acceptance Criteria**:
    -   [ ] Given I create a price list, when saved, then it has: name, description, priority, validity dates
    -   [ ] Given I set priority=10, when multiple lists apply, then lower priority wins (first match)
    -   [ ] Given I set validity dates, when outside range, then price list is not applied

**US-PRICE-005**: As an Admin, I want to add products to a price list with various pricing methods.

-   **Priority**: P0
-   **Acceptance Criteria**:
    -   [ ] Given I add a product, when configuring, then I can set: Fixed Price OR Percent Discount OR Fixed Discount
    -   [ ] Given I set Fixed Price=$85, when calculated, then customer pays exactly $85
    -   [ ] Given I set 15% discount, when calculated, then customer pays BasePrice × 0.85

**US-PRICE-006**: As an Admin, I want to assign price lists to customers so they receive their negotiated pricing.

-   **Priority**: P0
-   **Acceptance Criteria**:
    -   [ ] Given I assign Price List A to Customer 123, when customer views products, then they see Price List A prices
    -   [ ] Given customer has multiple price lists, when calculating, then lowest-priority-number list wins
    -   [ ] Given I remove assignment, when customer views products, then they see base prices

---

### Epic 3: Volume Pricing

**US-PRICE-007**: As an Admin, I want to configure volume/quantity pricing tiers so high-volume buyers get discounts.

-   **Priority**: P0
-   **Acceptance Criteria**:
    -   [ ] Given I create tiers: 1-9 units = $100, 10-49 = $90, 50+ = $80, when customer orders 25, then price is $90
    -   [ ] Given multiple tiers exist, when quantity changes, then price recalculates immediately
    -   [ ] Given both contract price and volume tier apply, when calculated, then customer gets the LOWER price

**US-PRICE-008**: As a Customer, I want to see volume pricing tiers so I know how much I'll save at higher quantities.

-   **Priority**: P1
-   **Acceptance Criteria**:
    -   [ ] Given product has volume tiers, when I view product detail, then I see tier table
    -   [ ] Given I change quantity, when viewing price, then active tier is highlighted
    -   [ ] Given I'm close to next tier, when viewing, then I see "Order 5 more for $X savings"

---

### Epic 4: Margin Protection

**US-PRICE-009**: As an Admin, I want to set minimum margin thresholds so we never sell at a loss.

-   **Priority**: P0
-   **Acceptance Criteria**:
    -   [ ] Given global minimum margin is 10%, when calculated price would be 8% margin, then price is adjusted to 10%
    -   [ ] Given margin protection triggers, when returned, then result includes `marginProtected: true`
    -   [ ] Given product has no cost, when calculating, then margin protection is skipped

**US-PRICE-010**: As a Sales Manager, I want to see when margin protection was applied so I can review pricing.

-   **Priority**: P1
-   **Acceptance Criteria**:
    -   [ ] Given margin protection was applied, when viewing quote, then line item shows warning badge
    -   [ ] Given I click the badge, when expanded, then I see original calculated price vs protected price
    -   [ ] Given audit log, when filtering, then I can see all margin-protected transactions

---

## 5. Technical Architecture

### 5.1 Backend

#### Database Entities

**Migration**: `YYYYMMDDHHMMSS_AddAdvancedPricing.cs`

**File**: `server/Entities/Pricing/PriceList.cs`

```csharp
[Table("PriceLists")]
public class PriceList : ITenantEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Required, MaxLength(100)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column("description")]
    public string? Description { get; set; }

    [Column("priority")]
    public int Priority { get; set; } = 100; // Lower = higher priority

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("valid_from")]
    public DateTime? ValidFrom { get; set; }

    [Column("valid_until")]
    public DateTime? ValidUntil { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("modified_at")]
    public DateTime? ModifiedAt { get; set; }

    [Column("created_by")]
    public string? CreatedBy { get; set; }

    // Navigation
    public virtual ICollection<PriceListItem> Items { get; set; } = new List<PriceListItem>();
    public virtual ICollection<CustomerPriceList> CustomerAssignments { get; set; } = new List<CustomerPriceList>();
}
```

**File**: `server/Entities/Pricing/PriceListItem.cs`

```csharp
[Table("PriceListItems")]
public class PriceListItem : ITenantEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Required]
    [Column("price_list_id")]
    public Guid PriceListId { get; set; }

    [ForeignKey("PriceListId")]
    public virtual PriceList? PriceList { get; set; }

    [Required]
    [Column("product_id")]
    public Guid ProductId { get; set; }

    [ForeignKey("ProductId")]
    public virtual Product? Product { get; set; }

    // Pricing methods (only one should be set)
    [Column("fixed_price", TypeName = "decimal(18,2)")]
    public decimal? FixedPrice { get; set; }

    [Column("percent_discount", TypeName = "decimal(5,2)")]
    public decimal? PercentDiscount { get; set; }

    [Column("fixed_discount", TypeName = "decimal(18,2)")]
    public decimal? FixedDiscount { get; set; }

    // Minimum margin protection override
    [Column("minimum_margin_percent", TypeName = "decimal(5,2)")]
    public decimal? MinimumMarginPercent { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

**File**: `server/Entities/Pricing/CustomerPriceList.cs`

```csharp
[Table("CustomerPriceLists")]
public class CustomerPriceList : ITenantEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Required]
    [Column("customer_id")]
    public int CustomerId { get; set; }

    [ForeignKey("CustomerId")]
    public virtual Customer? Customer { get; set; }

    [Required]
    [Column("price_list_id")]
    public Guid PriceListId { get; set; }

    [ForeignKey("PriceListId")]
    public virtual PriceList? PriceList { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("assigned_by")]
    public string? AssignedBy { get; set; }
}
```

**File**: `server/Entities/Pricing/VolumePricingTier.cs`

```csharp
[Table("VolumePricingTiers")]
public class VolumePricingTier : ITenantEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Required]
    [Column("product_id")]
    public Guid ProductId { get; set; }

    [ForeignKey("ProductId")]
    public virtual Product? Product { get; set; }

    [Column("min_quantity")]
    public int MinQuantity { get; set; }

    [Column("max_quantity")]
    public int? MaxQuantity { get; set; } // null = unlimited

    // Pricing (one of these)
    [Column("unit_price", TypeName = "decimal(18,2)")]
    public decimal? UnitPrice { get; set; }

    [Column("percent_discount", TypeName = "decimal(5,2)")]
    public decimal? PercentDiscount { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

**File**: `server/Entities/Pricing/PricingAuditLog.cs`

```csharp
[Table("PricingAuditLogs")]
public class PricingAuditLog : ITenantEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Column("product_id")]
    public Guid ProductId { get; set; }

    [Column("customer_id")]
    public int? CustomerId { get; set; }

    [Column("quantity")]
    public int Quantity { get; set; }

    [Column("base_price", TypeName = "decimal(18,2)")]
    public decimal BasePrice { get; set; }

    [Column("final_price", TypeName = "decimal(18,2)")]
    public decimal FinalPrice { get; set; }

    [Column("applied_rules_json")]
    public string AppliedRulesJson { get; set; } = "[]";

    [Column("quote_id")]
    public Guid? QuoteId { get; set; }

    [Column("order_id")]
    public int? OrderId { get; set; }

    [Column("requested_by")]
    public string? RequestedBy { get; set; }

    [Column("calculated_at")]
    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
}
```

---

#### Constraints + Indexes (Scalability + Data Integrity)

These are required to keep pricing fast and correct at scale.

**Migration additions (pseudo-code)**:

```csharp
// Unique: one PriceListItem per (TenantId, PriceListId, ProductId)
migrationBuilder.CreateIndex(
    name: "IX_PriceListItems_Tenant_PriceList_Product",
    table: "PriceListItems",
    columns: new[] { "tenant_id", "price_list_id", "product_id" },
    unique: true);

// Fast: customer price list lookups
migrationBuilder.CreateIndex(
    name: "IX_CustomerPriceLists_Tenant_Customer",
    table: "CustomerPriceLists",
    columns: new[] { "tenant_id", "customer_id" });

// Unique: prevent duplicate assignment rows
migrationBuilder.CreateIndex(
    name: "IX_CustomerPriceLists_Tenant_Customer_PriceList",
    table: "CustomerPriceLists",
    columns: new[] { "tenant_id", "customer_id", "price_list_id" },
    unique: true);

// Fast: volume tier lookup for a product + quantity (min_quantity ordering)
migrationBuilder.CreateIndex(
    name: "IX_VolumePricingTiers_Tenant_Product_MinQty",
    table: "VolumePricingTiers",
    columns: new[] { "tenant_id", "product_id", "min_quantity" });
```

**Defensive DB checks (optional but recommended)**:

-   Check constraint: exactly one of `fixed_price`, `percent_discount`, `fixed_discount` is non-null on `PriceListItems`.
-   Check constraint: exactly one of `unit_price`, `percent_discount` is non-null on `VolumePricingTiers`.

We will also enforce these in application validation to provide user-friendly errors.

---

#### DTOs

**File**: `server/Classes/DTOs/Pricing/PricingDTOs.cs`

```csharp
// === Request DTOs ===

public class PricingRequest
{
    public Guid ProductId { get; set; }
    /// <summary>
    /// SECURITY NOTE:
    /// - Customer role: this value is ignored; server resolves customer from auth context.
    /// - Staff roles: server validates the customer is within tenant + permitted scope.
    /// </summary>
    public int? CustomerId { get; set; }
    public int Quantity { get; set; } = 1;
    public DateTime? PriceDate { get; set; }
    /// <summary>
    /// Performance control:
    /// - Default false for product browsing and carts.
    /// - True for quote/order pricing review screens where explainability is required.
    /// </summary>
    public bool IncludeBreakdown { get; set; } = false;
}

public class BulkPricingRequest
{
    public List<PricingRequest> Items { get; set; } = new();
}

public class CreatePriceListRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public int Priority { get; set; } = 100;
    public bool IsActive { get; set; } = true;
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
}

public class UpdatePriceListRequest
{
    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public int? Priority { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
}

public class AddPriceListItemRequest
{
    [Required]
    public Guid ProductId { get; set; }

    public decimal? FixedPrice { get; set; }
    public decimal? PercentDiscount { get; set; }
    public decimal? FixedDiscount { get; set; }
    public decimal? MinimumMarginPercent { get; set; }
}

public class AssignPriceListRequest
{
    [Required]
    public Guid PriceListId { get; set; }
}

public class SetVolumeTiersRequest
{
    public List<VolumeTierInput> Tiers { get; set; } = new();
}

public class VolumeTierInput
{
    public int MinQuantity { get; set; }
    public int? MaxQuantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? PercentDiscount { get; set; }
}

// === Response DTOs ===

public class PricingResult
{
    public Guid ProductId { get; set; }
    public decimal BasePrice { get; set; }
    public decimal FinalPrice { get; set; }
    public decimal TotalDiscount { get; set; }
    /// <summary>
    /// SECURITY NOTE:
    /// - Customer role: MUST be null/omitted.
    /// - Staff roles: populated.
    /// </summary>
    public decimal? EffectiveMarginPercent { get; set; }
    public bool MarginProtected { get; set; }
    /// <summary>
    /// Explainability payload. If IncludeBreakdown=false, this should be empty.
    /// Customer view must be sanitized (no cost/margin internals).
    /// </summary>
    public List<PricingRuleApplication> AppliedRules { get; set; } = new();
}

public class PricingRuleApplication
{
    public int Order { get; set; }
    public string RuleType { get; set; } = string.Empty;  // "BasePrice", "ContractPrice", "VolumeTier", "MarginProtection"
    public string RuleName { get; set; } = string.Empty;
    public decimal PriceBefore { get; set; }
    public decimal PriceAfter { get; set; }
    public decimal Adjustment { get; set; }
    public string Explanation { get; set; } = string.Empty;
}

public class PriceListResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Priority { get; set; }
    public bool IsActive { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
    public int ItemCount { get; set; }
    public int CustomerCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PriceListDetailResponse : PriceListResponse
{
    public List<PriceListItemResponse> Items { get; set; } = new();
    public List<CustomerAssignmentResponse> Customers { get; set; } = new();
}

public class PriceListItemResponse
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSku { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public decimal? FixedPrice { get; set; }
    public decimal? PercentDiscount { get; set; }
    public decimal? FixedDiscount { get; set; }
    public decimal CalculatedPrice { get; set; }  // For display
}

public class CustomerAssignmentResponse
{
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
}

public class VolumeTierResponse
{
    public Guid Id { get; set; }
    public int MinQuantity { get; set; }
    public int? MaxQuantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? PercentDiscount { get; set; }
    public decimal CalculatedPrice { get; set; }  // Based on base price
}
```

---

#### Service Interface

**File**: `server/Services/Pricing/IPricingService.cs`

```csharp
public interface IPricingService
{
    // === Price Calculation ===
    Task<PricingResult> CalculatePriceAsync(PricingRequest request);
    Task<List<PricingResult>> CalculatePricesAsync(BulkPricingRequest request);

    // === Price List Management ===
    Task<PagedResult<PriceListResponse>> GetPriceListsAsync(PaginationParams pagination);
    Task<PriceListDetailResponse?> GetPriceListAsync(Guid priceListId);
    Task<PriceListResponse> CreatePriceListAsync(CreatePriceListRequest request, string userId);
    Task<PriceListResponse> UpdatePriceListAsync(Guid priceListId, UpdatePriceListRequest request);
    Task<bool> DeletePriceListAsync(Guid priceListId);

    // === Price List Items ===
    Task<PriceListItemResponse> AddPriceListItemAsync(Guid priceListId, AddPriceListItemRequest request);
    Task<PriceListItemResponse> UpdatePriceListItemAsync(Guid itemId, AddPriceListItemRequest request);
    Task<bool> RemovePriceListItemAsync(Guid itemId);

    // === Customer Assignments ===
    Task<List<PriceListResponse>> GetCustomerPriceListsAsync(int customerId);
    Task AssignCustomerToPriceListAsync(int customerId, AssignPriceListRequest request, string userId);
    Task RemoveCustomerFromPriceListAsync(int customerId, Guid priceListId);

    // === Volume Pricing ===
    Task<List<VolumeTierResponse>> GetVolumeTiersAsync(Guid productId);
    Task<List<VolumeTierResponse>> SetVolumeTiersAsync(Guid productId, SetVolumeTiersRequest request);
    Task<bool> ClearVolumeTiersAsync(Guid productId);
}
```

---

#### PricingService Algorithm (Deterministic Waterfall)

**Goal:** Maximize correctness + explainability with minimal complexity.

**Waterfall (v1):**

1. **Base Price**: `Product.Price`
2. **Contract Price List** (if customer provided/resolved):
    - Find active price lists assigned to customer, ordered by `Priority` asc (lower wins)
    - First price list with a matching `PriceListItem` for the product applies
3. **Volume Tier**:
    - Find tier with `MinQuantity <= qty` and (`MaxQuantity` is null OR `qty <= MaxQuantity`)
    - Choose tier with highest `MinQuantity` (best match)
    - Apply tier price and keep the **lower** of (contract result, volume result)
4. **Margin Protection**:
    - Compute effective margin against `Product.Cost` (if available)
    - If below minimum, raise price to the minimum required

**Explicit v1 behavior (avoid ambiguity):**

-   If multiple customer price lists could apply, **priority wins, first match wins** (no stacking).
-   Volume tier does not stack a discount on top of a contract discount; it competes and we choose the best price.
-   Applied rules are included only when `IncludeBreakdown=true`.

#### Money + Rounding (Correctness + Consistency)

To avoid inconsistent totals between API, UI, and exports:

-   Use `decimal` everywhere.
-   Round at the **unit price** level to 2 decimals using a single policy:
    -   `MidpointRounding.AwayFromZero` (typical currency behavior)
-   Total line price = `RoundedUnitPrice * Quantity` (not “round at the end”).
-   Defensive guards:
    -   Reject `Quantity <= 0`.
    -   Never allow negative final prices (if discounts misconfigured, clamp to 0 and emit a warning log + audit entry for admin review).

#### Volume Tier Validation Rules (Robustness)

In `SetVolumeTiersAsync(productId, tiers)` the backend must validate:

-   No overlapping quantity ranges for the same product (data integrity).
-   No duplicate `MinQuantity`.
-   For each tier, exactly one of (`UnitPrice`, `PercentDiscount`) is set.
-   `MaxQuantity` must be null or >= `MinQuantity`.

This prevents ambiguous pricing results and simplifies the runtime pricing query.

#### Bulk Pricing Query Strategy (Performance)

`CalculatePricesAsync(BulkPricingRequest)` must avoid N+1 queries:

-   Fetch all requested `Products` in a single query.
-   Resolve the effective customer (ignore client `CustomerId` for customer role).
-   Fetch applicable `CustomerPriceLists` once (per customer).
-   Fetch `PriceListItems` for **all requested ProductIds** via `WHERE ProductId IN (...) AND PriceListId IN (...)` (single query).
-   Fetch `VolumePricingTiers` for **all requested ProductIds** (single query) and evaluate tiers in memory.

This design scales for carts and product lists without over-engineering.

---

#### Controller Endpoints

**File**: `server/Controllers/PricingController.cs`

```csharp
[ApiController]
[Route("api/pricing")]
public class PricingController : BaseController
{
    private readonly IPricingService _pricingService;

    // === Price Calculation ===

    [HttpPost("calculate")]
    [Authorize]
    public async Task<IResponse<PricingResult>> CalculatePrice([FromBody] PricingRequest request);

    [HttpPost("calculate/bulk")]
    [Authorize]
    public async Task<IResponse<List<PricingResult>>> CalculatePrices([FromBody] BulkPricingRequest request);

    // === Price List Management (Admin) ===

    [HttpGet("price-lists")]
    [Authorize(Policy = RBACConstants.Policies.PricingView)]
    public async Task<IResponse<PagedResult<PriceListResponse>>> GetPriceLists([FromQuery] PaginationParams pagination);

    [HttpGet("price-lists/{id:guid}")]
    [Authorize(Policy = RBACConstants.Policies.PricingView)]
    public async Task<IResponse<PriceListDetailResponse>> GetPriceList(Guid id);

    [HttpPost("price-lists")]
    [Authorize(Policy = RBACConstants.Policies.PricingManage)]
    public async Task<IResponse<PriceListResponse>> CreatePriceList([FromBody] CreatePriceListRequest request);

    [HttpPut("price-lists/{id:guid}")]
    [Authorize(Policy = RBACConstants.Policies.PricingManage)]
    public async Task<IResponse<PriceListResponse>> UpdatePriceList(Guid id, [FromBody] UpdatePriceListRequest request);

    [HttpDelete("price-lists/{id:guid}")]
    [Authorize(Policy = RBACConstants.Policies.PricingManage)]
    public async Task<IResponse<bool>> DeletePriceList(Guid id);

    // === Price List Items ===

    [HttpPost("price-lists/{id:guid}/items")]
    [Authorize(Policy = RBACConstants.Policies.PricingManage)]
    public async Task<IResponse<PriceListItemResponse>> AddPriceListItem(Guid id, [FromBody] AddPriceListItemRequest request);

    [HttpPut("price-lists/items/{itemId:guid}")]
    [Authorize(Policy = RBACConstants.Policies.PricingManage)]
    public async Task<IResponse<PriceListItemResponse>> UpdatePriceListItem(Guid itemId, [FromBody] AddPriceListItemRequest request);

    [HttpDelete("price-lists/items/{itemId:guid}")]
    [Authorize(Policy = RBACConstants.Policies.PricingManage)]
    public async Task<IResponse<bool>> RemovePriceListItem(Guid itemId);

    // === Customer Assignments ===

    [HttpGet("customers/{customerId:int}/price-lists")]
    [Authorize(Policy = RBACConstants.Policies.CustomersView)]
    public async Task<IResponse<List<PriceListResponse>>> GetCustomerPriceLists(int customerId);

    [HttpPost("customers/{customerId:int}/price-lists")]
    [Authorize(Policy = RBACConstants.Policies.PricingManage)]
    public async Task<IResponse<bool>> AssignPriceList(int customerId, [FromBody] AssignPriceListRequest request);

    [HttpDelete("customers/{customerId:int}/price-lists/{priceListId:guid}")]
    [Authorize(Policy = RBACConstants.Policies.PricingManage)]
    public async Task<IResponse<bool>> RemovePriceListAssignment(int customerId, Guid priceListId);

    // === Volume Pricing ===

    [HttpGet("products/{productId:guid}/volume-tiers")]
    [Authorize]
    public async Task<IResponse<List<VolumeTierResponse>>> GetVolumeTiers(Guid productId);

    [HttpPost("products/{productId:guid}/volume-tiers")]
    [Authorize(Policy = RBACConstants.Policies.PricingManage)]
    public async Task<IResponse<List<VolumeTierResponse>>> SetVolumeTiers(Guid productId, [FromBody] SetVolumeTiersRequest request);

    [HttpDelete("products/{productId:guid}/volume-tiers")]
    [Authorize(Policy = RBACConstants.Policies.PricingManage)]
    public async Task<IResponse<bool>> ClearVolumeTiers(Guid productId);
}
```

---

#### Pricing Calculation Contract (Reliability + Consistency)

**Pricing is calculated once, then “locked” for downstream documents:**

-   When a **Quote** is generated/updated, store the computed unit price and applied rules snapshot on `QuoteItem`.
-   When an **Order** is created/placed, store the computed unit price and applied rules snapshot on `OrderItem`.
-   Never re-price historical quotes/orders unless an explicit “Recalculate” admin action is triggered (and audited).

This prevents “price drift” when price lists change after a quote is sent.

#### Audit Logging (Avoid Overhead)

To preserve performance and avoid unbounded data growth:

-   **DO write** `PricingAuditLog` for:
    -   Quote pricing finalization / quote approval
    -   Order creation / order placement
    -   Admin pricing configuration changes (create/update/delete price lists/items/tiers)
-   **DO NOT write** `PricingAuditLog` for:
    -   Product browsing price lookups (catalog pages)
    -   Cart quantity changes in UI

If needed for debugging, add a **feature-flagged** “diagnostic logging” mode for a single tenant and time window.

#### Response Shaping (Security)

`PricingResult` must be role-shaped at the API boundary:

-   Customer:
    -   receives `FinalPrice`, `BasePrice` (optional), `TotalDiscount` (optional), `AppliedRules` (sanitized, optional)
    -   does **not** receive cost/margin-derived fields (`EffectiveMarginPercent` must be null/omitted)
    -   `MarginProtected` should be omitted or forced false for customers (don’t leak pricing guardrails)
-   Staff:
    -   receives margin details

Applied rules shown to customers must never expose sensitive internals (e.g., cost, margin thresholds).

---

### 5.2 Frontend

#### Entity Classes

**File**: `client/app/_classes/Pricing.ts`

```typescript
export class PriceList {
	id: string
	name: string
	description: string | null
	priority: number
	isActive: boolean
	validFrom: Date | null
	validUntil: Date | null
	itemCount: number
	customerCount: number
	createdAt: Date
	items?: PriceListItem[]
	customers?: CustomerAssignment[]

	constructor(data?: Partial<PriceList>) {
		this.id = data?.id ?? ''
		this.name = data?.name ?? ''
		this.description = data?.description ?? null
		this.priority = data?.priority ?? 100
		this.isActive = data?.isActive ?? true
		this.validFrom = data?.validFrom ? new Date(data.validFrom) : null
		this.validUntil = data?.validUntil ? new Date(data.validUntil) : null
		this.itemCount = data?.itemCount ?? 0
		this.customerCount = data?.customerCount ?? 0
		this.createdAt = data?.createdAt ? new Date(data.createdAt) : new Date()
		this.items = data?.items
		this.customers = data?.customers
	}
}

export class PriceListItem {
	id: string
	productId: string
	productName: string
	productSku: string
	basePrice: number
	fixedPrice: number | null
	percentDiscount: number | null
	fixedDiscount: number | null
	calculatedPrice: number

	constructor(data?: Partial<PriceListItem>) {
		this.id = data?.id ?? ''
		this.productId = data?.productId ?? ''
		this.productName = data?.productName ?? ''
		this.productSku = data?.productSku ?? ''
		this.basePrice = data?.basePrice ?? 0
		this.fixedPrice = data?.fixedPrice ?? null
		this.percentDiscount = data?.percentDiscount ?? null
		this.fixedDiscount = data?.fixedDiscount ?? null
		this.calculatedPrice = data?.calculatedPrice ?? 0
	}
}

export class CustomerAssignment {
	customerId: number
	customerName: string
	assignedAt: Date

	constructor(data?: Partial<CustomerAssignment>) {
		this.customerId = data?.customerId ?? 0
		this.customerName = data?.customerName ?? ''
		this.assignedAt = data?.assignedAt ? new Date(data.assignedAt) : new Date()
	}
}

export class VolumeTier {
	id: string
	minQuantity: number
	maxQuantity: number | null
	unitPrice: number | null
	percentDiscount: number | null
	calculatedPrice: number

	constructor(data?: Partial<VolumeTier>) {
		this.id = data?.id ?? ''
		this.minQuantity = data?.minQuantity ?? 1
		this.maxQuantity = data?.maxQuantity ?? null
		this.unitPrice = data?.unitPrice ?? null
		this.percentDiscount = data?.percentDiscount ?? null
		this.calculatedPrice = data?.calculatedPrice ?? 0
	}
}

export class PricingResult {
	productId: string
	basePrice: number
	finalPrice: number
	totalDiscount: number
	effectiveMarginPercent: number | null
	marginProtected: boolean
	appliedRules: PricingRuleApplication[]

	constructor(data?: Partial<PricingResult>) {
		this.productId = data?.productId ?? ''
		this.basePrice = data?.basePrice ?? 0
		this.finalPrice = data?.finalPrice ?? 0
		this.totalDiscount = data?.totalDiscount ?? 0
		this.effectiveMarginPercent = data?.effectiveMarginPercent ?? null
		this.marginProtected = data?.marginProtected ?? false
		this.appliedRules = data?.appliedRules ?? []
	}
}

export class PricingRuleApplication {
	order: number
	ruleType: string
	ruleName: string
	priceBefore: number
	priceAfter: number
	adjustment: number
	explanation: string

	constructor(data?: Partial<PricingRuleApplication>) {
		this.order = data?.order ?? 0
		this.ruleType = data?.ruleType ?? ''
		this.ruleName = data?.ruleName ?? ''
		this.priceBefore = data?.priceBefore ?? 0
		this.priceAfter = data?.priceAfter ?? 0
		this.adjustment = data?.adjustment ?? 0
		this.explanation = data?.explanation ?? ''
	}
}
```

---

#### Validation Schemas

**File**: `client/app/_core/validation/validation-schemas.ts` (centralized)

```typescript
import { z } from 'zod'

// === Price List Schemas ===

export const createPriceListSchema = z
	.object({
		name: z.string().min(1, 'Name is required').max(100),
		description: z.string().max(500).optional().nullable(),
		priority: z.number().int().min(1).max(1000).default(100),
		isActive: z.boolean().default(true),
		validFrom: z.date().optional().nullable(),
		validUntil: z.date().optional().nullable(),
	})
	.refine(
		(data) => {
			if (data.validFrom && data.validUntil) {
				return data.validUntil > data.validFrom
			}
			return true
		},
		{ message: 'Valid until must be after valid from', path: ['validUntil'] }
	)

export type CreatePriceListFormData = z.infer<typeof createPriceListSchema>

export const updatePriceListSchema = createPriceListSchema.partial()

export type UpdatePriceListFormData = z.infer<typeof updatePriceListSchema>

// === Price List Item Schemas ===

export const priceListItemSchema = z
	.object({
		productId: z.string().uuid('Invalid product'),
		fixedPrice: z.number().min(0).optional().nullable(),
		percentDiscount: z.number().min(0).max(100).optional().nullable(),
		fixedDiscount: z.number().min(0).optional().nullable(),
		minimumMarginPercent: z.number().min(0).max(100).optional().nullable(),
	})
	.refine(
		(data) => {
			const priceTypes = [data.fixedPrice, data.percentDiscount, data.fixedDiscount].filter((v) => v != null)
			return priceTypes.length === 1
		},
		{ message: 'Exactly one pricing method must be specified', path: ['fixedPrice'] }
	)

export type PriceListItemFormData = z.infer<typeof priceListItemSchema>

// === Volume Tier Schemas ===

export const volumeTierSchema = z
	.object({
		minQuantity: z.number().int().min(1),
		maxQuantity: z.number().int().min(1).optional().nullable(),
		unitPrice: z.number().min(0).optional().nullable(),
		percentDiscount: z.number().min(0).max(100).optional().nullable(),
	})
	.refine(
		(data) => {
			const priceTypes = [data.unitPrice, data.percentDiscount].filter((v) => v != null)
			return priceTypes.length === 1
		},
		{ message: 'Exactly one pricing method must be specified', path: ['unitPrice'] }
	)
	.refine(
		(data) => {
			if (data.maxQuantity != null) {
				return data.maxQuantity >= data.minQuantity
			}
			return true
		},
		{ message: 'Max quantity must be >= min quantity', path: ['maxQuantity'] }
	)

export const setVolumeTiersSchema = z.object({
	tiers: z.array(volumeTierSchema).min(1, 'At least one tier required'),
})

export type SetVolumeTiersFormData = z.infer<typeof setVolumeTiersSchema>

// === Pricing Request Schemas ===

export const pricingRequestSchema = z.object({
	productId: z.string().uuid(),
	customerId: z.number().int().optional().nullable(),
	quantity: z.number().int().min(1).default(1),
	priceDate: z.date().optional().nullable(),
})

export type PricingRequestFormData = z.infer<typeof pricingRequestSchema>
```

---

#### API Integration

**File**: `client/app/_shared/services/api.ts` (additions)

```typescript
export const API = {
	// ... existing methods ...

	Pricing: {
		// Price Calculation
		calculate: (request: PricingRequest) => HttpService.post<PricingResult>('/api/pricing/calculate', request),

		calculateBulk: (items: PricingRequest[]) =>
			HttpService.post<PricingResult[]>('/api/pricing/calculate/bulk', { items }),

		// Price Lists
		getPriceLists: (params?: PaginationParams) =>
			HttpService.get<PagedResult<PriceListResponse>>('/api/pricing/price-lists', params),

		getPriceList: (id: string) => HttpService.get<PriceListDetailResponse>(`/api/pricing/price-lists/${id}`),

		createPriceList: (data: CreatePriceListRequest) =>
			HttpService.post<PriceListResponse>('/api/pricing/price-lists', data),

		updatePriceList: (id: string, data: UpdatePriceListRequest) =>
			HttpService.put<PriceListResponse>(`/api/pricing/price-lists/${id}`, data),

		deletePriceList: (id: string) => HttpService.delete<boolean>(`/api/pricing/price-lists/${id}`),

		// Price List Items
		addPriceListItem: (priceListId: string, data: AddPriceListItemRequest) =>
			HttpService.post<PriceListItemResponse>(`/api/pricing/price-lists/${priceListId}/items`, data),

		updatePriceListItem: (itemId: string, data: AddPriceListItemRequest) =>
			HttpService.put<PriceListItemResponse>(`/api/pricing/price-lists/items/${itemId}`, data),

		removePriceListItem: (itemId: string) =>
			HttpService.delete<boolean>(`/api/pricing/price-lists/items/${itemId}`),

		// Customer Assignments
		getCustomerPriceLists: (customerId: number) =>
			HttpService.get<PriceListResponse[]>(`/api/pricing/customers/${customerId}/price-lists`),

		assignCustomerToPriceList: (customerId: number, priceListId: string) =>
			HttpService.post<boolean>(`/api/pricing/customers/${customerId}/price-lists`, { priceListId }),

		removeCustomerFromPriceList: (customerId: number, priceListId: string) =>
			HttpService.delete<boolean>(`/api/pricing/customers/${customerId}/price-lists/${priceListId}`),

		// Volume Tiers
		getVolumeTiers: (productId: string) =>
			HttpService.get<VolumeTierResponse[]>(`/api/pricing/products/${productId}/volume-tiers`),

		setVolumeTiers: (productId: string, tiers: VolumeTierInput[]) =>
			HttpService.post<VolumeTierResponse[]>(`/api/pricing/products/${productId}/volume-tiers`, { tiers }),

		clearVolumeTiers: (productId: string) =>
			HttpService.delete<boolean>(`/api/pricing/products/${productId}/volume-tiers`),
	},
}
```

---

#### Custom Hooks

**File**: `client/app/app/pricing/_components/hooks/usePricing.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API } from '@_shared/services/api'

// Query Key Factory
export const pricingKeys = {
	all: ['pricing'] as const,
	priceLists: () => [...pricingKeys.all, 'price-lists'] as const,
	priceList: (id: string) => [...pricingKeys.priceLists(), id] as const,
	customerPriceLists: (customerId: number) => [...pricingKeys.all, 'customers', customerId, 'price-lists'] as const,
	volumeTiers: (productId: string) => [...pricingKeys.all, 'products', productId, 'volume-tiers'] as const,
	calculation: (productId: string, customerId?: number, qty?: number) =>
		[...pricingKeys.all, 'calculate', productId, customerId, qty] as const,
}

// === Price Calculation Hooks ===

export function useCalculatePrice(productId: string, customerId?: number, quantity: number = 1) {
	return useQuery({
		queryKey: pricingKeys.calculation(productId, customerId, quantity),
		queryFn: () => API.Pricing.calculate({ productId, customerId, quantity }),
		enabled: !!productId,
		staleTime: 5 * 60 * 1000, // 5 minute cache
	})
}

export function useCalculatePricesMutation() {
	return useMutation({
		mutationFn: (items: PricingRequest[]) => API.Pricing.calculateBulk(items),
	})
}

// === Price List Hooks ===

export function usePriceLists(params?: PaginationParams) {
	return useQuery({
		queryKey: [...pricingKeys.priceLists(), params],
		queryFn: () => API.Pricing.getPriceLists(params),
	})
}

export function usePriceList(id: string) {
	return useQuery({
		queryKey: pricingKeys.priceList(id),
		queryFn: () => API.Pricing.getPriceList(id),
		enabled: !!id,
	})
}

export function useCreatePriceList() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: CreatePriceListRequest) => API.Pricing.createPriceList(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceLists() })
		},
	})
}

export function useUpdatePriceList() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdatePriceListRequest }) =>
			API.Pricing.updatePriceList(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceList(id) })
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceLists() })
		},
	})
}

export function useDeletePriceList() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => API.Pricing.deletePriceList(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceLists() })
		},
	})
}

// === Volume Tier Hooks ===

export function useVolumeTiers(productId: string) {
	return useQuery({
		queryKey: pricingKeys.volumeTiers(productId),
		queryFn: () => API.Pricing.getVolumeTiers(productId),
		enabled: !!productId,
	})
}

export function useSetVolumeTiers() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ productId, tiers }: { productId: string; tiers: VolumeTierInput[] }) =>
			API.Pricing.setVolumeTiers(productId, tiers),
		onSuccess: (_, { productId }) => {
			queryClient.invalidateQueries({ queryKey: pricingKeys.volumeTiers(productId) })
		},
	})
}

// === Customer Assignment Hooks ===

export function useCustomerPriceLists(customerId: number) {
	return useQuery({
		queryKey: pricingKeys.customerPriceLists(customerId),
		queryFn: () => API.Pricing.getCustomerPriceLists(customerId),
		enabled: !!customerId,
	})
}

export function useAssignCustomerPriceList() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ customerId, priceListId }: { customerId: number; priceListId: string }) =>
			API.Pricing.assignCustomerToPriceList(customerId, priceListId),
		onSuccess: (_, { customerId }) => {
			queryClient.invalidateQueries({ queryKey: pricingKeys.customerPriceLists(customerId) })
		},
	})
}
```

---

#### Components

**Location**: `client/app/app/pricing/_components/`

| Component                         | Purpose                                       |
| --------------------------------- | --------------------------------------------- |
| `PriceListTable.tsx`              | DataGrid showing all price lists with actions |
| `PriceListForm.tsx`               | Create/Edit price list form                   |
| `PriceListDetail.tsx`             | Full price list view with items and customers |
| `PriceListItemEditor.tsx`         | Add/edit products in a price list             |
| `CustomerPriceListAssignment.tsx` | Assign customers to price lists               |
| `VolumeTierEditor.tsx`            | Configure volume pricing tiers                |
| `PriceBreakdown.tsx`              | Display pricing calculation breakdown         |
| `MarginIndicator.tsx`             | Visual indicator for margin health            |
| `hooks/usePricing.ts`             | All pricing-related hooks                     |
| `hooks/index.ts`                  | Barrel export                                 |
| `index.ts`                        | Barrel export                                 |

---

### 5.3 RBAC Implementation

#### Backend Authorization

**File**: `server/Constants/RBACConstants.cs` (additions)

```csharp
public static class Policies
{
    // ... existing policies ...

    public const string PricingView = "PricingView";
    public const string PricingManage = "PricingManage";
}
```

**File**: `server/Extensions/RBACServiceExtensions.cs` (additions)

```csharp
// Add to ConfigureAuthorization()
options.AddPolicy(RBACConstants.Policies.PricingView, policy =>
    policy.RequireRole("Admin", "SalesManager", "SalesRep"));

options.AddPolicy(RBACConstants.Policies.PricingManage, policy =>
    policy.RequireRole("Admin"));
```

#### Frontend Guards

```tsx
import { PermissionGuard } from '@_components/common/guards'
import { Resources, Actions } from '@_shared/constants/rbac'

// View price lists (Admin, Sales Manager, Sales Rep)
<PermissionGuard resource={Resources.Pricing} action={Actions.View}>
  <PriceListTable />
</PermissionGuard>

// Manage price lists (Admin only)
<PermissionGuard resource={Resources.Pricing} action={Actions.Manage}>
  <PriceListForm />
</PermissionGuard>
```

---

## 6. Implementation Plan

### Phase 1: Database & Core Backend (Week 1)

-   [ ] Create migration for pricing entities
-   [ ] Implement `PriceList`, `PriceListItem`, `CustomerPriceList`, `VolumePricingTier` entities
-   [ ] Implement `PricingAuditLog` entity
-   [ ] Create pricing DTOs
-   [ ] Implement `IPricingService` interface
-   [ ] Implement core `PricingService` with waterfall calculation
-   [ ] Add margin protection logic
-   [ ] Add RBAC policies for pricing

### Phase 2: Backend API & Price Lists (Week 2)

-   [ ] Implement `PricingController` endpoints
-   [ ] Implement price list CRUD operations
-   [ ] Implement price list item management
-   [ ] Implement customer assignment endpoints
-   [ ] Implement volume tier endpoints
-   [ ] Add audit logging to all pricing operations
-   [ ] Unit tests for PricingService calculations

### Phase 3: Frontend Foundation (Week 3)

-   [ ] Create `PriceList`, `PricingResult` entity classes
-   [ ] Add pricing validation schemas
-   [ ] Update `api.ts` with Pricing methods
-   [ ] Implement `usePricing` hooks
-   [ ] Create `PriceBreakdown` component
-   [ ] Create `MarginIndicator` component
-   [ ] Integrate pricing into Quote editor

### Phase 4: Admin UI & Testing (Week 4)

-   [ ] Build Price List management pages
-   [ ] Build Volume Tier editor
-   [ ] Build Customer Assignment UI
-   [ ] RBAC integration and guards
-   [ ] Integration tests
-   [ ] E2E tests for pricing workflows

---

## 7. Testing Requirements

### Unit Tests

#### Pricing Calculation Tests

```typescript
describe('PricingService', () => {
	it('should return base price when no rules apply', async () => {})
	it('should apply contract price list correctly', async () => {})
	it('should apply volume tier when quantity qualifies', async () => {})
	it('should take lower of contract vs volume price', async () => {})
	it('should apply margin protection when below threshold', async () => {})
	it('should include all applied rules in result', async () => {})
})
```

#### Component Tests

```typescript
describe('PriceBreakdown', () => {
	it('should display all applied rules', () => {})
	it('should show margin protection warning when active', () => {})
	it('should format currency correctly', () => {})
})

describe('VolumeTierEditor', () => {
	it('should add new tiers', () => {})
	it('should validate tier ranges', () => {})
	it('should prevent overlapping tiers', () => {})
})
```

### RBAC Security Tests

```typescript
describe('Pricing RBAC', () => {
	it('should allow Admin to manage price lists', () => {})
	it('should allow SalesRep to view price lists', () => {})
	it('should deny Customer from viewing price lists', () => {})
	it('should allow Admin to assign customers to price lists', () => {})
})
```

### Integration Tests

```typescript
describe('Pricing Flow', () => {
	it('should calculate customer price through full waterfall', async () => {})
	it('should recalculate when quantity changes', async () => {})
	it('should apply new price list after customer assignment', async () => {})
})
```

---

## 8. Performance Requirements

| Metric                       | Target  | Maximum |
| ---------------------------- | ------- | ------- |
| Single price calculation     | < 50ms  | 100ms   |
| Cart pricing (20 items)      | < 200ms | 500ms   |
| Bulk calculation (100 items) | < 1s    | 2s      |
| Price list search            | < 100ms | 200ms   |

### Optimization Strategies

1. **Caching**: Cache price lists per customer (5-min TTL)
2. **Indexing**: Create indexes on (TenantId, ProductId), (TenantId, CustomerId)
3. **Batch queries**: Process cart items in single database round-trip
4. **Denormalization**: Store calculated price in QuoteItem/OrderItem
5. **Avoid DB writes on read path**: No audit log per browse request (see Audit Logging)
6. **Bulk-first API usage**: Product lists/carts use `calculate/bulk` to avoid N+1 calls

---

## 9. File Changes Summary

### New Files

```
server/
├── Entities/Pricing/
│   ├── PriceList.cs
│   ├── PriceListItem.cs
│   ├── CustomerPriceList.cs
│   ├── VolumePricingTier.cs
│   └── PricingAuditLog.cs
├── Classes/DTOs/Pricing/
│   └── PricingDTOs.cs
├── Services/Pricing/
│   ├── IPricingService.cs
│   └── PricingService.cs
├── Controllers/
│   └── PricingController.cs
└── Migrations/
    └── YYYYMMDDHHMMSS_AddAdvancedPricing.cs

client/
├── app/_classes/
│   └── Pricing.ts
└── app/app/pricing/
    ├── _components/
    │   ├── PriceListTable.tsx
    │   ├── PriceListForm.tsx
    │   ├── PriceListDetail.tsx
    │   ├── PriceListItemEditor.tsx
    │   ├── CustomerPriceListAssignment.tsx
    │   ├── VolumeTierEditor.tsx
    │   ├── PriceBreakdown.tsx
    │   ├── MarginIndicator.tsx
    │   ├── hooks/
    │   │   ├── usePricing.ts
    │   │   └── index.ts
    │   └── index.ts
    ├── price-lists/
    │   ├── [id]/page.tsx
    │   └── page.tsx
    └── page.tsx
```

### Modified Files

```
server/
├── Constants/RBACConstants.cs
├── Extensions/RBACServiceExtensions.cs
├── Database/DBContext.cs
└── Program.cs (DI registration)

client/
├── app/_shared/services/api.ts
├── app/_core/validation/validation-schemas.ts
└── app/app/quotes/[id]/_components/QuotePricingEditor.tsx
```

---

## 10. Success Criteria

-   [ ] All 10 user stories implemented and tested
-   [ ] Price calculation < 50ms for single item
-   [ ] Full explainability (appliedRules) in all calculations
-   [ ] Margin protection prevents all below-threshold sales
-   [ ] RBAC verified for all 5 roles
-   [ ] 95%+ test coverage on PricingService
-   [ ] Admin UI fully functional for price list management
-   [ ] Integration with Quote editor complete
-   [ ] Performance benchmarks met
-   [ ] Documentation complete

---

**Document Version**: 1.0
**Last Updated**: January 12, 2026
**Status**: Ready for Implementation
