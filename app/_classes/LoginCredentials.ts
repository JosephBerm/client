/**
 * LoginCredentials Entity Class
 * 
 * Represents user login credentials for authentication.
 * Simple data model containing username, password, and "remember me" option.
 * Used primarily with the legacy API.login method (prefer AuthService.login).
 * 
 * **Features:**
 * - Username field
 * - Password field
 * - Remember me checkbox option
 * 
 * **Note:**
 * For new implementations, use `AuthService.login(username, password, rememberMe)`
 * instead of directly using this class with API endpoints.
 * 
 * @example
 * ```typescript
 * // Create login credentials
 * const credentials = new LoginCredentials({
 *   username: 'johndoe',
 *   password: 'SecurePass123!',
 *   rememberUser: true
 * });
 * 
 * // Legacy API usage (prefer AuthService.login)
 * const response = await API.login(credentials);
 * 
 * // Recommended approach with AuthService
 * const result = await AuthService.login('johndoe', 'SecurePass123!', true);
 * if (result.success) {
 *   router.push('/medsource-app/dashboard');
 * }
 * 
 * // Form submission handler
 * const handleLogin = async (formData) => {
 *   const credentials = new LoginCredentials({
 *     username: formData.username,
 *     password: formData.password,
 *     rememberUser: formData.rememberMe
 *   });
 *   // Use credentials...
 * };
 * ```
 * 
 * @module LoginCredentials
 */

/**
 * LoginCredentials Entity Class
 * 
 * Simple credentials model for user authentication.
 * Contains username, password, and remember me option.
 */
export default class LoginCredentials {
	/** Username for authentication (email or username) */
	public username: string = ''
	
	/** Password for authentication (plain text, will be hashed on backend) */
	public password: string = ''
	
	/** Whether to remember user for extended session (sets longer cookie expiry) */
	public rememberUser: boolean = false

	/**
	 * Creates a new LoginCredentials instance.
	 * Performs shallow copy of properties.
	 * 
	 * @param {Partial<LoginCredentials>} partial - Partial credentials data to initialize
	 * 
	 * @example
	 * ```typescript
	 * // Basic login
	 * const credentials = new LoginCredentials({
	 *   username: 'admin',
	 *   password: 'Admin123!'
	 * });
	 * 
	 * // With remember me
	 * const rememberCredentials = new LoginCredentials({
	 *   username: 'user@example.com',
	 *   password: 'UserPass456!',
	 *   rememberUser: true
	 * });
	 * 
	 * // From form data
	 * const form = document.querySelector('form');
	 * const formData = new FormData(form);
	 * const credentials = new LoginCredentials({
	 *   username: formData.get('username') as string,
	 *   password: formData.get('password') as string,
	 *   rememberUser: formData.get('remember') === 'on'
	 * });
	 * ```
	 */
	constructor(partial?: Partial<LoginCredentials>) {
		if (partial) {
			Object.assign(this, partial)
		}
	}
}
