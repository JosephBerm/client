/**
 * Stripe Elements Provider Component
 *
 * Provides Stripe context to payment components using the Elements provider.
 * This wrapper handles Stripe.js initialization and configuration.
 *
 * **Usage:**
 * Wrap payment forms with this provider to enable Stripe Elements.
 *
 * ```tsx
 * <StripeProvider>
 *   <PaymentForm orderId={123} />
 * </StripeProvider>
 * ```
 *
 * **Environment Variable Required:**
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Your Stripe publishable key
 *
 * @module payments/components/StripeProvider
 */

'use client'

import { type ReactNode, useMemo } from 'react'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, type Stripe, type StripeElementsOptions } from '@stripe/stripe-js'

// =========================================================================
// STRIPE INITIALIZATION
// =========================================================================

/**
 * Stripe publishable key from environment.
 * Must be set in .env.local or production environment.
 */
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

/**
 * Lazily load Stripe.js only when needed.
 * Returns null if no publishable key is configured.
 */
let stripePromise: Promise<Stripe | null> | null = null

function getStripe(): Promise<Stripe | null> {
	if (!stripePromise) {
		if (!STRIPE_PUBLISHABLE_KEY) {
			// Stripe not configured - card payments will be unavailable
			// This is expected in development without API keys
			stripePromise = Promise.resolve(null)
		} else {
			stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
		}
	}
	return stripePromise
}

// =========================================================================
// COMPONENT TYPES
// =========================================================================

export interface StripeProviderProps {
	/** Child components that need Stripe context */
	children: ReactNode
	/**
	 * Client secret from PaymentIntent (optional).
	 * Required for confirming payments.
	 */
	clientSecret?: string
	/**
	 * Stripe Elements appearance options.
	 * @default Uses DaisyUI-compatible theme
	 */
	appearance?: StripeElementsOptions['appearance']
}

// =========================================================================
// DEFAULT APPEARANCE (DaisyUI Compatible)
// =========================================================================

/**
 * Default Stripe Elements appearance that matches DaisyUI theme.
 * Uses CSS variables for theme compatibility.
 */
const DEFAULT_APPEARANCE: StripeElementsOptions['appearance'] = {
	theme: 'stripe',
	variables: {
		// Use CSS variables that work with DaisyUI themes
		colorPrimary: 'oklch(var(--p))',
		colorBackground: 'oklch(var(--b1))',
		colorText: 'oklch(var(--bc))',
		colorDanger: 'oklch(var(--er))',
		fontFamily: 'inherit',
		borderRadius: '0.5rem',
		spacingUnit: '4px',
	},
	rules: {
		'.Input': {
			border: '1px solid oklch(var(--bc) / 0.2)',
			boxShadow: 'none',
			padding: '12px',
		},
		'.Input:focus': {
			border: '1px solid oklch(var(--p))',
			boxShadow: '0 0 0 2px oklch(var(--p) / 0.2)',
		},
		'.Input--invalid': {
			border: '1px solid oklch(var(--er))',
		},
		'.Label': {
			fontWeight: '500',
			marginBottom: '4px',
		},
		'.Error': {
			color: 'oklch(var(--er))',
			fontSize: '0.875rem',
		},
	},
}

// =========================================================================
// STRIPE PROVIDER COMPONENT
// =========================================================================

/**
 * StripeProvider Component
 *
 * Wraps child components with Stripe Elements context.
 * Handles lazy loading of Stripe.js and provides theme-aware styling.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <StripeProvider>
 *   <PaymentForm orderId={123} />
 * </StripeProvider>
 *
 * // With client secret for payment confirmation
 * <StripeProvider clientSecret="pi_xxx_secret_xxx">
 *   <PaymentForm orderId={123} />
 * </StripeProvider>
 * ```
 */
export function StripeProvider({ children, clientSecret, appearance }: StripeProviderProps) {
	// Memoize options to prevent unnecessary re-renders
	const options = useMemo<StripeElementsOptions>(
		() => ({
			clientSecret,
			appearance: appearance ?? DEFAULT_APPEARANCE,
			// Recommended: Use automatic payment methods for best UX
			// This allows Stripe to show the best payment methods for the customer
			loader: 'auto',
		}),
		[clientSecret, appearance]
	)

	// If no Stripe key is configured, render children without Stripe context
	// Components should handle this gracefully
	if (!STRIPE_PUBLISHABLE_KEY) {
		return <>{children}</>
	}

	return (
		<Elements stripe={getStripe()} options={options}>
			{children}
		</Elements>
	)
}

/**
 * Hook to check if Stripe is configured.
 * Useful for conditionally rendering payment options.
 */
export function useStripeConfigured(): boolean {
	return !!STRIPE_PUBLISHABLE_KEY
}

export default StripeProvider
