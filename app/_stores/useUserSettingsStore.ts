'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Define available themes
export type Theme = 'medsource-classic' | 'winter' | 'luxury'

interface UserPreferences {
	tablePageSize: number
	sidebarCollapsed: boolean
	[key: string]: any
}

interface CartItem {
	productId: string
	quantity: number
	price: number
	name: string
}

interface UserSettingsState {
	// Theme settings
	theme: Theme
	
	// User preferences
	preferences: UserPreferences
	
	// Cart state (migrated from separate store)
	cart: CartItem[]
	
	// Schema version for migrations
	version: number
}

interface UserSettingsActions {
	// Theme actions
	setTheme: (theme: Theme) => void
	
	// Preferences actions
	setPreference: <K extends keyof UserPreferences>(
		key: K,
		value: UserPreferences[K]
	) => void
	setTablePageSize: (size: number) => void
	setSidebarCollapsed: (collapsed: boolean) => void
	
	// Cart actions
	addToCart: (item: CartItem) => void
	removeFromCart: (productId: string) => void
	updateCartQuantity: (productId: string, quantity: number) => void
	clearCart: () => void
	
	// Utility actions
	reset: () => void
}

type UserSettingsStore = UserSettingsState & UserSettingsActions

const initialState: UserSettingsState = {
	theme: 'medsource-classic',
	preferences: {
		tablePageSize: 10,
		sidebarCollapsed: false,
	},
	cart: [],
	version: 1,
}

export const useUserSettingsStore = create<UserSettingsStore>()(
	persist(
		(set, get) => ({
			...initialState,

			// Theme actions
			setTheme: (theme) => {
				set({ theme })
				// Apply theme to document
				if (typeof document !== 'undefined') {
					document.documentElement.setAttribute('data-theme', theme)
				}
			},

			// Preferences actions
			setPreference: (key, value) => {
				set((state) => ({
					preferences: {
						...state.preferences,
						[key]: value,
					},
				}))
			},

			setTablePageSize: (size) => {
				set((state) => ({
					preferences: {
						...state.preferences,
						tablePageSize: size,
					},
				}))
			},

			setSidebarCollapsed: (collapsed) => {
				set((state) => ({
					preferences: {
						...state.preferences,
						sidebarCollapsed: collapsed,
					},
				}))
			},

			// Cart actions
			addToCart: (item) => {
				set((state) => {
					const existingItem = state.cart.find((i) => i.productId === item.productId)
					
					if (existingItem) {
						// Update quantity if item exists
						return {
							cart: state.cart.map((i) =>
								i.productId === item.productId
									? { ...i, quantity: i.quantity + item.quantity }
									: i
							),
						}
					}
					
					// Add new item
					return {
						cart: [...state.cart, item],
					}
				})
			},

			removeFromCart: (productId) => {
				set((state) => ({
					cart: state.cart.filter((item) => item.productId !== productId),
				}))
			},

			updateCartQuantity: (productId, quantity) => {
				set((state) => ({
					cart: state.cart.map((item) =>
						item.productId === productId ? { ...item, quantity } : item
					),
				}))
			},

			clearCart: () => {
				set({ cart: [] })
			},

			// Utility actions
			reset: () => {
				set(initialState)
			},
		}),
		{
			name: 'user-settings',
			storage: createJSONStorage(() => localStorage),
			version: 1,
			// Handle migrations if schema changes
			migrate: (persistedState: any, version: number) => {
				if (version === 0) {
					// Migration from version 0 to 1 (if needed in future)
					return persistedState
				}
				return persistedState
			},
		}
	)
)


