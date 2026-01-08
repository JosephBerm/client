# Products Management PRD

## 1. Overview

- **Feature**: Product CRUD & Catalog Management
- **Priority**: P2 (Management - After core quote/order flows)
- **Status**: Partial (Catalog view exists, CRUD for Admin needed)
- **Dependencies**: RBAC System (Complete), File Upload (Complete)
- **Estimated Effort**: 12-14 hours

## 2. Business Context

**From `business_flow.md`:**

Products are the core of the catalog. Admins manage products:
- Create new products with images
- Edit product details (name, description, SKU, pricing)
- Archive/unarchive products
- Manage categories

**Business Value:**
- Admins can maintain product catalog without developer assistance
- Images improve customer experience
- Categories enable browsing/filtering
- SKU tracking for inventory integration (future)

---

## 3. Role-Based Requirements

### Customer View

**Can:**
- Browse product catalog
- Search products
- Filter by category
- View product details (name, description, images)
- Add to cart for quote

**Cannot:**
- See product cost (internal pricing)
- Create/edit/delete products
- See archived products

---

### Sales Rep View

**Can:**
- All customer capabilities
- See product cost (for pricing quotes)
- See vendor/provider information

**Cannot:**
- Create/edit/delete products

---

### Admin View

**Can:**
- Full product management (CRUD)
- Upload product images
- Manage categories
- Archive/unarchive products
- See all product data including costs
- Bulk operations (future)

---

## 4. User Stories

### Epic 1: Product Catalog (All Roles)

**US-PRD-001**: As a Customer, I want to browse products so I can find what I need.
- **Priority**: P0 (Exists, verify)
- **Acceptance Criteria**:
  - [ ] Given I visit store page, when loaded, then I see product grid
  - [ ] Given products exist, when viewing, then I see name, image, description
  - [ ] Given I click product, when navigating, then I see detail page

**US-PRD-002**: As a Customer, I want to filter products by category so I find items faster.
- **Priority**: P1
- **Acceptance Criteria**:
  - [ ] Given categories exist, when I view filters, then I see category dropdown
  - [ ] Given I select "Surgical Equipment", when filtering, then only surgical products show

---

### Epic 2: Product Management (Admin)

**US-PRD-003**: As an Admin, I want to create products so I can expand the catalog.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given I'm admin, when I click "Add Product", then create form opens
  - [ ] Given I fill required fields (name, SKU, price), when saving, then product is created
  - [ ] Given I upload images, when saving, then images are attached to product

**US-PRD-004**: As an Admin, I want to edit products so I can update information.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given I'm on product detail, when I click "Edit", then form is editable
  - [ ] Given I change name, when saving, then name is updated
  - [ ] Given I add/remove images, when saving, then images are updated

**US-PRD-005**: As an Admin, I want to archive products so outdated items don't show.
- **Priority**: P1
- **Acceptance Criteria**:
  - [ ] Given product exists, when I click "Archive", then product is archived
  - [ ] Given product is archived, when customer browses, then product is hidden
  - [ ] Given I'm admin, when I toggle "Show Archived", then archived products appear

---

## 5. Technical Architecture

### 5.1 Backend

**Existing Structure** (verify/enhance):

**File**: `server/Entities/Product.cs`
```csharp
public class Product
{
    [Key]
    [Column("id")]
    public Guid? Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [Column("sku")]
    public string SKU { get; set; }
    
    [Required]
    [Column("name")]
    public string Name { get; set; }
    
    [Column("description")]
    public string Description { get; set; }
    
    [Column("cost")]
    public decimal? Cost { get; set; } = 0;  // Internal cost (admin/sales only)
    
    [Column("price")]
    public decimal Price { get; set; } = 0;  // Display price (may not be used in quote-based model)
    
    [Column("tax")]
    public decimal Tax { get; set; } = 0;
    
    public virtual List<UploadedFile> Files { get; set; } = [];
    
    [Column("categories")]
    public virtual List<Category> Categories { get; set; } = new();
    
    public virtual Provider? Provider { get; set; }
    
    [Column("provider_id")]
    public int? ProviderId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    [Column("is_archived")]
    public bool isArchived { get; set; } = false;
}
```

#### Controller Enhancements

**File**: `server/Controllers/ProductsController.cs`

```csharp
// Verify these endpoints exist:

[HttpGet]
[AllowAnonymous]
public async Task<IResponse<List<Product>>> GetProducts([FromQuery] bool includeArchived = false)
{
    var user = await _accountService.GetById();
    var isAdmin = user?.isAdmin() ?? false;
    
    // Only admins can see archived products
    var products = await _productService.GetAll(includeArchived && isAdmin);
    
    // Hide cost from non-staff
    if (user == null || user.Role < AccountRole.SalesRep)
    {
        foreach (var p in products)
            p.Cost = null; // Hide internal cost
    }
    
    return Ok<List<Product>>("products_retrieved", products);
}

[HttpPost]
[Authorize(Policy = "AdminOnly")]
public async Task<IResponse<Product>> CreateProduct([FromForm] CreateProductRequest request)
{
    // Validate
    if (string.IsNullOrEmpty(request.Name))
        return BadRequest<Product>("Product name is required");
    
    if (string.IsNullOrEmpty(request.SKU))
        return BadRequest<Product>("SKU is required");
    
    var product = new Product
    {
        Name = request.Name,
        Description = request.Description ?? "",
        SKU = request.SKU,
        Cost = request.Cost,
        Price = request.Price ?? 0,
        ProviderId = request.ProviderId,
    };
    
    // Handle file uploads
    if (request.Files?.Any() == true)
    {
        product.Files = await _fileService.UploadFiles(request.Files, $"products/{product.Id}");
    }
    
    var created = await _productService.Create(product);
    return Ok<Product>("product_created", created);
}

[HttpPut]
[Authorize(Policy = "AdminOnly")]
public async Task<IResponse<Product>> UpdateProduct([FromBody] Product product)
{
    if (product.Id == null)
        return BadRequest<Product>("Product ID is required");
    
    var existing = await _productService.Get(product.Id.Value);
    if (existing == null)
        return NotFound<Product>("Product not found");
    
    existing.Name = product.Name;
    existing.Description = product.Description;
    existing.SKU = product.SKU;
    existing.Cost = product.Cost;
    existing.Price = product.Price;
    existing.ProviderId = product.ProviderId;
    existing.UpdatedAt = DateTime.UtcNow;
    
    var updated = await _productService.Update(existing);
    return Ok<Product>("product_updated", updated);
}

[HttpPost("{id:guid}/archive")]
[Authorize(Policy = "AdminOnly")]
public async Task<IResponse<bool>> ArchiveProduct(Guid id)
{
    var success = await _productService.Archive(id);
    return Ok<bool>("product_archived", success);
}

[HttpPost("{id:guid}/unarchive")]
[Authorize(Policy = "AdminOnly")]
public async Task<IResponse<bool>> UnarchiveProduct(Guid id)
{
    var success = await _productService.Unarchive(id);
    return Ok<bool>("product_unarchived", success);
}

[HttpDelete("{id:guid}")]
[Authorize(Policy = "AdminOnly")]
public async Task<IResponse<bool>> DeleteProduct(Guid id)
{
    // Hard delete - use sparingly
    var success = await _productService.Delete(id);
    return Ok<bool>("product_deleted", success);
}
```

---

### 5.2 Frontend

#### Components

**Location**: `client/app/app/products/_components/`

1. **ProductForm.tsx** (exists - verify)
   - Create/edit form
   - Image upload
   - Category selection

2. **ProductList.tsx** (enhance)
   - Admin view with edit/archive actions
   - Toggle "Show Archived"

3. **ProductCard.tsx** (exists - verify)
   - Display card for catalog

4. **ProductFilters.tsx** (create if needed)
   - Category filter
   - Search input
   - Sort options

---

#### Admin Product Management Page

**File**: `client/app/app/products/page.tsx`

```typescript
/**
 * Products Management Page (Admin)
 * 
 * Lists all products with CRUD actions for admin.
 * Uses ServerDataGrid for pagination.
 */

'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Routes } from '@_features/navigation'
import { PermissionGuard, Resources, Actions } from '@_components/common/guards'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { InternalPageHeader } from '../_components'
import { ProductsDataGrid } from './_components'

export default function ProductsPage() {
  const router = useRouter()
  const [showArchived, setShowArchived] = useState(false)
  
  return (
    <>
      <InternalPageHeader
        title="Products"
        description="Manage product catalog"
        actions={
          <PermissionGuard resource={Resources.Products} action={Actions.Create}>
            <Button 
              variant="primary"
              onClick={() => router.push(Routes.Products.create)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </PermissionGuard>
        }
      />
      
      <Card>
        <div className="card-body">
          {/* Filters */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <label className="label cursor-pointer gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                />
                <span className="label-text">Show Archived</span>
              </label>
            </div>
          </div>
          
          <ProductsDataGrid showArchived={showArchived} />
        </div>
      </Card>
    </>
  )
}
```

---

## 6. Implementation Plan

### Phase 1: Backend (Days 1-2)
- [ ] Verify Product entity has all fields
- [ ] Verify ProductsController has CRUD endpoints
- [ ] Add archive/unarchive endpoints if missing
- [ ] Add role-based cost filtering

### Phase 2: Frontend (Days 3-4)
- [ ] Verify ProductForm component
- [ ] Create ProductsDataGrid with admin actions
- [ ] Add archive toggle
- [ ] Add category filters

### Phase 3: Testing (Days 5-6)
- [ ] Unit tests for components
- [ ] RBAC tests (admin can edit, customer cannot)
- [ ] Integration tests

---

## 7. Testing Requirements

### RBAC Tests
```typescript
describe('Products RBAC', () => {
  it('should allow customer to view products (no cost)', () => {})
  it('should allow sales rep to view products with cost', () => {})
  it('should deny customer from creating products', () => {})
  it('should allow admin to create products', () => {})
  it('should allow admin to archive products', () => {})
  it('should hide archived products from customers', () => {})
})
```

---

## 8. Success Criteria

- [ ] Customers can browse and search products
- [ ] Admins can create/edit/archive products
- [ ] Images upload and display correctly
- [ ] Categories filter products
- [ ] Cost is hidden from non-staff
- [ ] Archived products hidden from customers
- [ ] Tests passing (95%+ coverage)

