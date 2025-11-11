/**
 * User Settings and Preferences Store
 * 
 * Comprehensive Zustand store managing user preferences, theme, and shopping cart.
 * Persists all settings to localStorage with versioning support for future migrations.
 * 
 * **Features:**
 * - Theme management (MedSource Classic, Winter, Luxury)
 * - User preferences (table page size, sidebar state, custom settings)
 * - Shopping cart management
 * - Schema versioning for data migrations
 * - localStorage persistence
 * - Automatic theme application to DOM
 * 
 * **Managed State:**
 * - Theme selection and persistence
 * - UI preferences (table pagination, sidebar collapse)
 * - Shopping cart items and quantities
 * - Custom key-value preferences
 * 
 * @example
 * ```typescript
 * // Access theme
 * const theme = useUserSettingsStore(state => state.theme);
 * 
 * // Change theme
 * const setTheme = useUserSettingsStore(state => state.setTheme);
 * setTheme('luxury'); // Automatically applies to document
 * 
 * // Manage cart
 * const { cart, addToCart, clearCart } = useUserSettingsStore();
 * addToCart({ productId: '123', quantity: 2, price: 99.99, name: 'Product' });
 * 
 * // Table pagination preference
 * const pageSize = useUserSettingsStore(state => state.preferences.tablePageSize);
 * ```
 * 
 * @module useUserSettingsStore
 */

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Available DaisyUI theme options.
 * Custom MedSource Classic theme defined in globals.css.
 */
export type Theme = 'medsource-classic' | 'winter' | 'luxury'

/**
 * User preferences for UI behavior and display.
 * Extensible with custom key-value pairs.
 */
interface UserPreferences {
	/** Default number of items per page in tables */
	tablePageSize: number
	/** Whether sidebar is collapsed (mobile/desktop) */
	sidebarCollapsed: boolean
	/** Additional custom preferences can be added dynamically */
	[key: string]: any
}

/**
 * Shopping cart item structure.
 */
interface CartItem {
	/** Product unique identifier */
	productId: string
	/** Quantity of this product in cart */
	quantity: number
	/** Unit price of the product */
	price: number
	/** Display name of the product */
	name: string
}

/**
 * User settings state interface.
 */
interface UserSettingsState {
	/** Current active theme */
	theme: Theme
	/** User UI preferences */
	preferences: UserPreferences
	/** Shopping cart items */
	cart: CartItem[]
	/** Schema version for data migrations */
	version: number
}

/**
 * User settings actions interface.
 */
interface UserSettingsActions {
	/** Sets the active theme and applies it to the DOM */
	setTheme: (theme: Theme) => void
	
	/** Sets a specific preference by key */
	setPreference: <K extends keyof UserPreferences>(
		key: K,
		value: UserPreferences[K]
	) => void
	/** Sets the default table page size */
	setTablePageSize: (size: number) => void
	/** Sets sidebar collapsed state */
	setSidebarCollapsed: (collapsed: boolean) => void
	
	/** Adds item to cart (or updates quantity if exists) */
	addToCart: (item: CartItem) => void
	/** Removes an item from cart by product ID */
	removeFromCart: (productId: string) => void
	/** Updates quantity of a cart item */
	updateCartQuantity: (productId: string, quantity: number) => void
	/** Clears all items from cart */
	clearCart: () => void
	
	/** Resets all settings to initial state */
	reset: () => void
}

/**
 * Combined user settings store type.
 */
type UserSettingsStore = UserSettingsState & UserSettingsActions

/**
 * Initial state for user settings.
 * Used as default values and for reset functionality.
 */
const initialState: UserSettingsState = {
	theme: 'medsource-classic', // Default custom theme
	preferences: {
		tablePageSize: 10, // Standard pagination size
		sidebarCollapsed: false, // Sidebar expanded by default
	},
	cart: [], // Empty cart
	version: 1, // Current schema version
}

/**
 * Zustand user settings store with localStorage persistence and migrations.
 * 
 * **Store Structure:**
 * - theme: Current theme ('medsource-classic', 'winter', 'luxury')
 * - preferences: UI preferences object (tablePageSize, sidebarCollapsed, custom keys)
 * - cart: Array of cart items
 * - version: Schema version for migrations
 * 
 * **Actions:**
 * - setTheme(theme): Change theme (auto-applies to DOM)
 * - setPreference(key, value): Set any preference
 * - setTablePageSize(size): Set default table pagination
 * - setSidebarCollapsed(collapsed): Toggle sidebar
 * - addToCart(item): Add/update cart item
 * - removeFromCart(productId): Remove cart item
 * - updateCartQuantity(productId, quantity): Update cart item quantity
 * - clearCart(): Empty cart
 * - reset(): Reset all settings to defaults
 * 
 * @example
 * ```typescript
 * // Theme switching
 * const { theme, setTheme } = useUserSettingsStore();
 * <select value={theme} onChange={(e) => setTheme(e.target.value)}>
 *   <option value="medsource-classic">Classic</option>
 *   <option value="winter">Winter</option>
 *   <option value="luxury">Luxury</option>
 * </select>
 * 
 * // Cart management
 * const { cart, addToCart, clearCart } = useUserSettingsStore();
 * const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
 * 
 * // Sidebar toggle
 * const { preferences, setSidebarCollapsed } = useUserSettingsStore();
 * <button onClick={() => setSidebarCollapsed(!preferences.sidebarCollapsed)}>
 *   Toggle Sidebar
 * </button>
 * ```
 */
export const useUserSettingsStore = create<UserSettingsStore>()(
	persist(
		(set, get) => ({
			...initialState,

			/**
			 * Sets the active theme and automatically applies it to the document.
			 * Theme is applied via data-theme attribute on document element (DaisyUI convention).
			 */
			setTheme: (theme) => {
				set({ theme })
				// Apply theme to document element (triggers DaisyUI theme change)
				if (typeof document !== 'undefined') {
					document.documentElement.setAttribute('data-theme', theme)
				}
			},

			/**
			 * Sets a custom preference by key.
			 * Allows dynamic addition of new preferences without schema changes.
			 */
			setPreference: (key, value) => {
				set((state) => ({
					preferences: {
						...state.preferences,
						[key]: value,
					},
				}))
			},

			/**
			 * Sets the default table page size preference.
			 * Used by ServerDataTable and DataTable components.
			 */
			setTablePageSize: (size) => {
				set((state) => ({
					preferences: {
						...state.preferences,
						tablePageSize: size,
					},
				}))
			},

			/**
			 * Sets the sidebar collapsed state.
			 * Controls sidebar visibility in navigation layout.
			 */
			setSidebarCollapsed: (collapsed) => {
				set((state) => ({
					preferences: {
						...state.preferences,
						sidebarCollapsed: collapsed,
					},
				}))
			},

			/**
			 * Adds an item to the cart or updates quantity if already exists.
			 * Automatically merges quantities for duplicate product IDs.
			 */
			addToCart: (item) => {
				set((state) => {
					const existingItem = state.cart.find((i) => i.productId === item.productId)
					
					if (existingItem) {
						// Update quantity if item already in cart
						return {
							cart: state.cart.map((i) =>
								i.productId === item.productId
									? { ...i, quantity: i.quantity + item.quantity }
									: i
							),
						}
					}
					
					// Add new item to cart
					return {
						cart: [...state.cart, item],
					}
				})
			},

			/**
			 * Removes an item from the cart by product ID.
			 */
			removeFromCart: (productId) => {
				set((state) => ({
					cart: state.cart.filter((item) => item.productId !== productId),
				}))
			},

			/**
			 * Updates the quantity of a specific cart item.
			 * If quantity is 0, consider using removeFromCart instead.
			 */
			updateCartQuantity: (productId, quantity) => {
				set((state) => ({
					cart: state.cart.map((item) =>
						item.productId === productId ? { ...item, quantity } : item
					),
				}))
			},

			/**
			 * Clears all items from the cart.
			 * Typically called after successful order submission.
			 */
			clearCart: () => {
				set({ cart: [] })
			},

			/**
			 * Resets all settings to initial state.
			 * Useful for logout or "restore defaults" functionality.
			 */
			reset: () => {
				set(initialState)
			},
		}),
		{
			name: 'user-settings', // localStorage key
			storage: createJSONStorage(() => localStorage),
			version: 1, // Current schema version
			/**
			 * Handles schema migrations when version changes.
			 * Called automatically by Zustand when persisted version doesn't match current version.
			 * 
			 * @param persistedState - The state loaded from localStorage
			 * @param version - The version number of the persisted state
			 * @returns Migrated state object
			 */
			migrate: (persistedState: any, version: number) => {
				// Example migration from version 0 to 1 (if needed in future)
				if (version === 0) {
					// Transform old schema to new schema
					// e.g., persistedState.oldField -> persistedState.newField
					return persistedState
				}
				return persistedState
			},
		}
	)
)


