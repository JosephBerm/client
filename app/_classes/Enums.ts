/**
 * Application Enumerations
 * 
 * Centralized enumerations used throughout the MedSource Pro application.
 * Provides type-safe constants for business types, quote statuses, notification types,
 * user roles, order statuses, and route types.
 * 
 * **Enumerations:**
 * - **TypeOfBusiness**: Customer business categories
 * - **QuoteStatus**: Quote request statuses
 * - **NotificationType**: Notification severity levels
 * - **AccountRole**: User role levels
 * - **OrderStatus**: Order lifecycle statuses with numeric values
 * - **PublicRouteType**: Public-facing page types
 * - **InternalRouteType**: Protected app page types
 * 
 * **Benefits:**
 * - Type safety across the application
 * - Consistent naming and values
 * - IntelliSense support
 * - Easy refactoring
 * - Single source of truth
 * 
 * @example
 * ```typescript
 * import { OrderStatus, AccountRole, NotificationType } from '@_classes/Enums';
 * 
 * // Check order status
 * import { logger } from '@_core';
 * 
 * if (order.status === OrderStatus.Shipped) {
 *   logger.info('Order is on the way!');
 * }
 * 
 * // Check user role
 * if (user.role === AccountRole.Admin) {
 *   // Show admin features
 * }
 * 
 * // Create notification
 * const notification = new Notification({
 *   type: NotificationType.Success,
 *   message: 'Order placed successfully'
 * });
 * ```
 * 
 * @module Enums
 */

/**
 * TypeOfBusiness Enum
 * 
 * Categories of customer businesses.
 * Used to classify customer companies by their industry type.
 */
export enum TypeOfBusiness {
	/** Dental practice or clinic */
	Dentist,
	/** Outpatient surgery center */
	SurgeryCenter,
	/** Hospital or medical center */
	Hospital,
	/** Veterinary clinic or animal hospital */
	Veterinarian,
	/** Restaurant or food service establishment */
	Restaurant,
	/** Construction company or contractor */
	Construction,
	/** Other business type not listed */
	Other,
}

/**
 * QuoteStatus Enum
 * 
 * Status of quote requests (RFQs) throughout the lifecycle.
 * Per business_flow.md Quote Status Lifecycle.
 * 
 * **Status Flow:**
 * 1. Unread - Initial state when customer submits quote
 * 2. Read - Staff has reviewed the quote, takes ownership
 * 3. Approved - Pricing approved, quote sent to customer
 * 4. Converted - Customer accepted, quote converted to order
 * 5. Rejected - Quote declined by staff or customer
 * 6. Expired - Quote passed validity period without action
 * 
 * @see business_flow.md Quote Status Lifecycle
 */
export enum QuoteStatus {
	/** Initial state - quote request submitted */
	Unread = 0,
	/** Staff reviewed quote request */
	Read = 1,
	/** Staff approved pricing, quote sent to customer */
	Approved = 2,
	/** Customer accepted, quote converted to order */
	Converted = 3,
	/** Quote declined by staff or customer */
	Rejected = 4,
	/** Quote passed validity period without action */
	Expired = 5,
}

/**
 * QuotePriority Enum
 * 
 * Priority levels for quote processing based on order value
 * and customer relationship. Per business_flow.md.
 * 
 * **Priority Rules:**
 * - Urgent: Customer marked as urgent, or order value >$10,000 (4hr SLA)
 * - High: Order value $5,000-$10,000, or repeat customer (24hr SLA)
 * - Standard: Order value <$5,000 (48hr SLA)
 * 
 * @see business_flow.md Quote Priority Levels
 */
export enum QuotePriority {
	/** Standard processing - within 48 hours */
	Standard = 0,
	/** High priority - within 24 hours */
	High = 1,
	/** Urgent - within 4 hours */
	Urgent = 2,
}

/**
 * NotificationType Enum
 * 
 * Severity levels for user notifications.
 * Determines visual styling and importance of notifications.
 * 
 * **Types:**
 * - **Info**: General informational messages (blue)
 * - **Warning**: Important warnings requiring attention (yellow/orange)
 * - **Error**: Error or failure notifications (red)
 */
export enum NotificationType {
	/** General informational notification */
	Info,
	/** Warning notification requiring attention */
	Warning,
	/** Error or failure notification */
	Error,
}

/**
 * @deprecated Use usePermissions() hook for role-based checks instead.
 * Migration:
 * - OLD: if (user.role === AccountRole.Admin)
 * - NEW: const { isAdmin } = usePermissions(); if (isAdmin)
 *
 * These are FALLBACK values - actual values come from API.
 * Maintained for backward compatibility only.
 *
 * ⚠️  DRY EXCEPTION: Values duplicated for backward compatibility.
 * SYNC REQUIRED: If values change, also update:
 *   - @_types/rbac.ts (RoleLevels)
 *   - @_shared/constants/rbac-defaults.ts (DEFAULT_ROLE_THRESHOLDS)
 *   - server/appsettings.json (RBAC:Thresholds)
 */
export const AccountRole = {
	Customer: 1000,
	FulfillmentCoordinator: 2000,
	SalesRep: 3000,
	SalesManager: 4000,
	Admin: 5000,
	SuperAdmin: 9999,
} as const

/** @deprecated Use number type directly */
export type AccountRoleType = (typeof AccountRole)[keyof typeof AccountRole]

/**
 * AccountStatus Enum - UPDATED TO MATCH BACKEND (Phase 1)
 * 
 * Account lifecycle states that determine login eligibility and user access.
 * Values MUST match server/Entities/Account.cs AccountStatus enum exactly.
 * 
 * **State Machine:**
 * ```
 * PendingVerification (0) → Active (100) ⟷ Suspended (200)
 *                                   ↓              ↓
 *                              Locked (300) → Archived (400)
 *                                   ↓
 *                         ForcePasswordChange (150)
 * ```
 * 
 * **Login Eligibility:**
 * - ✅ Can Login: Active, ForcePasswordChange
 * - ❌ Cannot Login: PendingVerification, Suspended, Locked, Archived
 * 
 * @example
 * ```typescript
 * import { AccountStatus, canAccountLogin } from '@_classes/Enums';
 * 
 * if (!canAccountLogin(user.status)) {
 *   // Show appropriate modal based on status
 * }
 * ```
 */
export enum AccountStatus {
	/** Email not yet verified - cannot login */
	PendingVerification = 0,
	/** Fully operational account */
	Active = 100,
	/** Must change password on next login - can login but redirected */
	ForcePasswordChange = 150,
	/** Admin suspended - cannot login until reactivated */
	Suspended = 200,
	/** Auto-locked (5 failed attempts) - 30 min lockout */
	Locked = 300,
	/** Soft-deleted - cannot login, data preserved */
	Archived = 400,
}

/**
 * Get human-readable label for account status.
 * Used in badges, tables, and admin interfaces.
 */
export function getAccountStatusLabel(status: AccountStatus): string {
	const labels: Record<AccountStatus, string> = {
		[AccountStatus.PendingVerification]: 'Pending Verification',
		[AccountStatus.Active]: 'Active',
		[AccountStatus.ForcePasswordChange]: 'Password Change Required',
		[AccountStatus.Suspended]: 'Suspended',
		[AccountStatus.Locked]: 'Temporarily Locked',
		[AccountStatus.Archived]: 'Archived',
	}
	return labels[status] ?? 'Unknown'
}

/**
 * Check if account status allows login.
 * ForcePasswordChange allows login but requires immediate password change.
 */
export function canAccountLogin(status: AccountStatus): boolean {
	return status === AccountStatus.Active || status === AccountStatus.ForcePasswordChange
}

/**
 * Get status severity for UI styling (error, warning, success, neutral).
 */
export function getAccountStatusSeverity(status: AccountStatus): 'success' | 'warning' | 'error' | 'neutral' {
	switch (status) {
		case AccountStatus.Active:
			return 'success'
		case AccountStatus.PendingVerification:
		case AccountStatus.ForcePasswordChange:
			return 'warning'
		case AccountStatus.Suspended:
		case AccountStatus.Locked:
			return 'error'
		case AccountStatus.Archived:
			return 'neutral'
		default:
			return 'neutral'
	}
}

/**
 * CustomerStatus Enum
 * 
 * Customer/Company status levels for B2B customer lifecycle management.
 * Determines whether a customer organization can place orders.
 * 
 * **Statuses:**
 * - **Active (0)**: Customer is active and can place orders
 * - **Suspended (1)**: Temporarily suspended, cannot place orders
 * - **PendingVerification (2)**: Awaiting business/license verification
 * - **Inactive (3)**: No recent activity, may need re-engagement
 * - **Churned (4)**: Marked as lost customer
 * 
 * **Business Flow:**
 * - New customers start as PendingVerification until verified
 * - Active customers can place orders and request quotes
 * - Suspended customers retain account but cannot place orders
 * - Inactive customers may receive re-engagement campaigns
 * - Churned customers are archived for historical data
 * 
 * @example
 * ```typescript
 * import { CustomerStatus } from '@_classes/Enums';
 * 
 * if (customer.status === CustomerStatus.Active) {
 *   // Allow order placement
 * }
 * 
 * if (customer.status === CustomerStatus.PendingVerification) {
 *   // Show verification required message
 * }
 * ```
 */
export enum CustomerStatus {
	/** Customer is active and can place orders */
	Active = 0,
	/** Customer temporarily suspended */
	Suspended = 1,
	/** Pending business/license verification */
	PendingVerification = 2,
	/** No recent activity */
	Inactive = 3,
	/** Marked as lost customer */
	Churned = 4,
}

/**
 * OrderStatus Enum
 * 
 * Order lifecycle statuses with numeric values for sorting and filtering.
 * Higher values represent later stages in the order process.
 * 
 * **Order Lifecycle:**
 * 1. **Pending (100)**: Initial state, awaiting staff review
 * 2. **WaitingCustomerApproval (200)**: Quote sent, awaiting customer approval
 * 3. **Placed (300)**: Customer approved, order confirmed
 * 4. **Paid (350)**: Payment confirmed by sales rep
 * 5. **Processing (400)**: Order being prepared for shipment
 * 6. **Shipped (500)**: Order in transit to customer
 * 7. **Delivered (600)**: Order received by customer
 * 8. **Cancelled (0)**: Order cancelled (lowest value for filtering)
 * 
 * **Numeric Values:**
 * - Used for sorting (ascending = oldest to newest stage)
 * - Used for filtering (e.g., "show all orders from Placed to Delivered")
 * - Enables status range queries in FinanceSearchFilter
 * 
 * @see prd_orders.md - Order Management PRD
 */
export enum OrderStatus {
	/** Order cancelled (value: 0) */
	Cancelled = 0,
	/** Initial state, awaiting review (value: 100) */
	Pending = 100,
	/** Quote sent, awaiting customer approval (value: 200) */
	WaitingCustomerApproval = 200,
	/** Customer approved and placed order (value: 300) */
	Placed = 300,
	/** Payment confirmed by sales rep (value: 350) */
	Paid = 350,
	/** Order being prepared for shipment (value: 400) */
	Processing = 400,
	/** Order shipped and in transit (value: 500) */
	Shipped = 500,
	/** Order delivered to customer (value: 600) */
	Delivered = 600,
}

/**
 * PublicRouteType Enum
 * 
 * Public-facing website page types (no authentication required).
 * Used for routing and navigation on the marketing/public site.
 */
export enum PublicRouteType {
	/** Homepage */
	Home,
	/** About Us page */
	AboutUs,
	/** Public product catalog/store */
	Store,
	/** Contact form page */
	Contact,
}

/**
 * InternalRouteType Enum
 * 
 * Protected application page types (authentication required).
 * Used for routing and navigation in the /app/* protected area.
 */
export enum InternalRouteType {
	/** Dashboard homepage */
	Dashboard,
	/** Order management */
	Orders,
	/** Product/store management */
	Store,
	/** Quote management */
	Quotes,
	/** Provider/supplier management */
	Providers,
	/** User account management (admin only) */
	Accounts,
	/** Customer/company management */
	Customers,
	/** Financial analytics (admin only) */
	Analytics,
	/** User profile settings */
	Profile,
}

/**
 * Provider/Vendor status enumeration.
 * Follows industry best practices for vendor lifecycle management.
 * 
 * Status workflow: Active -> Suspended -> Archived
 * (Restore is possible at any step)
 * 
 * NOTE: Currently only Active and Archived are supported until
 * the database migration adds the Status column.
 */
export enum ProviderStatus {
	/** Provider is active and available for orders */
	Active = 0,
	/** Provider is temporarily suspended (compliance issues, performance concerns) */
	Suspended = 1,
	/** Provider is archived and no longer available */
	Archived = 2,
}