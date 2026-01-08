# Orders Management PRD

## 1. Overview

- **Feature**: Full Order Lifecycle Management
- **Priority**: P1 (Core - After quotes, orders are the next critical path)
- **Status**: Partial (Basic viewing exists, workflow incomplete)
- **Dependencies**: Quote Pricing (P0), RBAC System (Complete)
- **Estimated Effort**: 16-20 hours

## 2. Business Context

**From `business_flow.md` Section 5-7:**

The order lifecycle flows as follows:
1. Quote Approved → Customer accepts quote
2. Order Created (Status: Placed)
3. Sales Rep confirms payment (Status: Paid)
4. Fulfillment processes order (Status: Processing)
5. Vendor ships product (Status: Shipped)
6. Customer receives product (Status: Delivered)

**Business Value:**
- Complete visibility into order status for all stakeholders
- Clear workflow handoffs between sales, fulfillment, vendors
- Payment tracking and confirmation
- Shipment tracking integration
- Customer order history and tracking

---

## 3. Role-Based Requirements

### Customer View

**Can:**
- View own orders only
- See order status, products, totals
- Track shipment (when tracking number added)
- Request cancellation (creates support request)
- Download invoice/receipt

**Cannot:**
- See other customers' orders
- See internal notes
- Change order status
- See vendor information

**Order Status Visible:**
- Placed, Paid, Processing, Shipped, Delivered, Cancelled

---

### Sales Rep View

**Can:**
- View orders for quotes ASSIGNED to them
- Confirm payment received (Placed → Paid)
- Add internal notes
- See customer contact info
- See payment details (amount, method)

**Cannot:**
- View orders for unassigned quotes
- Process fulfillment (add tracking)
- Cancel orders directly (must go through manager)

---

### Fulfillment Coordinator View

**Can:**
- View all orders with status "Paid" or later
- Update order status (Paid → Processing → Shipped)
- Add tracking numbers
- Add vendor/shipping notes
- Mark as delivered

**Cannot:**
- Confirm payments
- See quote/pricing history
- Cancel orders

---

### Sales Manager View

**Can:**
- View ALL orders
- Confirm payment
- Override status (with audit log)
- Cancel orders
- Reassign orders to different sales rep
- View performance metrics

**Cannot:**
- Nothing - full operational access

---

### Admin View

**Can:**
- Full access (same as Sales Manager)
- Delete orders (hard delete for data cleanup)
- Access audit logs
- View system-wide metrics

---

## 4. User Stories

### Epic 1: Order Viewing

**US-ORD-001**: As a Customer, I want to view my order history so I can track past purchases.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given I have 5 orders, when I view orders page, then I see all 5 orders
  - [ ] Given I click an order, when detail loads, then I see all products and totals
  - [ ] Given another customer's order ID, when I try to access, then I get 403 Forbidden

**US-ORD-002**: As a Sales Rep, I want to view orders from my assigned quotes so I can track conversions.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given I have 3 assigned orders, when I view orders, then I see only those 3
  - [ ] Given an order from another rep's quote, when I search, then it doesn't appear
  - [ ] Given I click order, when viewing, then I see customer contact and payment status

---

### Epic 2: Payment Confirmation

**US-ORD-003**: As a Sales Rep, I want to confirm payment received so the order can proceed to fulfillment.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given order status is "Placed", when I click "Confirm Payment", then status becomes "Paid"
  - [ ] Given I confirm payment, when saving, then timestamp and my user ID are recorded
  - [ ] Given status is already "Paid", when viewing, then "Confirm Payment" button is hidden

---

### Epic 3: Fulfillment Processing

**US-ORD-004**: As Fulfillment, I want to add tracking numbers so customers can track shipments.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given order status is "Paid", when I add tracking #, then it's saved per product
  - [ ] Given tracking # added, when I click "Mark Shipped", then status becomes "Shipped"
  - [ ] Given customer views order, when shipped, then tracking link is visible

**US-ORD-005**: As Fulfillment, I want to mark orders as delivered so the workflow completes.
- **Priority**: P1
- **Acceptance Criteria**:
  - [ ] Given order is "Shipped", when I click "Mark Delivered", then status becomes "Delivered"
  - [ ] Given order is "Delivered", when customer views, then they see delivery confirmation

---

### Epic 4: Order Cancellation

**US-ORD-006**: As a Customer, I want to request order cancellation so I can stop unwanted orders.
- **Priority**: P1
- **Acceptance Criteria**:
  - [ ] Given order status is "Placed" or "Paid", when I click "Request Cancellation", then request is created
  - [ ] Given I request cancellation, when submitted, then sales manager is notified
  - [ ] Given order is "Shipped", when viewing, then cancellation is not available

---

## 5. Technical Architecture

### 5.1 Backend

#### Entity Updates

**File**: `server/Entities/Order.cs` (existing - verify structure)

```csharp
// Ensure these fields exist:
public class Order
{
    [Key]
    [Column("id")]
    public int? Id { get; set; }
    
    [Column("order_number")]
    public string OrderNumber { get; set; } = string.Empty;
    
    public virtual List<OrderItem> Products { get; set; } = new();
    
    [Column("total")]
    public decimal Total { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public int? CustomerId { get; set; }
    [ForeignKey("CustomerId")]
    public virtual Customer? Customer { get; set; }
    
    public OrderStatus Status { get; set; } = OrderStatus.Placed;
    
    [Column("is_archived")]
    public bool isArchived { get; set; } = false;
    
    [Column("shipping")]
    public decimal Shipping { get; set; }
    
    [Column("discount")]
    public decimal Discount { get; set; }
    
    [Column("notes")]
    public string? Notes { get; set; }
    
    // ADD these fields if missing:
    
    /// <summary>
    /// Sales rep who owns this order (inherited from quote).
    /// </summary>
    [Column("assigned_sales_rep_id")]
    public string? AssignedSalesRepId { get; set; }
    
    /// <summary>
    /// Timestamp when payment was confirmed.
    /// </summary>
    [Column("payment_confirmed_at")]
    public DateTime? PaymentConfirmedAt { get; set; }
    
    /// <summary>
    /// User ID who confirmed payment.
    /// </summary>
    [Column("payment_confirmed_by")]
    public string? PaymentConfirmedBy { get; set; }
    
    /// <summary>
    /// Timestamp when order was shipped.
    /// </summary>
    [Column("shipped_at")]
    public DateTime? ShippedAt { get; set; }
    
    /// <summary>
    /// Timestamp when order was delivered.
    /// </summary>
    [Column("delivered_at")]
    public DateTime? DeliveredAt { get; set; }
    
    /// <summary>
    /// Internal notes (not visible to customer).
    /// </summary>
    [Column("internal_notes")]
    public string? InternalNotes { get; set; }
}

public enum OrderStatus
{
    Placed = 0,      // Customer accepted quote, order created
    Paid = 1,        // Payment confirmed by sales rep
    Processing = 2,  // Fulfillment started processing
    Shipped = 3,     // Vendor shipped, tracking added
    Delivered = 4,   // Customer received
    Cancelled = 5    // Order cancelled
}
```

---

#### DTOs

**File**: `server/Classes/Others/OrderDTOs.cs` (NEW)

```csharp
/// <summary>
/// Order list item (lightweight for tables).
/// </summary>
public class OrderListItem
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public OrderStatus Status { get; set; }
    public decimal Total { get; set; }
    public int ProductCount { get; set; }
}

/// <summary>
/// Request to confirm payment.
/// </summary>
public class ConfirmPaymentRequest
{
    [Required]
    public int OrderId { get; set; }
    
    /// <summary>Optional payment reference (transaction ID, check #, etc.)</summary>
    public string? PaymentReference { get; set; }
    
    /// <summary>Optional internal notes about payment.</summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Request to update order status.
/// </summary>
public class UpdateOrderStatusRequest
{
    [Required]
    public int OrderId { get; set; }
    
    [Required]
    public OrderStatus NewStatus { get; set; }
    
    /// <summary>Required for shipping status.</summary>
    public string? TrackingNumber { get; set; }
    
    /// <summary>Optional carrier (FedEx, UPS, USPS).</summary>
    public string? Carrier { get; set; }
    
    /// <summary>Optional internal notes.</summary>
    public string? InternalNotes { get; set; }
}

/// <summary>
/// Request to add tracking to a specific product.
/// </summary>
public class AddTrackingRequest
{
    [Required]
    public int OrderId { get; set; }
    
    [Required]
    public int OrderItemId { get; set; }
    
    [Required]
    public string TrackingNumber { get; set; } = string.Empty;
    
    public string? Carrier { get; set; }
}

/// <summary>
/// Order dashboard summary.
/// </summary>
public class OrderSummary
{
    public int TotalOrders { get; set; }
    public int PlacedCount { get; set; }
    public int PaidCount { get; set; }
    public int ProcessingCount { get; set; }
    public int ShippedCount { get; set; }
    public int DeliveredCount { get; set; }
    public int CancelledCount { get; set; }
    public decimal TotalRevenue { get; set; }
}
```

---

#### Controller Endpoints

**File**: `server/Controllers/OrdersController.cs` (ADD/UPDATE)

```csharp
/// <summary>
/// Confirms payment for an order (Sales Rep+).
/// Changes status from Placed → Paid.
/// </summary>
[HttpPost("{orderId:int}/confirm-payment")]
[Authorize(Policy = "SalesRepOrAbove")]
public async Task<IResponse<Order>> ConfirmPayment(
    int orderId, 
    [FromBody] ConfirmPaymentRequest request)
{
    var user = await _accountService.GetById();
    var order = await _orderService.Get(orderId);
    
    if (order == null)
        return NotFound<Order>($"Order {orderId} not found");
    
    // SalesRep can only confirm for assigned orders
    if (user.Role == AccountRole.SalesRep && order.AssignedSalesRepId != user.Id.ToString())
        return Unauthorized<Order>("You can only confirm payment for orders assigned to you");
    
    if (order.Status != OrderStatus.Placed)
        return BadRequest<Order>($"Can only confirm payment for orders with status 'Placed'. Current: {order.Status}");
    
    order.Status = OrderStatus.Paid;
    order.PaymentConfirmedAt = DateTime.UtcNow;
    order.PaymentConfirmedBy = user.Id.ToString();
    
    if (!string.IsNullOrEmpty(request.Notes))
        order.InternalNotes = (order.InternalNotes ?? "") + $"\n[Payment] {request.Notes}";
    
    var updated = await _orderService.Update(order);
    return Ok<Order>("payment_confirmed", updated);
}

/// <summary>
/// Updates order status (Fulfillment+).
/// </summary>
[HttpPost("{orderId:int}/status")]
[Authorize(Policy = "FulfillmentOrAbove")]
public async Task<IResponse<Order>> UpdateStatus(
    int orderId, 
    [FromBody] UpdateOrderStatusRequest request)
{
    var user = await _accountService.GetById();
    var order = await _orderService.Get(orderId);
    
    if (order == null)
        return NotFound<Order>($"Order {orderId} not found");
    
    // Validate status transition
    var validTransition = IsValidStatusTransition(order.Status, request.NewStatus);
    if (!validTransition)
        return BadRequest<Order>($"Invalid status transition from {order.Status} to {request.NewStatus}");
    
    // Shipping requires tracking number
    if (request.NewStatus == OrderStatus.Shipped && string.IsNullOrEmpty(request.TrackingNumber))
        return BadRequest<Order>("Tracking number is required when marking as Shipped");
    
    order.Status = request.NewStatus;
    
    if (request.NewStatus == OrderStatus.Shipped)
        order.ShippedAt = DateTime.UtcNow;
    else if (request.NewStatus == OrderStatus.Delivered)
        order.DeliveredAt = DateTime.UtcNow;
    
    if (!string.IsNullOrEmpty(request.InternalNotes))
        order.InternalNotes = (order.InternalNotes ?? "") + $"\n[Status] {request.InternalNotes}";
    
    var updated = await _orderService.Update(order);
    return Ok<Order>("status_updated", updated);
}

/// <summary>
/// Adds tracking number to a specific order item.
/// </summary>
[HttpPost("{orderId:int}/tracking")]
[Authorize(Policy = "FulfillmentOrAbove")]
public async Task<IResponse<Order>> AddTracking(
    int orderId, 
    [FromBody] AddTrackingRequest request)
{
    var order = await _orderService.Get(orderId);
    
    if (order == null)
        return NotFound<Order>($"Order {orderId} not found");
    
    var item = order.Products.FirstOrDefault(p => p.Id == request.OrderItemId);
    if (item == null)
        return NotFound<Order>($"Order item {request.OrderItemId} not found");
    
    item.TrackingNumber = request.TrackingNumber;
    
    var updated = await _orderService.Update(order);
    return Ok<Order>("tracking_added", updated);
}

private bool IsValidStatusTransition(OrderStatus current, OrderStatus next)
{
    return (current, next) switch
    {
        (OrderStatus.Placed, OrderStatus.Paid) => true,
        (OrderStatus.Placed, OrderStatus.Cancelled) => true,
        (OrderStatus.Paid, OrderStatus.Processing) => true,
        (OrderStatus.Paid, OrderStatus.Cancelled) => true,
        (OrderStatus.Processing, OrderStatus.Shipped) => true,
        (OrderStatus.Shipped, OrderStatus.Delivered) => true,
        _ => false
    };
}
```

---

### 5.2 Frontend

#### Types

**File**: `client/app/_types/order.types.ts` (NEW)

```typescript
export type OrderStatus = 
  | 'Placed' 
  | 'Paid' 
  | 'Processing' 
  | 'Shipped' 
  | 'Delivered' 
  | 'Cancelled'

export interface OrderListItem {
  id: number
  orderNumber: string
  customerName: string
  createdAt: string
  status: OrderStatus
  total: number
  productCount: number
}

export interface OrderSummary {
  totalOrders: number
  placedCount: number
  paidCount: number
  processingCount: number
  shippedCount: number
  deliveredCount: number
  cancelledCount: number
  totalRevenue: number
}
```

---

#### API Integration

**File**: `client/app/_shared/services/api.ts`

```typescript
// ADD to API.Orders:

Orders: {
  // ... existing methods ...
  
  /**
   * Confirms payment for an order.
   */
  confirmPayment: async (orderId: number, notes?: string) =>
    HttpService.post<Order>(`/orders/${orderId}/confirm-payment`, { 
      orderId, 
      notes 
    }),
  
  /**
   * Updates order status.
   */
  updateStatus: async (
    orderId: number, 
    newStatus: OrderStatus, 
    trackingNumber?: string,
    notes?: string
  ) => HttpService.post<Order>(`/orders/${orderId}/status`, {
    orderId,
    newStatus,
    trackingNumber,
    internalNotes: notes,
  }),
  
  /**
   * Adds tracking to an order item.
   */
  addTracking: async (orderId: number, orderItemId: number, trackingNumber: string) =>
    HttpService.post<Order>(`/orders/${orderId}/tracking`, {
      orderId,
      orderItemId,
      trackingNumber,
    }),
  
  /**
   * Gets order summary statistics.
   */
  getSummary: async () =>
    HttpService.get<OrderSummary>('/orders/summary'),
},
```

---

#### Custom Hook

**File**: `client/app/app/orders/[id]/_components/hooks/useOrderActions.ts` (NEW)

```typescript
/**
 * useOrderActions Hook
 * 
 * Manages order workflow actions (confirm payment, update status, add tracking).
 */

'use client'

import { useCallback } from 'react'
import { useFormSubmit, API } from '@_shared'
import type Order from '@_classes/Order'
import type { OrderStatus } from '@_types/order.types'

export interface UseOrderActionsReturn {
  confirmPayment: (notes?: string) => Promise<{ success: boolean }>
  updateStatus: (newStatus: OrderStatus, trackingNumber?: string, notes?: string) => Promise<{ success: boolean }>
  addTracking: (orderItemId: number, trackingNumber: string) => Promise<{ success: boolean }>
  isProcessing: boolean
}

export function useOrderActions(
  order: Order | null,
  onRefresh?: () => Promise<void>
): UseOrderActionsReturn {
  const orderId = order?.id
  
  const { submit: confirmPaymentSubmit, isSubmitting: isConfirming } = useFormSubmit(
    async (data: { notes?: string }) => {
      if (!orderId) throw new Error('Order ID required')
      return API.Orders.confirmPayment(orderId, data.notes)
    },
    {
      successMessage: 'Payment confirmed',
      errorMessage: 'Failed to confirm payment',
      onSuccess: onRefresh,
    }
  )
  
  const { submit: updateStatusSubmit, isSubmitting: isUpdatingStatus } = useFormSubmit(
    async (data: { newStatus: OrderStatus; trackingNumber?: string; notes?: string }) => {
      if (!orderId) throw new Error('Order ID required')
      return API.Orders.updateStatus(orderId, data.newStatus, data.trackingNumber, data.notes)
    },
    {
      successMessage: 'Order status updated',
      errorMessage: 'Failed to update status',
      onSuccess: onRefresh,
    }
  )
  
  const { submit: addTrackingSubmit, isSubmitting: isAddingTracking } = useFormSubmit(
    async (data: { orderItemId: number; trackingNumber: string }) => {
      if (!orderId) throw new Error('Order ID required')
      return API.Orders.addTracking(orderId, data.orderItemId, data.trackingNumber)
    },
    {
      successMessage: 'Tracking number added',
      errorMessage: 'Failed to add tracking',
      onSuccess: onRefresh,
    }
  )
  
  const confirmPayment = useCallback(
    (notes?: string) => confirmPaymentSubmit({ notes }),
    [confirmPaymentSubmit]
  )
  
  const updateStatus = useCallback(
    (newStatus: OrderStatus, trackingNumber?: string, notes?: string) =>
      updateStatusSubmit({ newStatus, trackingNumber, notes }),
    [updateStatusSubmit]
  )
  
  const addTracking = useCallback(
    (orderItemId: number, trackingNumber: string) =>
      addTrackingSubmit({ orderItemId, trackingNumber }),
    [addTrackingSubmit]
  )
  
  return {
    confirmPayment,
    updateStatus,
    addTracking,
    isProcessing: isConfirming || isUpdatingStatus || isAddingTracking,
  }
}
```

---

## 6. Implementation Plan

### Phase 1: Backend (Days 1-2)
- [ ] Create migration for missing Order fields
- [ ] Update Order entity
- [ ] Create OrderDTOs
- [ ] Add service methods
- [ ] Add controller endpoints
- [ ] Test with Postman

### Phase 2: Frontend Foundation (Days 3-4)
- [ ] Add order types
- [ ] Update API methods
- [ ] Create useOrderActions hook
- [ ] Create useOrderDetails hook

### Phase 3: UI Components (Days 5-6)
- [ ] Create OrderHeader component
- [ ] Create OrderProducts component
- [ ] Create OrderActions component
- [ ] Create OrderTimeline component (status history)
- [ ] Update orders list page
- [ ] Create order detail page

### Phase 4: Testing (Days 7-8)
- [ ] Unit tests
- [ ] RBAC tests
- [ ] Integration tests

---

## 7. Testing Requirements

### RBAC Tests
```typescript
describe('Order RBAC', () => {
  it('should allow customer to view own orders only', () => {})
  it('should deny customer from viewing other orders', () => {})
  it('should allow sales rep to view assigned orders', () => {})
  it('should allow sales rep to confirm payment on assigned orders', () => {})
  it('should deny sales rep from fulfillment actions', () => {})
  it('should allow fulfillment to update status', () => {})
  it('should allow sales manager to view all orders', () => {})
})
```

---

## 8. Success Criteria

- [ ] Customers can view own orders with status
- [ ] Sales reps can confirm payment for assigned orders
- [ ] Fulfillment can update status and add tracking
- [ ] Sales managers can view and manage all orders
- [ ] All status transitions are validated
- [ ] RBAC enforced at API and UI levels
- [ ] Tests passing (95%+ coverage)

