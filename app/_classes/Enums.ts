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
 * Status of quote requests (RFQs).
 * 
 * **Status Flow (per business_flow.md):**
 * 1. Unread (0) - Initial state when customer submits quote
 * 2. Read (1) - Staff has reviewed the quote
 * 3. Approved (2) - Staff approved pricing, quote sent to customer
 * 4. Converted (3) - Customer accepted, quote converted to order
 * 5. Rejected (4) - Quote declined by staff or customer
 * 6. Expired (5) - Quote passed validity period without action
 * 
 * **Backend Alignment:** Matches server/Entities/Quote.cs QuoteStatus enum
 */
export enum QuoteStatus {
	/** Initial state - quote request submitted (value: 0) */
	Unread = 0,
	/** Staff reviewed quote request (value: 1) */
	Read = 1,
	/** Staff approved pricing, quote sent to customer (value: 2) */
	Approved = 2,
	/** Customer accepted, quote converted to order (value: 3) */
	Converted = 3,
	/** Quote declined by staff or customer (value: 4) */
	Rejected = 4,
	/** Quote passed validity period without action (value: 5) */
	Expired = 5,
}

/**
 * QuotePriority Enum
 * 
 * Priority levels for quote processing per business_flow.md.
 * Determines response time SLA for sales team.
 * 
 * **Priority Levels:**
 * - Standard (0): Within 48 hours
 * - High (1): Within 24 hours (order value $5k-$10k or repeat customer)
 * - Urgent (2): Within 4 hours (order value >$10k or customer-marked urgent)
 * 
 * **Backend Alignment:** Matches server/Entities/Quote.cs QuotePriority enum
 */
export enum QuotePriority {
	/** Standard processing - within 48 hours (value: 0) */
	Standard = 0,
	/** High priority - within 24 hours (value: 1) */
	High = 1,
	/** Urgent - within 4 hours (value: 2) */
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
 * AccountRole Enum
 * 
 * User role levels with role-based access control (RBAC).
 * Determines user permissions and accessible features.
 * 
 * **Roles:**
 * - **Customer (0)**: Regular users who place orders and request quotes
 * - **Admin (9999999)**: Full system access, can manage all entities
 * 
 * **Usage:**
 * - Navigation filtering: `NavigationService.getNavigationSections(userRole)`
 * - Route protection: Middleware checks user role
 * - Feature gating: Show/hide features based on role
 */
export enum AccountRole {
	/** Regular customer user (value: 0) */
	Customer,
	/** Administrator with full access (value: 9999999) */
	Admin = 9999999,
}

/**
 * AccountStatus Enum
 * 
 * Account status levels for user account management.
 * Determines whether an account can access the system.
 * 
 * **Statuses:**
 * - **Active (0)**: Account is active and can access all features
 * - **Suspended (1)**: Account temporarily suspended, cannot login
 * - **Deactivated (2)**: Account permanently deactivated
 * - **PendingVerification (3)**: Account awaiting email/license verification
 * 
 * **Usage:**
 * - Login validation: Check status before allowing authentication
 * - Admin management: Suspend/deactivate problematic accounts
 * - Compliance: Track account status for audit trails
 * 
 * @example
 * ```typescript
 * import { AccountStatus } from '@_classes/Enums';
 * 
 * if (user.status === AccountStatus.Suspended) {
 *   // Show suspended message, prevent login
 * }
 * ```
 */
export enum AccountStatus {
	/** Account is active and operational */
	Active = 0,
	/** Account temporarily suspended (can be reactivated) */
	Suspended = 1,
	/** Account permanently deactivated */
	Deactivated = 2,
	/** Account pending email or license verification */
	PendingVerification = 3,
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
 * 4. **Processing (400)**: Order being prepared for shipment
 * 5. **Shipped (500)**: Order in transit to customer
 * 6. **Delivered (600)**: Order received by customer
 * 7. **Cancelled (0)**: Order cancelled (lowest value for filtering)
 * 
 * **Numeric Values:**
 * - Used for sorting (ascending = oldest to newest stage)
 * - Used for filtering (e.g., "show all orders from Placed to Delivered")
 * - Enables status range queries in FinanceSearchFilter
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
