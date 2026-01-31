'use client'

/**
 * Payment TanStack Query Hooks
 *
 * MAANG-Level data fetching with React Query:
 * - Automatic caching and background refetching
 * - Optimistic updates for mutations
 * - Query key factories for consistent cache invalidation
 *
 * @module payments/hooks
 */

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'

import { PaymentService } from '../services'
import type {
	CustomerPaymentSettingsDTO,
	PagedPaymentResult,
	PaymentDTO,
	PaymentSearchFilter,
	PaymentSummary,
	RecordManualPaymentRequest,
	RefundRequest,
	SavedPaymentMethodDTO,
	UpdateCustomerPaymentSettingsRequest,
} from '../types'

// =========================================================================
// QUERY KEY FACTORY
// =========================================================================

/**
 * Query key factory for payment-related queries.
 * Ensures consistent cache key structure across the application.
 */
export const paymentKeys = {
	all: ['payments'] as const,
	lists: () => [...paymentKeys.all, 'list'] as const,
	list: (filters: PaymentSearchFilter) => [...paymentKeys.lists(), filters] as const,
	details: () => [...paymentKeys.all, 'detail'] as const,
	detail: (id: string) => [...paymentKeys.details(), id] as const,
	/** @param orderId - UUID/GUID of the order */
	order: (orderId: string) => [...paymentKeys.all, 'order', orderId] as const,
	/** @param orderId - UUID/GUID of the order */
	orderSummary: (orderId: string) => [...paymentKeys.all, 'order-summary', orderId] as const,
	customer: (customerId: number) => [...paymentKeys.all, 'customer', customerId] as const,
	savedMethods: (customerId: number) => [...paymentKeys.all, 'saved-methods', customerId] as const,
	settings: (customerId: number) => [...paymentKeys.all, 'settings', customerId] as const,
}

// =========================================================================
// PAYMENT QUERIES
// =========================================================================

/**
 * Hook to fetch a payment by ID
 */
export function usePayment(
	paymentId: string,
	options?: Omit<UseQueryOptions<PaymentDTO, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: paymentKeys.detail(paymentId),
		queryFn: () => PaymentService.getById(paymentId),
		enabled: !!paymentId,
		staleTime: 30_000, // 30 seconds
		...options,
	})
}

/**
 * Hook to fetch all payments for an order
 * @param orderId - UUID/GUID of the order
 */
export function useOrderPayments(
	orderId: string | undefined,
	options?: Omit<UseQueryOptions<PaymentDTO[], Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: paymentKeys.order(orderId!),
		queryFn: () => PaymentService.getByOrderId(orderId!),
		enabled: !!orderId,
		staleTime: 30_000,
		...options,
	})
}

/**
 * Hook to fetch payment summary for an order
 * @param orderId - UUID/GUID of the order
 */
export function useOrderPaymentSummary(
	orderId: string | undefined,
	options?: Omit<UseQueryOptions<PaymentSummary, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: paymentKeys.orderSummary(orderId!),
		queryFn: () => PaymentService.getOrderPaymentSummary(orderId!),
		enabled: !!orderId,
		staleTime: 30_000,
		...options,
	})
}

/**
 * Hook to fetch all payments for a customer
 */
export function useCustomerPayments(
	customerId: number,
	options?: Omit<UseQueryOptions<PaymentDTO[], Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: paymentKeys.customer(customerId),
		queryFn: () => PaymentService.getByCustomerId(customerId),
		enabled: !!customerId,
		staleTime: 30_000,
		...options,
	})
}

/**
 * Hook to search payments with filters and pagination
 */
export function usePaymentSearch(
	filter: PaymentSearchFilter,
	options?: Omit<UseQueryOptions<PagedPaymentResult<PaymentDTO>, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: paymentKeys.list(filter),
		queryFn: () => PaymentService.search(filter),
		staleTime: 30_000,
		...options,
	})
}

// =========================================================================
// PAYMENT INTENT MUTATIONS
// =========================================================================

/**
 * Hook to create a PaymentIntent for card payments.
 */
export function useCreatePaymentIntent() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (orderId: string) => PaymentService.createPaymentIntent(orderId),
		onSuccess: (_data, orderId) => {
			queryClient.invalidateQueries({ queryKey: paymentKeys.order(orderId) })
			queryClient.invalidateQueries({ queryKey: paymentKeys.orderSummary(orderId) })
		},
	})
}

/**
 * Hook to confirm a PaymentIntent after payment completion.
 */
export function useConfirmPaymentIntent() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (paymentIntentId: string) => PaymentService.confirmPaymentIntent(paymentIntentId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: paymentKeys.all })
		},
	})
}

// =========================================================================
// MANUAL PAYMENT MUTATIONS
// =========================================================================

/**
 * Hook to record a manual payment.
 */
export function useRecordManualPayment() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ orderId, request }: { orderId: string; request: RecordManualPaymentRequest }) =>
			PaymentService.recordManualPayment(orderId, request),
		onSuccess: (_data, { orderId }) => {
			queryClient.invalidateQueries({ queryKey: paymentKeys.order(orderId) })
			queryClient.invalidateQueries({ queryKey: paymentKeys.orderSummary(orderId) })
			queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
		},
	})
}

// =========================================================================
// REFUND MUTATIONS
// =========================================================================

/**
 * Hook to process a refund.
 */
export function useRefundPayment() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ paymentId, request }: { paymentId: string; request: RefundRequest }) =>
			PaymentService.refund(paymentId, request),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: paymentKeys.detail(data.id) })
			queryClient.invalidateQueries({ queryKey: paymentKeys.order(data.orderId) })
			queryClient.invalidateQueries({ queryKey: paymentKeys.orderSummary(data.orderId) })
			queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
		},
	})
}

// =========================================================================
// SAVED PAYMENT METHOD QUERIES & MUTATIONS
// =========================================================================

/**
 * Hook to fetch saved payment methods for a customer
 */
export function useSavedPaymentMethods(
	customerId: number,
	options?: Omit<UseQueryOptions<SavedPaymentMethodDTO[], Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: paymentKeys.savedMethods(customerId),
		queryFn: () => PaymentService.getSavedPaymentMethods(customerId),
		enabled: !!customerId,
		staleTime: 60_000, // 1 minute - payment methods change infrequently
		...options,
	})
}

/**
 * Hook to set a payment method as default.
 */
export function useSetDefaultPaymentMethod() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ customerId, paymentMethodId }: { customerId: number; paymentMethodId: string }) =>
			PaymentService.setDefaultPaymentMethod(customerId, paymentMethodId),
		onSuccess: (_data, { customerId }) => {
			queryClient.invalidateQueries({ queryKey: paymentKeys.savedMethods(customerId) })
		},
	})
}

/**
 * Hook to delete a saved payment method.
 */
export function useDeletePaymentMethod() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ customerId, paymentMethodId }: { customerId: number; paymentMethodId: string }) =>
			PaymentService.deletePaymentMethod(paymentMethodId).then(() => customerId),
		onSuccess: (customerId) => {
			queryClient.invalidateQueries({ queryKey: paymentKeys.savedMethods(customerId) })
		},
	})
}

// =========================================================================
// CUSTOMER PAYMENT SETTINGS
// =========================================================================

/**
 * Hook to fetch customer payment settings
 */
export function useCustomerPaymentSettings(
	customerId: number,
	options?: Omit<UseQueryOptions<CustomerPaymentSettingsDTO, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: paymentKeys.settings(customerId),
		queryFn: () => PaymentService.getCustomerPaymentSettings(customerId),
		enabled: !!customerId,
		staleTime: 60_000, // 1 minute
		...options,
	})
}

/**
 * Hook to update customer payment settings.
 */
export function useUpdateCustomerPaymentSettings() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ customerId, request }: { customerId: number; request: UpdateCustomerPaymentSettingsRequest }) =>
			PaymentService.updateCustomerPaymentSettings(customerId, request),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: paymentKeys.settings(data.customerId) })
		},
	})
}
