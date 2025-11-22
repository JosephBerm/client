/**
 * useRouteParam Hook - FAANG-Level Route Parameter Extraction
 * 
 * Reusable hook for extracting route parameters from Next.js dynamic routes.
 * Provides type-safe, consistent parameter extraction across all detail pages.
 * 
 * **FAANG Pattern:**
 * - Abstraction layer (Google/Meta)
 * - Type-safe parameter extraction (Netflix/Stripe)
 * - Consistent naming across codebase (Airbnb)
 * - Defensive programming with fallbacks
 * 
 * **Benefits:**
 * - DRY: Eliminates repetitive `params?.id ?? ''` pattern
 * - Type-safe: Returns string (guaranteed non-null)
 * - Consistent: Same pattern across all dynamic routes
 * - Extensible: Easy to add validation, parsing, error handling
 * 
 * **Usage:**
 * ```typescript
 * // Basic usage (default 'id' parameter)
 * const accountId = useRouteParam()
 * 
 * // Custom parameter name
 * const userId = useRouteParam('userId')
 * 
 * // With validation
 * const orderId = useRouteParam('id')
 * if (!orderId) {
 *   router.push('/404')
 *   return null
 * }
 * ```
 * 
 * **Before (Inconsistent):**
 * ```typescript
 * const params = useParams<{ id?: string }>()
 * const accountId = params?.id ?? ''
 * // ... later in error handler:
 * metadata: { accountId: id }  // ❌ ERROR: 'id' doesn't exist
 * ```
 * 
 * **After (Consistent):**
 * ```typescript
 * const accountId = useRouteParam()
 * // ... everywhere:
 * metadata: { accountId }  // ✅ Correct
 * ```
 * 
 * @example
 * ```typescript
 * // Detail page
 * export default function AccountDetailPage() {
 *   const accountId = useRouteParam()
 *   const router = useRouter()
 * 
 *   useEffect(() => {
 *     if (!accountId) {
 *       router.back()
 *       return
 *     }
 * 
 *     const fetchAccount = async () => {
 *       try {
 *         const { data } = await API.Accounts.get(accountId)
 *         // ...
 *       } catch (error) {
 *         notificationService.error('Failed', {
 *           metadata: { accountId },  // ✅ Uses extracted variable
 *         })
 *       }
 *     }
 *   }, [accountId])
 * }
 * ```
 * 
 * @module shared/hooks/useRouteParam
 */

'use client'

import { useParams } from 'next/navigation'
import { useMemo } from 'react'

/**
 * Extract route parameter from Next.js dynamic route
 * 
 * **Pattern:** Single source of truth for route param extraction
 * - Type-safe (returns string, not string | undefined)
 * - Consistent (same pattern everywhere)
 * - Memoized (prevents unnecessary re-renders)
 * 
 * @param paramKey - Route parameter key (default: 'id')
 * @returns Route parameter value (empty string if not found)
 * 
 * @example
 * ```typescript
 * // Default 'id' parameter
 * const accountId = useRouteParam()  // Extracts params.id
 * 
 * // Custom parameter
 * const userId = useRouteParam('userId')  // Extracts params.userId
 * 
 * // Multiple parameters
 * const productId = useRouteParam('id')
 * const categoryId = useRouteParam('categoryId')
 * ```
 */
export function useRouteParam(paramKey: string = 'id'): string {
	const params = useParams<Record<string, string | string[] | undefined>>()
	
	return useMemo(() => {
		const param = params[paramKey]
		
		// Handle array params (Next.js returns array for catch-all routes)
		if (Array.isArray(param)) {
			return param[0] ?? ''
		}
		
		// Handle string param (most common case)
		return param ?? ''
	}, [params, paramKey])
}

/**
 * Extract multiple route parameters at once
 * 
 * **Use Case:** When you need multiple params from same route
 * 
 * @param paramKeys - Array of parameter keys to extract
 * @returns Object with extracted parameters
 * 
 * @example
 * ```typescript
 * const { productId, categoryId } = useRouteParams(['id', 'categoryId'])
 * ```
 */
export function useRouteParams(paramKeys: string[]): Record<string, string> {
	const params = useParams<Record<string, string | string[] | undefined>>()
	// Stable reference for paramKeys array
	const stableKeys = useMemo(() => paramKeys, [paramKeys.join(',')])
	
	return useMemo(() => {
		const extracted: Record<string, string> = {}
		
		for (const key of stableKeys) {
			const param = params[key]
			
			if (Array.isArray(param)) {
				extracted[key] = param[0] ?? ''
			} else {
				extracted[key] = param ?? ''
			}
		}
		
		return extracted
	}, [params, stableKeys])
}

/**
 * Extract route parameter with type-safe validation
 * 
 * **Use Case:** When parameter is required and should not be empty
 * 
 * @param paramKey - Route parameter key (default: 'id')
 * @param validator - Optional validation function
 * @returns Route parameter value or throws if invalid
 * 
 * @example
 * ```typescript
 * // With validation
 * const accountId = useRouteParamValidated('id', (id) => {
 *   if (!id || id === 'create') {
 *     throw new Error('Invalid account ID')
 *   }
 *   return id
 * })
 * ```
 */
export function useRouteParamValidated<T extends string = string>(
	paramKey: string = 'id',
	validator?: (value: string) => T
): T {
	const param = useRouteParam(paramKey)
	
	return useMemo(() => {
		if (validator) {
			return validator(param)
		}
		return param as T
	}, [param, validator])
}

