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
 * if (order.status === OrderStatus.Shipped) {
 *   console.log('Order is on the way!');
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
 * Tracks whether staff has reviewed the quote.
 * 
 * **Status Flow:**
 * 1. Unread - Initial state when customer submits quote
 * 2. Read - Staff has reviewed the quote
 */
export enum QuoteStatus {
	/** Quote has not been reviewed by staff */
	Unread,
	/** Quote has been reviewed by staff */
	Read,
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
 * Used for routing and navigation in the /medsource-app/* protected area.
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
