# MedSource Pro E2E Test Completion Guide

**Date:** January 15, 2026
**Purpose:** Prove MVP readiness by testing EVERY user story for EVERY role
**Goal:** Contracts are being signed - validate the full order lifecycle works flawlessly

---

## Test Accounts

| Email                              | Password                 | Role                    | Level |
| ---------------------------------- | ------------------------ | ----------------------- | ----- |
| jcbtechs@gmail.com                 | Medsource1998!           | Super-Admin             | 9999  |
| admin-tester@medsource.com         | AdminTester2026!!        | Admin                   | 5000  |
| sales-manager-tester@medsource.com | SalesManagerTester2026!! | Sales Manager           | 4000  |
| sales-person-tester@medsource.com  | SalesPersonTester2026!!  | Sales Person            | 3000  |
| qa-tester@medsource.com            | QaTester2026!!           | Fulfillment Coordinator | 2000  |
| customer-tester@medsource.com      | CustomerTester2026!!     | Customer                | 1000  |

---

## MVP Feature Test Coverage

These tests validate the core features promised in the business plan.

### 1. Advanced Pricing Engine (Business Differentiator)

| ID    | Test                                                                | Actor     | Route                             | Priority |
| ----- | ------------------------------------------------------------------- | --------- | --------------------------------- | -------- |
| PE-01 | Price list displays products with base prices                       | Admin     | `/app/pricing`                    | P0       |
| PE-02 | Can create new price list with effective dates                      | Admin     | `/app/pricing/price-lists/create` | P0       |
| PE-03 | Volume tiers apply correct discount (qty 10+ = 5% off)              | Sales Rep | `/app/quotes/[id]`                | P0       |
| PE-04 | Contract pricing shows customer-specific price                      | Sales Rep | `/app/quotes/[id]`                | P0       |
| PE-05 | Margin indicator shows green (20%+), yellow (10-20%), red (<10%)    | Sales Rep | `/app/quotes/[id]`                | P0       |
| PE-06 | Margin protection prevents pricing below cost                       | Sales Rep | `/app/quotes/[id]`                | P0       |
| PE-07 | "Apply Suggested" button uses engine-calculated price               | Sales Rep | `/app/quotes/[id]`                | P1       |
| PE-08 | Price breakdown shows waterfall (Base → Contract → Volume → Margin) | Sales Rep | `/app/quotes/[id]`                | P1       |
| PE-09 | Pricing audit log records all price changes                         | Admin     | `/app/pricing`                    | P1       |
| PE-10 | Customer CANNOT see vendor cost or margin data                      | Customer  | `/app/orders/[id]`                | P0       |

### 2. Inventory Management (MVP Feature)

| ID     | Test                                                       | Actor       | Route              | Priority |
| ------ | ---------------------------------------------------------- | ----------- | ------------------ | -------- |
| INV-01 | Product shows current stock (on-hand, reserved, available) | Admin       | Product detail     | P0       |
| INV-02 | Quote creation reserves inventory                          | Sales Rep   | `/app/quotes/[id]` | P0       |
| INV-03 | Order placement deducts from available                     | System      | Order flow         | P0       |
| INV-04 | Order cancellation releases reservation                    | Sales Rep   | `/app/orders/[id]` | P0       |
| INV-05 | Low stock alert shows when below reorder point             | Admin       | Dashboard          | P1       |
| INV-06 | Fulfillment shipping deducts from on-hand                  | Fulfillment | `/app/orders/[id]` | P0       |
| INV-07 | Inventory transaction history shows audit trail            | Admin       | Inventory detail   | P1       |

### 3. Payment Processing (MVP Feature)

| ID     | Test                                             | Actor       | Route              | Priority |
| ------ | ------------------------------------------------ | ----------- | ------------------ | -------- |
| PAY-01 | Customer can pay via credit card (Stripe)        | Customer    | Checkout           | P0       |
| PAY-02 | Order shows payment status (Pending → Paid)      | Sales Rep   | `/app/orders/[id]` | P0       |
| PAY-03 | Sales rep can record manual payment (check/wire) | Sales Rep   | `/app/orders/[id]` | P0       |
| PAY-04 | Payment confirmation timestamp displays          | Fulfillment | `/app/fulfillment` | P0       |
| PAY-05 | Refund can be processed (full or partial)        | Admin       | `/app/orders/[id]` | P1       |
| PAY-06 | B2B payment terms show on invoice (Net 30, etc.) | Customer    | Invoice view       | P1       |

### 4. Shipping Integration (MVP Feature)

| ID      | Test                                      | Actor       | Route              | Priority |
| ------- | ----------------------------------------- | ----------- | ------------------ | -------- |
| SHIP-01 | Order shows shipping status               | Customer    | `/app/orders/[id]` | P0       |
| SHIP-02 | Fulfillment can add tracking number       | Fulfillment | `/app/orders/[id]` | P0       |
| SHIP-03 | Tracking link is clickable/valid          | Customer    | `/app/orders/[id]` | P1       |
| SHIP-04 | Shipping rate displays at checkout        | Customer    | Checkout           | P1       |
| SHIP-05 | Multiple carriers available for selection | Fulfillment | `/app/orders/[id]` | P2       |

### 5. Analytics Dashboard (Phase 1 Feature)

| ID    | Test                                      | Actor         | Route            | Priority |
| ----- | ----------------------------------------- | ------------- | ---------------- | -------- |
| AN-01 | Customer sees their spending summary      | Customer      | `/app/analytics` | P1       |
| AN-02 | Sales Rep sees their pipeline/performance | Sales Rep     | `/app/analytics` | P0       |
| AN-03 | Manager sees team leaderboard             | Sales Manager | `/app/analytics` | P0       |
| AN-04 | Admin sees revenue timeline chart         | Admin         | `/app/analytics` | P0       |
| AN-05 | Time range picker filters data correctly  | All roles     | `/app/analytics` | P1       |

---

## Role-Based User Stories

### Customer (Level 1000)

| ID   | User Story                           | Priority | Route              |
| ---- | ------------------------------------ | -------- | ------------------ |
| C-01 | Can log in with valid credentials    | P0       | Login modal        |
| C-02 | Can browse product catalog           | P0       | `/store`           |
| C-03 | Can add products to cart             | P0       | `/store`, `/cart`  |
| C-04 | Can view cart and update quantities  | P0       | `/cart`            |
| C-05 | Can complete checkout with payment   | P0       | Checkout flow      |
| C-06 | Can view order history               | P0       | `/app/orders`      |
| C-07 | Can view order details and status    | P0       | `/app/orders/[id]` |
| C-08 | Can track shipment via tracking link | P1       | `/app/orders/[id]` |
| C-09 | CANNOT see vendor cost or margins    | P0       | Security check     |
| C-10 | CANNOT see other customers' orders   | P0       | Security check     |

### Sales Person (Level 3000)

| ID    | User Story                             | Priority | Route              |
| ----- | -------------------------------------- | -------- | ------------------ |
| SR-01 | Can log in and see sales dashboard     | P0       | `/app/dashboard`   |
| SR-02 | Can view assigned quotes               | P0       | `/app/quotes`      |
| SR-03 | Can create new quote with products     | P0       | `/app/quotes`      |
| SR-04 | Can edit vendor cost per product       | P0       | `/app/quotes/[id]` |
| SR-05 | Can edit customer price per product    | P0       | `/app/quotes/[id]` |
| SR-06 | Can see calculated margins (real-time) | P0       | `/app/quotes/[id]` |
| SR-07 | Can submit quote for approval          | P0       | `/app/quotes/[id]` |
| SR-08 | Can view assigned orders               | P0       | `/app/orders`      |
| SR-09 | Can confirm payment (Placed → Paid)    | P0       | `/app/orders/[id]` |
| SR-10 | Can record manual payment              | P0       | `/app/orders/[id]` |
| SR-11 | CANNOT see other reps' quotes          | P0       | Security check     |
| SR-12 | CANNOT access fulfillment queue        | P0       | Access denied      |

### Sales Manager (Level 4000)

| ID    | User Story                              | Priority | Route              |
| ----- | --------------------------------------- | -------- | ------------------ |
| SM-01 | Can log in and see manager dashboard    | P0       | `/app/dashboard`   |
| SM-02 | Can access approval queue               | P0       | `/app/approvals`   |
| SM-03 | Can see all pending approvals           | P0       | `/app/approvals`   |
| SM-04 | Can review quote with pricing breakdown | P0       | `/app/quotes/[id]` |
| SM-05 | Can approve quotes                      | P0       | `/app/quotes/[id]` |
| SM-06 | Can reject quotes with reason           | P0       | `/app/quotes/[id]` |
| SM-07 | Can view all team quotes                | P0       | `/app/quotes`      |
| SM-08 | Can view all team orders                | P0       | `/app/orders`      |
| SM-09 | Can override pricing (audit logged)     | P1       | `/app/quotes/[id]` |
| SM-10 | Can cancel orders                       | P1       | `/app/orders/[id]` |
| SM-11 | Can view team analytics/leaderboard     | P0       | `/app/analytics`   |

### Fulfillment Coordinator (Level 2000)

| ID    | User Story                                        | Priority | Route              |
| ----- | ------------------------------------------------- | -------- | ------------------ |
| FC-01 | Can log in and see fulfillment dashboard          | P0       | `/app/dashboard`   |
| FC-02 | Can access fulfillment queue                      | P0       | `/app/fulfillment` |
| FC-03 | Can see orders ready for processing (Paid status) | P0       | `/app/fulfillment` |
| FC-04 | Can view order details with items                 | P0       | `/app/orders/[id]` |
| FC-05 | Can mark order as processing                      | P0       | `/app/orders/[id]` |
| FC-06 | Can add tracking number                           | P0       | `/app/orders/[id]` |
| FC-07 | Can mark order as shipped                         | P0       | `/app/orders/[id]` |
| FC-08 | Can mark order as delivered                       | P0       | `/app/orders/[id]` |
| FC-09 | CANNOT confirm payments                           | P0       | Security check     |
| FC-10 | CANNOT see vendor costs or margins                | P0       | Security check     |
| FC-11 | CANNOT access approval queue                      | P0       | Access denied      |

### Admin (Level 5000)

| ID   | User Story                         | Priority | Route                  |
| ---- | ---------------------------------- | -------- | ---------------------- |
| A-01 | Can log in and see admin dashboard | P0       | `/app/dashboard`       |
| A-02 | Can view all users (accounts)      | P0       | `/app/accounts`        |
| A-03 | Can create new users               | P0       | `/app/accounts/create` |
| A-04 | Can edit user details              | P0       | `/app/accounts/[id]`   |
| A-05 | Can change user roles              | P0       | `/app/accounts/[id]`   |
| A-06 | Can deactivate users               | P0       | `/app/accounts/[id]`   |
| A-07 | Can view all customers             | P0       | `/app/customers`       |
| A-08 | Can create new customers           | P0       | `/app/customers`       |
| A-09 | Can edit customer details          | P0       | `/app/customers/[id]`  |
| A-10 | Can manage RBAC settings           | P0       | `/app/rbac`            |
| A-11 | Can view analytics                 | P0       | `/app/analytics`       |
| A-12 | Can manage price lists             | P0       | `/app/pricing`         |
| A-13 | Can process refunds                | P1       | `/app/orders/[id]`     |
| A-14 | CANNOT access tenant management    | P0       | Access denied          |

### Super-Admin (Level 9999)

| ID    | User Story                                | Priority | Route                |
| ----- | ----------------------------------------- | -------- | -------------------- |
| SA-01 | Can log in with full navigation           | P0       | `/app/dashboard`     |
| SA-02 | Can access tenant management page         | P0       | `/app/admin/tenants` |
| SA-03 | Has access to all features of lower roles | P0       | All routes           |
| SA-04 | Can view system-wide settings             | P0       | Settings             |

---

## Critical Business Flows (Integration Tests)

### Flow 1: Complete Quote → Order → Payment → Fulfillment Cycle

This is the **CORE BUSINESS FLOW** that must work flawlessly.

| Step | Actor         | Action                               | Validation                              |
| ---- | ------------- | ------------------------------------ | --------------------------------------- |
| 1    | Customer      | Browses store, adds products to cart | Cart shows items                        |
| 2    | Customer      | Requests quote                       | Quote created with status "Draft"       |
| 3    | Sales Rep     | Opens quote, sees products           | Quote visible in rep's queue            |
| 4    | Sales Rep     | Sets vendor cost per product         | Vendor cost saved                       |
| 5    | Sales Rep     | Sets customer price per product      | Customer price saved, margin calculated |
| 6    | Sales Rep     | Verifies margin meets minimum        | Margin indicator is green/yellow        |
| 7    | Sales Rep     | Submits for approval                 | Status changes to "Pending Approval"    |
| 8    | Sales Manager | Sees quote in approval queue         | Quote visible at `/app/approvals`       |
| 9    | Sales Manager | Reviews pricing and margins          | All pricing data visible                |
| 10   | Sales Manager | Approves quote                       | Status changes to "Approved"            |
| 11   | Sales Rep     | Sends quote to customer              | Customer notified                       |
| 12   | Customer      | Accepts quote                        | Order created with status "Placed"      |
| 13   | Customer      | Completes payment (Stripe)           | Payment successful                      |
| 14   | Sales Rep     | Confirms payment received            | Order status → "Paid"                   |
| 15   | Fulfillment   | Sees order in fulfillment queue      | Order visible at `/app/fulfillment`     |
| 16   | Fulfillment   | Marks as processing                  | Status → "Processing"                   |
| 17   | Fulfillment   | Adds tracking number                 | Tracking saved                          |
| 18   | Fulfillment   | Marks as shipped                     | Status → "Shipped", inventory deducted  |
| 19   | Customer      | Views order with tracking            | Tracking link visible                   |
| 20   | Fulfillment   | Marks as delivered                   | Status → "Delivered"                    |
| 21   | Customer      | Sees completed order                 | Final status confirmed                  |

### Flow 2: Quote Rejection Flow

| Step | Actor         | Action                               | Validation                        |
| ---- | ------------- | ------------------------------------ | --------------------------------- |
| 1    | Sales Rep     | Creates and submits quote            | Quote pending approval            |
| 2    | Sales Manager | Rejects with reason "Margin too low" | Status → "Rejected"               |
| 3    | Sales Rep     | Sees rejection reason                | Reason displayed                  |
| 4    | Sales Rep     | Adjusts pricing, resubmits           | Status → "Pending Approval" again |
| 5    | Sales Manager | Approves revised quote               | Status → "Approved"               |

### Flow 3: Inventory Reservation Flow

| Step | Actor       | Action                               | Validation                  |
| ---- | ----------- | ------------------------------------ | --------------------------- |
| 1    | Admin       | Checks product inventory (100 units) | Available: 100              |
| 2    | Sales Rep   | Creates quote for 20 units           | Reserved: 20, Available: 80 |
| 3    | Customer    | Accepts quote, order placed          | On-hand: 100, Reserved: 20  |
| 4    | Fulfillment | Ships order                          | On-hand: 80, Reserved: 0    |

### Flow 4: Payment and Refund Flow

| Step | Actor    | Action                        | Validation           |
| ---- | -------- | ----------------------------- | -------------------- |
| 1    | Customer | Places order, pays $500       | Payment status: Paid |
| 2    | Admin    | Processes partial refund $100 | Refund recorded      |
| 3    | Customer | Sees updated payment info     | Shows $400 net       |

---

## Security Tests (RBAC Enforcement)

| ID     | Test                                           | Expected Result             |
| ------ | ---------------------------------------------- | --------------------------- |
| SEC-01 | Customer tries `/app/quotes`                   | Access denied or empty list |
| SEC-02 | Customer tries `/app/approvals`                | Access denied               |
| SEC-03 | Customer tries `/app/fulfillment`              | Access denied               |
| SEC-04 | Customer tries `/app/accounts`                 | Access denied               |
| SEC-05 | Sales Rep tries `/app/fulfillment`             | Access denied               |
| SEC-06 | Sales Rep tries `/app/approvals`               | Access denied               |
| SEC-07 | Fulfillment tries `/app/approvals`             | Access denied               |
| SEC-08 | Fulfillment tries to see vendor cost           | Cost hidden                 |
| SEC-09 | Admin tries `/app/admin/tenants`               | Access denied               |
| SEC-10 | Sales Rep A tries to view Sales Rep B's quotes | Not visible                 |

---

## Test Priorities

### P0 - Must Pass (Contract Ready)

-   All 6 roles can log in
-   Complete quote→order→fulfillment cycle works
-   Pricing engine calculates correctly
-   Inventory tracks properly
-   Payments process successfully
-   RBAC enforces access correctly

### P1 - Should Pass (Business Quality)

-   Quote rejection/resubmission flow
-   Analytics dashboards show data
-   Audit trails recorded
-   Refund processing works
-   Tracking links functional

### P2 - Nice to Have (Polish)

-   Export functionality
-   Advanced filtering
-   Performance optimization

---

## Definition of Done

-   [ ] All 6 roles can log in successfully
-   [ ] All 6 roles see correct navigation for their level
-   [ ] **Full business cycle passes** (Quote → Approval → Order → Payment → Fulfillment)
-   [ ] Pricing engine: margins calculate, guardrails work
-   [ ] Inventory: reservations and deductions work
-   [ ] Payments: Stripe integration works
-   [ ] Shipping: tracking numbers save and display
-   [ ] Analytics: role-based views load with data
-   [ ] Security: all RBAC tests pass
-   [ ] 90%+ E2E test pass rate

---

## Test Execution Checklist

### Pre-Test Setup

-   [ ] Backend server running (localhost:5000 or production)
-   [ ] Frontend running (localhost:3000 or production)
-   [ ] Test data seeded (products, customers, users)
-   [ ] Stripe test mode configured

### Test Execution Order

1. [ ] Authentication tests (all 6 roles)
2. [ ] Navigation/access tests (RBAC)
3. [ ] Pricing engine tests
4. [ ] Quote workflow tests
5. [ ] Order management tests
6. [ ] Inventory tests
7. [ ] Payment tests
8. [ ] Fulfillment tests
9. [ ] Analytics tests
10. [ ] Full integration flow

---

**Last Updated:** January 15, 2026
**Based On:** Business_Plan_Prometheus.md (MVP features: Inventory, Payments, Shipping, Pricing Engine, Analytics)
