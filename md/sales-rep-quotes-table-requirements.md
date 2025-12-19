# Sales Rep Quotes Table Requirements

## Executive Summary

Based on analysis of `business_flow.md`, industry best practices for sales CRM systems, and the consultative sales model of MedSource Pro, this document outlines what a **Sales Representative** should see in the Quotes table on their dashboard.

**Key Principle**: Sales reps need actionable, prioritized information to efficiently manage their quote pipeline, maintain customer relationships, and meet performance targets.

---

## Current State vs. Required State

### Current Implementation (Admin View)
The current `QuotesDataGrid` component shows:
- Quote ID
- Company Name
- Email
- Phone
- Status (Read/Unread)
- Requested Date
- Actions (View, Delete)

**Missing for Sales Reps:**
- Assignment information
- Priority indicators
- Aging/SLA tracking
- Customer relationship context
- Quote value/items count
- Performance metrics
- Actionable status indicators

---

## Required Columns for Sales Rep Dashboard

### 1. **Quote ID / Quote Number** ✅ (Keep)
- **Purpose**: Unique identifier for reference
- **Display**: Shortened GUID or sequential quote number
- **Action**: Clickable link to quote details
- **Priority**: High

### 2. **Company Name** ✅ (Keep)
- **Purpose**: Identify the customer
- **Display**: Full company name
- **Enhancement**: Add indicator if returning customer (e.g., badge/icon)
- **Priority**: High

### 3. **Contact Information** (Enhanced)
- **Current**: Email, Phone (separate columns)
- **Recommended**: Combine into single "Contact" column with expandable details
- **Additional**: Show contact name if available
- **Priority**: Medium

### 4. **Status** ✅ (Enhanced)
- **Current**: Simple Read/Unread badge
- **Required**: Full status lifecycle with color coding:
  - **Unread** (Red/Warning) - Needs immediate attention
  - **Read** (Yellow/Info) - In progress, awaiting pricing
  - **Approved** (Blue/Info) - Ready to send to customer
  - **Sent** / **WaitingCustomerApproval** (Purple/Info) - Awaiting customer response
  - **Converted** (Green/Success) - Successfully converted to order
  - **Rejected** (Gray/Neutral) - Declined
  - **Expired** (Red/Error) - Past validity date
- **Priority**: Critical

### 5. **Priority** ⚠️ (NEW - Critical)
- **Purpose**: Help sales rep prioritize workload
- **Display**: Badge with icon
  - **Urgent** (Red) - Order value >$10k or customer-marked urgent (SLA: 4 hours)
  - **High** (Orange) - Order value $5k-$10k or repeat customer (SLA: 24 hours)
  - **Standard** (Gray) - Default (SLA: 48 hours)
- **Business Logic**: Based on order value and customer relationship (per `business_flow.md` Section 2.2)
- **Priority**: Critical

### 6. **Assigned To** ⚠️ (NEW - Critical)
- **Purpose**: Show quote ownership
- **Display**: 
  - Sales rep name (if assigned)
  - "Unassigned" badge (if not assigned - allows self-assignment)
  - "Me" indicator if viewing own quotes
- **Action**: Click to reassign (if manager) or claim (if unassigned)
- **Priority**: Critical

### 7. **Items / Products Count** ⚠️ (NEW - High)
- **Purpose**: Quick assessment of quote complexity
- **Display**: "X items" or "X products"
- **Tooltip**: Show product names on hover
- **Priority**: High

### 8. **Estimated Value** ⚠️ (NEW - High)
- **Purpose**: Prioritize high-value quotes, track revenue pipeline
- **Display**: 
  - "$X,XXX" if pricing entered
  - "Pending" if not yet priced
  - "TBD" if vendor pricing not received
- **Sortable**: Yes
- **Priority**: High

### 9. **Requested Date** ✅ (Keep)
- **Purpose**: Track quote age and SLA compliance
- **Display**: Formatted date (e.g., "Jan 15, 2024")
- **Enhancement**: Show relative time (e.g., "2 days ago")
- **Priority**: High

### 10. **Age / SLA Status** ⚠️ (NEW - Critical)
- **Purpose**: Identify quotes approaching or exceeding SLA
- **Display**: 
  - **Green**: Within SLA (e.g., "2h ago" for Urgent, "12h ago" for High)
  - **Yellow**: Approaching SLA (e.g., "3h ago" for Urgent)
  - **Red**: Exceeded SLA (e.g., "5h ago" for Urgent)
- **Format**: "X hours/days ago" with color coding
- **Business Logic**: Based on priority SLA (Urgent: 4h, High: 24h, Standard: 48h)
- **Priority**: Critical

### 11. **Customer Type** ⚠️ (NEW - Medium)
- **Purpose**: Identify relationship context
- **Display**: Badge
  - **New Customer** (Blue) - First quote
  - **Returning Customer** (Green) - Has order history
  - **Primary Account** (Gold) - Assigned as primary sales rep's customer
- **Priority**: Medium

### 12. **Last Activity** ⚠️ (NEW - Medium)
- **Purpose**: Track quote progress and identify stale quotes
- **Display**: 
  - "Updated X hours ago"
  - "No activity" if stale (>3 days)
- **Tooltip**: Show last action taken (e.g., "Pricing entered", "Sent to customer")
- **Priority**: Medium

### 13. **Valid Until** ⚠️ (NEW - Medium)
- **Purpose**: Track quote expiration
- **Display**: 
  - Date if set (default: 30 days from creation)
  - "Expires in X days" with warning if <3 days
  - "Expired" badge if past date
- **Priority**: Medium

### 14. **Actions** ✅ (Enhanced)
- **Current**: View, Delete
- **Required for Sales Rep**:
  - **View** (Eye icon) - View quote details
  - **Claim** (if unassigned) - Assign to self
  - **Edit** (if in progress) - Update pricing/notes
  - **Send** (if approved) - Send quote to customer
  - **Convert** (if accepted) - Convert to order
  - **Add Note** (always) - Add internal note
  - **Escalate** (if needed) - Escalate to manager
- **Priority**: High

---

## Filtering & Sorting Requirements

### Default View
- **Filter**: Show only quotes assigned to current sales rep
- **Sort**: Priority (Urgent → High → Standard), then Age (oldest first)
- **Status Filter**: Active quotes only (exclude Converted, Rejected, Expired)

### Available Filters
1. **Status** (Multi-select)
   - Unread, Read, Approved, Sent, Converted, Rejected, Expired
2. **Priority** (Multi-select)
   - Urgent, High, Standard
3. **Customer Type**
   - New, Returning, Primary Account
4. **Age/SLA**
   - Within SLA, Approaching SLA, Exceeded SLA
5. **Date Range**
   - Requested date, Last activity date
6. **Value Range**
   - Estimated quote value
7. **Assigned To**
   - Me, Unassigned, Specific rep (if manager view)

### Sorting Options
- Priority (default)
- Age (oldest first - default for priority groups)
- Estimated Value (high to low)
- Requested Date (newest/oldest)
- Last Activity (most recent first)

---

## Visual Indicators & UX Enhancements

### Color Coding
- **Status Colors**:
  - Unread: Red/Warning (needs attention)
  - Read: Yellow/Info (in progress)
  - Approved: Blue/Info (ready to send)
  - Sent: Purple/Info (awaiting customer)
  - Converted: Green/Success (completed)
  - Rejected: Gray/Neutral
  - Expired: Red/Error

- **Priority Colors**:
  - Urgent: Red background/border
  - High: Orange background/border
  - Standard: Gray/neutral

- **SLA Status**:
  - Within SLA: Green text
  - Approaching SLA: Yellow text
  - Exceeded SLA: Red text with alert icon

### Row Highlighting
- **Urgent quotes**: Red border or background tint
- **Exceeded SLA**: Pulsing red border or alert icon
- **My quotes**: Subtle highlight (e.g., light blue background)
- **New quotes**: "New" badge

### Quick Actions (Row-Level)
- **Hover Actions**: Show quick action buttons on row hover
- **Bulk Actions**: Select multiple quotes for bulk operations (assign, update status)

---

## Business Logic Requirements

### Assignment Rules (per `business_flow.md` Section 2.2)
1. **Primary Sales Rep** (Highest Priority)
   - If customer has existing relationship → Always assign to primary sales rep
   - Display: "Primary Account" badge

2. **Referral-Based**
   - If quote has `referredBy` field → Assign to referred sales rep
   - Display: "Referred" indicator

3. **Territory-Based**
   - If customer location matches sales rep territory → Suggest assignment
   - Display: Territory match indicator

4. **Workload-Based**
   - If no other rules match → Round-robin or workload-based assignment
   - Display: "Auto-assigned" indicator

### Status Workflow (per `business_flow.md` Section 1.5)
1. **Unread** → Sales rep reviews quote
2. **Read** → Sales rep takes ownership, gets vendor pricing
3. **Approved** → Pricing approved, ready to send
4. **Sent** / **WaitingCustomerApproval** → Sent to customer
5. **Converted** → Customer accepted, converted to order
6. **Rejected** → Declined
7. **Expired** → Past validity date

### SLA Tracking (per `business_flow.md` Section 2.2)
- **Urgent**: 4 hours response time
- **High**: 24 hours response time
- **Standard**: 48 hours response time

---

## Performance Metrics Integration

### Per-Quote Metrics (Display in Tooltip or Detail View)
- **Response Time**: Time from creation to "Read" status
- **Processing Time**: Time from "Read" to "Approved"
- **Customer Response Time**: Time from "Sent" to "Converted"
- **Total Cycle Time**: Time from creation to conversion

### Dashboard Summary (Above Table)
- **Active Quotes**: Count of assigned quotes (by status)
- **SLA Compliance**: Percentage of quotes within SLA
- **Average Response Time**: Average time to mark as "Read"
- **Conversion Rate**: Percentage of quotes converted to orders
- **Pipeline Value**: Sum of estimated values for active quotes

---

## Industry Best Practices Applied

### 1. **Sales Pipeline Management**
- Clear status progression (Kanban-style visualization option)
- Priority-based sorting (focus on high-value, urgent quotes)
- Aging indicators (prevent quotes from getting stale)

### 2. **Customer Relationship Management (CRM)**
- Customer type indicators (new vs. returning)
- Primary account highlighting
- Contact information readily available

### 3. **Performance Optimization**
- Quick filters for common views (My Quotes, Urgent, Exceeded SLA)
- Bulk actions for efficiency
- Keyboard shortcuts for power users

### 4. **Workload Management**
- Visual indicators for workload distribution
- SLA tracking to prevent bottlenecks
- Assignment transparency

### 5. **Data-Driven Decisions**
- Estimated value for revenue forecasting
- Conversion tracking for performance metrics
- Activity timestamps for accountability

---

## Implementation Priority

### Phase 1: Critical (MVP for Sales Reps)
1. ✅ Status column (enhanced with full lifecycle)
2. ⚠️ Priority column (NEW)
3. ⚠️ Assigned To column (NEW)
4. ⚠️ Age/SLA Status column (NEW)
5. ✅ Actions column (enhanced)

### Phase 2: High Priority
6. ⚠️ Items/Products Count (NEW)
7. ⚠️ Estimated Value (NEW)
8. ⚠️ Customer Type indicator (NEW)
9. Enhanced filtering and sorting

### Phase 3: Nice to Have
10. ⚠️ Last Activity (NEW)
11. ⚠️ Valid Until (NEW)
12. Advanced visual indicators
13. Bulk actions
14. Performance metrics integration

---

## Example Table Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Sales Rep Quotes Dashboard                                    [Filters ▼]    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Active Quotes: 12 | SLA Compliance: 92% | Pipeline Value: $45,230          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│ ┌──────┬──────────────┬──────────┬─────────┬──────────┬────────┬────────┐│
│ │Quote │ Company      │ Status   │ Priority│ Assigned │ Age    │ Value   ││
│ ├──────┼──────────────┼──────────┼─────────┼──────────┼────────┼────────┤│
│ │#1234 │ City Hospital│ Unread   │ 🔴Urgent│ Me       │ 3h ago │ $12,500││
│ │      │              │          │         │          │ ⚠️     │         ││
│ ├──────┼──────────────┼──────────┼─────────┼──────────┼────────┼────────┤│
│ │#1233 │ Regional Med │ Read     │ 🟠High  │ Me       │ 1d ago │ $8,200 ││
│ │      │ [Returning]  │          │         │          │ ✅     │         ││
│ ├──────┼──────────────┼──────────┼─────────┼──────────┼────────┼────────┤│
│ │#1232 │ Clinic ABC   │ Approved │ ⚪Std   │ Me       │ 2d ago │ $3,100 ││
│ │      │              │          │         │          │ ✅     │         ││
│ └──────┴──────────────┴──────────┴─────────┴──────────┴────────┴────────┘│
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary

A sales rep's Quotes table should provide:

1. **Actionable Information**: Clear status, priority, and SLA indicators
2. **Ownership Clarity**: Know which quotes are assigned to them
3. **Prioritization Tools**: Priority and age indicators to focus on urgent items
4. **Customer Context**: Relationship indicators and contact information
5. **Performance Visibility**: Value tracking and conversion metrics
6. **Efficiency Tools**: Quick filters, sorting, and bulk actions

This aligns with the consultative sales model where sales reps need to:
- Maintain customer relationships (primary account indicators)
- Respond quickly (SLA tracking)
- Prioritize effectively (priority and value indicators)
- Track performance (conversion and revenue metrics)

---

## References

- `business_flow.md` Section 1.5 - Sales Team Management
- `business_flow.md` Section 2.2 - Quote Assignment Workflows
- `business_flow.md` Section 6.1 - Sales Team Management System (Missing Features)
- Current implementation: `client/app/app/quotes/_components/QuotesDataGrid.tsx`
- Quote entity: `server/Entities/Quote.cs` and `client/app/_classes/Quote.ts`



