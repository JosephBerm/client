# Customers Management PRD

## 1. Overview

- **Feature**: Customer/Company Management
- **Priority**: P2 (Management - Sales team tools)
- **Status**: Partial (Basic exists, needs enhancement)
- **Dependencies**: RBAC System (Complete), Accounts (Complete)
- **Estimated Effort**: 10-12 hours

## 2. Business Context

**From `business_flow.md`:**

Customers (Companies) are the B2B entities that place orders:
- Each customer has a primary sales rep assigned
- Customers can have multiple user accounts (employees)
- Customer profiles include contact info, address, tax ID
- Sales reps need visibility into customer history

**Business Value:**
- Sales reps can manage their assigned customer relationships
- Customer history improves quote accuracy
- Tax ID tracking for invoicing compliance
- Primary sales rep assignment ensures consistent service

---

## 3. Role-Based Requirements

### Customer View

**Can:**
- View own company profile
- Edit own company info (name, address, phone)
- See order/quote history (own)

**Cannot:**
- See other customers
- See internal notes
- Change primary sales rep

---

### Sales Rep View

**Can:**
- View customers ASSIGNED to them (via primary sales rep)
- View customer order/quote history
- Add internal notes about customer
- Update customer contact info

**Cannot:**
- View unassigned customers
- Change primary sales rep assignment
- Delete customers

---

### Sales Manager View

**Can:**
- View ALL customers
- Assign/reassign primary sales rep
- View all internal notes
- Merge duplicate customers (future)

**Cannot:**
- Delete customers

---

### Admin View

**Can:**
- Full customer management
- Delete customers (soft delete)
- View audit history
- Export customer data

---

## 4. User Stories

### Epic 1: Customer Viewing

**US-CUST-001**: As a Sales Rep, I want to view my assigned customers so I can manage relationships.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given I have 10 assigned customers, when I view customers page, then I see those 10
  - [ ] Given customer has orders, when I view profile, then I see order history
  - [ ] Given unassigned customer, when I search, then they don't appear

**US-CUST-002**: As a Sales Manager, I want to view all customers so I can oversee sales efforts.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given 50 customers exist, when I view customers, then I see all 50
  - [ ] Given customer assigned to Rep A, when I view, then I see the assignment
  - [ ] Given I filter by sales rep, when applied, then only their customers show

---

### Epic 2: Customer Management

**US-CUST-003**: As a Sales Rep, I want to update customer info so records stay accurate.
- **Priority**: P1
- **Acceptance Criteria**:
  - [ ] Given customer profile, when I edit phone, then it saves
  - [ ] Given I add note, when saved, then note appears with timestamp
  - [ ] Given I'm not assigned, when I try to edit, then I get 403

**US-CUST-004**: As a Sales Manager, I want to assign primary sales rep so customers have dedicated support.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given customer without rep, when I assign Rep A, then Rep A sees them
  - [ ] Given customer with Rep A, when I reassign to Rep B, then Rep A no longer sees them
  - [ ] Given assignment change, when saved, then audit log is created

---

## 5. Technical Architecture

### 5.1 Backend

**Existing Entity**: `server/Entities/Customer.cs`

```csharp
public class Customer
{
    [Key]
    [Column("id")]
    public int Id { get; set; }
    
    [Column("name")]
    public string? Name { get; set; }
    
    [Column("email")]
    public string? Email { get; set; }
    
    [Column("phone")]
    public string? Phone { get; set; }
    
    public Address? Address { get; set; }
    
    [Column("tax_id")]
    public string? TaxId { get; set; }
    
    [Column("website")]
    public string? Website { get; set; }
    
    /// <summary>
    /// Primary sales rep assigned to this customer.
    /// All quotes/orders from this customer go to this rep.
    /// </summary>
    [Column("primary_sales_rep_id")]
    public int? PrimarySalesRepId { get; set; }
    
    [Column("internal_notes")]
    public string? InternalNotes { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Column("is_archived")]
    public bool IsArchived { get; set; } = false;
    
    // Navigation
    public virtual List<Account> Accounts { get; set; } = new();
    public virtual List<Order> Orders { get; set; } = new();
    public virtual List<Quote> Quotes { get; set; } = new();
}
```

#### Controller

**File**: `server/Controllers/CustomersController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : BaseController
{
    private readonly ICustomerService _customerService;
    private readonly IAccountService _accountService;
    
    [HttpGet]
    public async Task<IResponse<PagedResult<Customer>>> GetCustomers([FromBody] GenericSearchFilter filter)
    {
        var user = await _accountService.GetById();
        
        // Role-based filtering
        if (user.Role == AccountRole.SalesRep)
        {
            // Only show assigned customers
            filter.Filters ??= new Dictionary<string, string>();
            filter.Filters["PrimarySalesRepId"] = user.Id.ToString();
        }
        else if (user.Role == AccountRole.Customer)
        {
            // Customers can only see their own company
            return Unauthorized<PagedResult<Customer>>("Customers cannot list other customers");
        }
        // SalesManager+ sees all
        
        var result = await _customerService.Search(filter);
        return Ok<PagedResult<Customer>>("customers_retrieved", result);
    }
    
    [HttpGet("{id:int}")]
    public async Task<IResponse<Customer>> GetCustomer(int id)
    {
        var user = await _accountService.GetById();
        var customer = await _customerService.Get(id);
        
        if (customer == null)
            return NotFound<Customer>("Customer not found");
        
        // Authorization
        if (user.Role == AccountRole.Customer && user.CustomerId != id)
            return Unauthorized<Customer>("You can only view your own company");
            
        if (user.Role == AccountRole.SalesRep && customer.PrimarySalesRepId != user.Id)
            return Unauthorized<Customer>("You can only view assigned customers");
        
        return Ok<Customer>("customer_retrieved", customer);
    }
    
    [HttpPut]
    public async Task<IResponse<Customer>> UpdateCustomer([FromBody] Customer customer)
    {
        var user = await _accountService.GetById();
        var existing = await _customerService.Get(customer.Id);
        
        if (existing == null)
            return NotFound<Customer>("Customer not found");
        
        // Authorization
        if (user.Role == AccountRole.Customer)
        {
            if (user.CustomerId != customer.Id)
                return Unauthorized<Customer>("You can only edit your own company");
            // Customers cannot change certain fields
            customer.PrimarySalesRepId = existing.PrimarySalesRepId;
            customer.InternalNotes = existing.InternalNotes;
        }
        else if (user.Role == AccountRole.SalesRep)
        {
            if (existing.PrimarySalesRepId != user.Id)
                return Unauthorized<Customer>("You can only edit assigned customers");
            // Sales reps cannot change assignment
            customer.PrimarySalesRepId = existing.PrimarySalesRepId;
        }
        // SalesManager+ can change everything
        
        var updated = await _customerService.Update(customer);
        return Ok<Customer>("customer_updated", updated);
    }
    
    [HttpPost("{id:int}/assign")]
    [Authorize(Policy = "SalesManagerOrAbove")]
    public async Task<IResponse<Customer>> AssignSalesRep(int id, [FromBody] AssignSalesRepRequest request)
    {
        var customer = await _customerService.Get(id);
        
        if (customer == null)
            return NotFound<Customer>("Customer not found");
        
        customer.PrimarySalesRepId = request.SalesRepId;
        
        var updated = await _customerService.Update(customer);
        
        // TODO: Log audit entry
        // TODO: Notify new sales rep
        
        return Ok<Customer>("sales_rep_assigned", updated);
    }
}

public class AssignSalesRepRequest
{
    [Required]
    public int SalesRepId { get; set; }
}
```

---

### 5.2 Frontend

#### API Integration

```typescript
// ADD to API.Customers:

Customers: {
  get: async <T>(id: number) => HttpService.get<T>(`/customers/${id}`),
  
  search: async (filter: GenericSearchFilter) =>
    HttpService.post<PagedResult<Customer>>('/customers', filter),
  
  update: async (customer: Customer) =>
    HttpService.put<Customer>('/customers', customer),
  
  create: async (customer: Customer) =>
    HttpService.post<Customer>('/customers', customer),
  
  assignSalesRep: async (customerId: number, salesRepId: number) =>
    HttpService.post<Customer>(`/customers/${customerId}/assign`, { salesRepId }),
},
```

#### Components

**Location**: `client/app/app/customers/_components/`

1. **CustomerCard.tsx** - Summary card
2. **CustomerDetails.tsx** - Full profile view
3. **CustomerForm.tsx** - Edit form
4. **CustomerHistory.tsx** - Order/quote history
5. **AssignSalesRepModal.tsx** - Assignment dialog

---

## 6. Implementation Plan

### Phase 1: Backend (Days 1-2)
- [ ] Verify Customer entity
- [ ] Create/enhance CustomersController
- [ ] Add role-based filtering in service
- [ ] Add assign endpoint

### Phase 2: Frontend (Days 3-4)
- [ ] Add API methods
- [ ] Create customer list page
- [ ] Create customer detail page
- [ ] Add assignment modal

### Phase 3: Testing (Days 5)
- [ ] RBAC tests
- [ ] Integration tests

---

## 7. Success Criteria

- [ ] Sales reps see only assigned customers
- [ ] Sales managers see all customers
- [ ] Assignment works correctly
- [ ] Customer history displays
- [ ] Tests passing (95%+ coverage)

