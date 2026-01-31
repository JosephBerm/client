/**
 * User Entity Classes
 * 
 * Represents user accounts in the MedSource Pro system with role-based access control.
 * Includes user profile data, authentication information, notifications, and relationships
 * to companies (customers) and orders.
 * 
 * **Features:**
 * - Role-based access (Customer, Admin)
 * - Profile information (name, email, phone, date of birth)
 * - Company/customer association
 * - Order history tracking
 * - Notification management
 * - Shipping address management
 * - Profile picture support
 * - Authentication credentials
 * 
 * **Related Entities:**
 * - Name: Structured name entity with formatting
 * - Company: Customer/company association
 * - Order: User's order history
 * - Notification: User notifications
 * - Address: Shipping details
 * 
 * **Classes:**
 * - User: Main user entity
 * - PasswordForm: Password change form model
 * - RegisterModel: User registration form model
 * 
 * @example
 * ```typescript
 * // Create a new user
 * const user = new User({
 *   username: 'johndoe',
 *   email: 'john@example.com',
 *   name: new Name({ first: 'John', last: 'Doe' }),
 *   roleLevel: 100, // Customer
 *   phone: '555-123-4567',
 *   dateOfBirth: new Date('1990-01-15')
 * });
 * 
 * // Update user details
 * user.updateDetails({ phone: '555-987-6543' });
 * 
 * // Add notification
 * user.addNotification(new Notification({
 *   title: 'Order Shipped',
 *   message: 'Your order #123 has been shipped'
 * }));
 * 
 * // Password change
 * const passwordForm = new PasswordForm({
 *   oldPassword: 'current123',
 *   newPassword: 'newSecure456!',
 *   confirmNewPassword: 'newSecure456!'
 * });
 * 
 * // Registration
 * const registration = new RegisterModel({
 *   username: 'janedoe',
 *   email: 'jane@example.com',
 *   password: 'SecurePass123!',
 *   name: new Name({ first: 'Jane', last: 'Doe' }),
 *   dateOfBirth: new Date('1992-05-20')
 * });
 * ```
 * 
 * @module User
 */

import { parseDateSafe, parseRequiredTimestamp } from '@_lib/dates'

import Address from '@_classes/common/Address'
import Name from '@_classes/common/Name'
import Company from '@_classes/Company'
import Notification from '@_classes/Notification'
import { AccountStatus, canAccountLogin } from '@_classes/Enums'

import Order from './Order'


// RichConstructor decorator not needed in modern Next.js

/**
 * User Entity Class
 * 
 * Main user account entity representing registered users in the system.
 * Handles authentication, profile data, role-based permissions, and relationships
 * to companies and orders.
 * 
 * **User Roles:**
 * - **Customer (0)**: Regular users who can place orders and request quotes
 * - **Admin (9999999)**: Full system access, can manage all entities
 */
export default class User {
	/** Unique identifier (readonly, set by backend) */
	public readonly id: string | null = null
	
	/** Username for login (unique) */
	public username: string = ''
	
	/** Password (hashed on backend, should not be exposed in responses) */
	public password: string = ''

	/** Array of user notifications */
	public notifications: Notification[] = []
	
	/** Email address (used for communication) */
	public email: string = ''
	
	/** User's full name (structured Name entity) */
	public name: Name = new Name()
	
	/** Date of birth (optional) */
	public dateOfBirth: Date | null | undefined = null
	
	/** Account creation timestamp */
	public createdAt: Date = new Date()

	/** Primary phone number (optional) */
	public phone?: string
	
	/** Mobile phone number (optional) */
	public mobile?: string
	
	/** Default shipping address (optional) */
	public shippingDetails?: Address  // Added for user shipping information

	/**
	 * User role level (numeric)
	 * WHITE-LABEL: Role levels are configurable via backend.
	 * @see usePermissions() hook for role checks
	 * @default null (Customer level assumed if null)
	 */
	public roleLevel: number | null = null

	/** Associated customer/company ID (GUID foreign key) */
	public customerId: string | null = null
	
	/** Associated customer/company object */
	public customer?: Company | null
	
	/** User's order history */
	public orders?: Order[] = []
	
	/** Path to profile picture file */
	public profilePicturePath?: string

	// ============================================================================
	// PHASE 1: ACCOUNT STATUS SYSTEM PROPERTIES
	// Backend-aligned properties from server/Entities/Account.cs
	// ============================================================================

	/**
	 * Account status (Phase 1)
	 * @see AccountStatus enum in Enums.ts
	 * @default AccountStatus.Active (100)
	 */
	public status: AccountStatus = AccountStatus.Active

	/**
	 * Number of consecutive failed login attempts (Phase 1)
	 * Increments on failed login, resets on successful login
	 * Account locks after 5 failed attempts
	 * @default 0
	 */
	public failedLoginAttempts: number = 0

	/**
	 * Timestamp when account will be automatically unlocked (Phase 1)
	 * Set to 30 minutes after account lockout
	 * @default null
	 */
	public lockedUntil: Date | string | null = null

	/**
	 * Timestamp of most recent successful login (Phase 1)
	 * Used for security audit and session management
	 * @default null
	 */
	public lastLoginAt: Date | string | null = null

	/**
	 * IP address of most recent successful login (Phase 1)
	 * Used for security audit and anomaly detection
	 * Max length: 45 characters (IPv6 support)
	 * @default null
	 */
	public lastLoginIP: string | null = null

	/**
	 * Reason for account suspension (Phase 1)
	 * Provided by admin when suspending account
	 * Displayed to user in suspension modal
	 * Max length: 500 characters
	 * @default null
	 */
	public suspensionReason: string | null = null

	/**
	 * Timestamp when account was archived (Phase 1)
	 * Archived accounts cannot login but data is preserved
	 * Used for compliance and data retention
	 * @default null
	 */
	public archivedAt: Date | string | null = null

	/**
	 * Flag indicating password change required on next login (Phase 1)
	 * Set by admin to force password reset
	 * User redirected to password change page after login
	 * @default false
	 */
	public forcePasswordChange: boolean = false

	/**
	 * Creates a new User instance.
	 * Deeply copies nested objects (name, notifications, orders, customer, address).
	 * Parses date strings to Date objects.
	 * 
	 * @param {Partial<IUser>} partial - Partial user data to initialize
	 * 
	 * @example
	 * ```typescript
	 * // Basic user
	 * const user = new User({
	 *   username: 'johndoe',
	 *   email: 'john@example.com',
	 *   name: new Name({ first: 'John', last: 'Doe' }),
	 *   roleLevel: 100 // Customer
	 * });
	 * 
	 * // Admin user with company
	 * const admin = new User({
	 *   username: 'admin',
	 *   email: 'admin@medsource.com',
	 *   name: new Name({ first: 'Admin', last: 'User' }),
	 *   roleLevel: 5000, // Admin
	 *   customer: new Company({ name: 'MedSource Pro' })
	 * });
	 * ```
	 */
	constructor(partial?: Partial<IUser>) {
		if (partial) {
			Object.assign(this, partial)
			
			// Deep copy notifications array
			if (partial.notifications) {
				this.notifications = partial.notifications.map((n) => new Notification(n))
			}
			
			// Deep copy name object
			if (partial.name) {
				this.name = new Name(partial.name)
			}
			
			// Parse date of birth from string if needed
			if (partial.dateOfBirth) {
				this.dateOfBirth = parseDateSafe(partial.dateOfBirth)
			}
			
			// Deep copy customer/company object
			if (partial.customer) {
				this.customer = new Company(partial.customer)
			}
			
			// Deep copy orders array
			if (partial.orders) {
				this.orders = partial.orders.map((o) => new Order(o))
			}
			
			// Deep copy shipping address
			if (partial.shippingDetails) {
				this.shippingDetails = new Address(partial.shippingDetails)
			}
			
			// Parse createdAt timestamp (consistent with other entities: Company, Order, Product, etc.)
			this.createdAt = parseRequiredTimestamp(partial.createdAt, 'User', 'createdAt')
		}
	}
	
	/**
	 * Updates user details with new values.
	 * Performs shallow merge of properties.
	 * 
	 * @param {Partial<IUser>} details - User properties to update
	 * 
	 * @example
	 * ```typescript
	 * user.updateDetails({
	 *   phone: '555-987-6543',
	 *   mobile: '555-123-4567',
	 *   email: 'newemail@example.com'
	 * });
	 * ```
	 */
	public updateDetails(details: Partial<IUser>): void {
		Object.assign(this, details)
	}

	/**
	 * Adds a notification to the user's notification list.
	 * 
	 * @param {Notification} notification - Notification to add
	 * 
	 * @example
	 * ```typescript
	 * user.addNotification(new Notification({
	 *   title: 'Order Update',
	 *   message: 'Your order has been shipped',
	 *   type: 'info',
	 *   createdAt: new Date()
	 * }));
	 * ```
	 */
	public addNotification(notification: Notification): void {
		this.notifications.push(notification)
	}

	// ============================================================================
	// PHASE 1: ACCOUNT STATUS HELPER METHODS
	// Convenience methods for status checking (MAANG-level encapsulation)
	// ============================================================================

	/**
	 * Check if account is in Active status (Phase 1)
	 * @returns {boolean} True if status is Active
	 * @example user.isActive() // true if Active
	 */
	public isActive(): boolean {
		return this.status === AccountStatus.Active
	}

	/**
	 * Check if account is locked due to failed login attempts (Phase 1)
	 * @returns {boolean} True if status is Locked
	 * @example user.isLocked() // true if Locked
	 */
	public isLocked(): boolean {
		return this.status === AccountStatus.Locked
	}

	/**
	 * Check if account is suspended by admin (Phase 1)
	 * @returns {boolean} True if status is Suspended
	 * @example user.isSuspended() // true if Suspended
	 */
	public isSuspended(): boolean {
		return this.status === AccountStatus.Suspended
	}

	/**
	 * Check if account is archived (soft deleted) (Phase 1)
	 * @returns {boolean} True if status is Archived
	 * @example user.isArchived() // true if Archived
	 */
	public isArchived(): boolean {
		return this.status === AccountStatus.Archived
	}

	/**
	 * Check if account email is pending verification (Phase 1)
	 * @returns {boolean} True if status is PendingVerification
	 * @example user.isPendingVerification() // true if pending
	 */
	public isPendingVerification(): boolean {
		return this.status === AccountStatus.PendingVerification
	}

	/**
	 * Check if account can login (Phase 1)
	 * Uses the shared canAccountLogin helper from Enums
	 * @returns {boolean} True if account status allows login
	 * @example user.canLogin() // true if Active or ForcePasswordChange
	 */
	public canLogin(): boolean {
		return canAccountLogin(this.status)
	}

	/**
	 * Check if password change is required on next login (Phase 1)
	 * @returns {boolean} True if forcePasswordChange flag is set or status is ForcePasswordChange
	 * @example user.needsPasswordChange() // true if password change required
	 */
	public needsPasswordChange(): boolean {
		return (
			this.forcePasswordChange || this.status === AccountStatus.ForcePasswordChange
		)
	}

	/**
	 * Check if account lockout is still active (Phase 1)
	 * @returns {boolean} True if locked and lockout period hasn't expired
	 * @example user.isLockoutActive() // true if currently locked
	 */
	public isLockoutActive(): boolean {
		if (!this.isLocked() || !this.lockedUntil) {
			return false
		}
		const lockoutDate =
			typeof this.lockedUntil === 'string'
				? new Date(this.lockedUntil)
				: this.lockedUntil
		return lockoutDate > new Date()
	}
}

/**
 * Password Change Form Model
 * 
 * Data model for password change operations.
 * Used in password change forms with validation.
 * 
 * **Validation Requirements:**
 * - Old password must match current password
 * - New password must meet security requirements (8+ chars, uppercase, lowercase, number, special char)
 * - Confirm password must match new password
 * 
 * @example
 * ```typescript
 * const form = new PasswordForm({
 *   oldPassword: 'CurrentPass123!',
 *   newPassword: 'NewSecurePass456!',
 *   confirmNewPassword: 'NewSecurePass456!'
 * });
 * 
 * // Use with validation schema
 * const schema = changePasswordSchema; // from validation-schemas.ts
 * const result = schema.parse(form);
 * ```
 */
export class PasswordForm {
	/** Current password for verification */
	oldPassword: string = ''
	
	/** New password to set */
	newPassword: string = ''
	
	/** Confirmation of new password (must match) */
	confirmNewPassword: string = ''

	/**
	 * Creates a new PasswordForm instance.
	 * 
	 * @param {Partial<PasswordForm>} param - Partial form data
	 */
	constructor(param?: Partial<PasswordForm>) {
		if (param) {
			Object.assign(this, param)
		}
	}
}

/**
 * User Registration Form Model
 * 
 * Data model for new user registration.
 * Used in signup forms with validation.
 * 
 * **Registration Requirements:**
 * - Unique username (3-50 characters, alphanumeric + underscore)
 * - Valid email address
 * - Strong password (8+ chars, uppercase, lowercase, number, special char)
 * - Password confirmation (must match password)
 * - Full name (first and last required)
 * - Optional date of birth (must be 18+ for most features)
 * 
 * **Backend Contract:**
 * The backend expects `confirmPassword` in the request body for validation.
 * 
 * @example
 * ```typescript
 * const registration = new RegisterModel({
 *   username: 'johndoe',
 *   email: 'john@example.com',
 *   password: 'SecurePass123!',
 *   confirmPassword: 'SecurePass123!',
 *   name: new Name({
 *     first: 'John',
 *     middle: 'Q',
 *     last: 'Doe'
 *   }),
 *   dateOfBirth: new Date('1990-01-15')
 * });
 * 
 * import { Routes } from '@_features/navigation';
 * 
 * // Use with AuthService
 * const result = await AuthService.signup(registration);
 * if (result.success) {
 *   router.push(Routes.openLoginModal());
 * }
 * ```
 */
export class RegisterModel {
	/** Desired username (unique) */
	public username: string = ''
	
	/** Email address */
	public email: string = ''
	
	/** Password (will be hashed on backend) */
	public password: string = ''
	
	/** Password confirmation (required by backend for validation) */
	public confirmPassword: string = ''
	
	/** User's full name */
	public name: Name = new Name()
	
	/** Optional date of birth */
	public dateOfBirth?: Date | null

	/**
	 * Creates a new RegisterModel instance.
	 * Deeply copies name object and parses date.
	 * 
	 * @param {Partial<RegisterModel>} param - Partial registration data
	 * 
	 * @example
	 * ```typescript
	 * const registration = new RegisterModel({
	 *   username: 'janedoe',
	 *   email: 'jane@example.com',
	 *   password: 'SecurePass456!',
	 *   confirmPassword: 'SecurePass456!',
	 *   name: new Name({ first: 'Jane', last: 'Doe' })
	 * });
	 * ```
	 */
	constructor(param?: Partial<RegisterModel>) {
		if (param) {
			Object.assign(this, param)
			
			// Deep copy name object
			if (param.name) {
				this.name = new Name(param.name)
			}
			
			// Parse date of birth from string if needed
			if (param.dateOfBirth) {
				this.dateOfBirth = parseDateSafe(param.dateOfBirth)
			}
		}
	}
}

/**
 * User type alias for type safety.
 * Provides type compatibility with User class.
 */
export type IUser = User
