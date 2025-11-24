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
 *   role: AccountRole.Customer,
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

import { parseDateSafe } from '@_lib/dates'

import Address from '@_classes/common/Address'
import Name from '@_classes/common/Name'
import Company from '@_classes/Company'
import Notification from '@_classes/Notification'

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

	/** User role (0 = Customer, 9999999 = Admin) */
	public role: number | null = null
	
	/** Associated customer/company ID (foreign key) */
	public customerId: number = -99
	
	/** Associated customer/company object */
	public customer?: Company | null
	
	/** User's order history */
	public orders?: Order[] = []
	
	/** Path to profile picture file */
	public profilePicturePath?: string

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
	 *   role: 0 // Customer
	 * });
	 * 
	 * // Admin user with company
	 * const admin = new User({
	 *   username: 'admin',
	 *   email: 'admin@medsource.com',
	 *   name: new Name({ first: 'Admin', last: 'User' }),
	 *   role: 9999999, // Admin
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
 * - Full name (first and last required)
 * - Optional date of birth (must be 18+ for most features)
 * 
 * @example
 * ```typescript
 * const registration = new RegisterModel({
 *   username: 'johndoe',
 *   email: 'john@example.com',
 *   password: 'SecurePass123!',
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
