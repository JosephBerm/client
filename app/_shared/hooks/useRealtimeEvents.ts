'use client'

import { useEffect, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { integrationKeys } from '@_features/integrations/hooks/useIntegrations'
import { inventoryKeys } from '@_features/inventory/hooks/useInventory'
import { paymentKeys } from '@_features/payments/hooks/usePayments'
import { productImportExportKeys } from '@_features/product-import-export/hooks/useProductImportExport'
import { quoteKeys } from '@_features/quotes/hooks/quoteKeys'
import { shippingKeys } from '@_features/shipping/hooks/useShipping'

import { logger } from '@_core'

import { invalidateCache } from '@_shared/hooks/useFetchWithCache'
import { notificationService } from '@_shared/services'
import type {
	AnalyticsKpiUpdatedEvent,
	AnalyticsRevenueUpdatedEvent,
	ErpSyncProgressEvent,
	ImportProgressEvent,
	InventoryAlertEvent,
	OrderCreatedEvent,
	OrderStatusChangedEvent,
	PaymentConfirmedEvent,
	QuoteArchivedEvent,
	QuoteCreatedEvent,
	QuoteDeletedEvent,
	QuotePricingChangedEvent,
	QuoteStatusChangedEvent,
	ShippingStatusChangedEvent,
} from '@_shared/services/realtime/realtimeEventTypes'
import {
	realtimeSocketService,
} from '@_shared/services/realtime/realtimeSocketService'

const socketEventNames = {
	quoteCreated: 'quote.created',
	quoteStatusChanged: 'quote.status.changed',
	quotePricingChanged: 'quote.pricing.changed',
	quoteArchived: 'quote.archived',
	quoteDeleted: 'quote.deleted',
	orderCreated: 'order.created',
	orderStatusChanged: 'order.status.changed',
	paymentConfirmed: 'payment.confirmed',
	importProgress: 'import.progress',
	erpSyncProgress: 'erp.sync.progress',
	inventoryAlert: 'inventory.alert',
	shippingStatusChanged: 'shipping.status.changed',
	analyticsKpiUpdated: 'analytics.kpi.updated',
	analyticsRevenueUpdated: 'analytics.revenue.updated',
} as const

interface UseRealtimeEventsOptions {
	enabled: boolean
}

export function useRealtimeEvents({ enabled }: UseRealtimeEventsOptions) {
	const queryClient = useQueryClient()
	const hasShownDisconnect = useRef(false)

	useEffect(() => {
		if (!enabled) {
			return
		}

		const handleQuoteCreated = (payload: QuoteCreatedEvent) => {
			void queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
			if (payload.quoteId) {
				void queryClient.invalidateQueries({ queryKey: quoteKeys.detail(payload.quoteId) })
				void queryClient.invalidateQueries({ queryKey: quoteKeys.pricingSummary(payload.quoteId) })
			}
		}

		const handleQuoteStatusChanged = (payload: QuoteStatusChangedEvent) => {
			void queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
			if (payload.quoteId) {
				void queryClient.invalidateQueries({ queryKey: quoteKeys.detail(payload.quoteId) })
				void queryClient.invalidateQueries({ queryKey: quoteKeys.pricingSummary(payload.quoteId) })
			}
		}

		const handleQuotePricingChanged = (payload: QuotePricingChangedEvent) => {
			if (payload.quoteId) {
				void queryClient.invalidateQueries({ queryKey: quoteKeys.detail(payload.quoteId) })
				void queryClient.invalidateQueries({ queryKey: quoteKeys.pricingSummary(payload.quoteId) })
			}
		}

		const handleQuoteArchived = (payload: QuoteArchivedEvent) => {
			void queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
			if (payload.quoteId) {
				void queryClient.invalidateQueries({ queryKey: quoteKeys.detail(payload.quoteId) })
			}
		}

		const handleQuoteDeleted = (payload: QuoteDeletedEvent) => {
			void queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
			if (payload.quoteId) {
				void queryClient.invalidateQueries({ queryKey: quoteKeys.detail(payload.quoteId) })
			}
		}

		const handleOrderCreated = (_payload: OrderCreatedEvent) => {
			void queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'orders' })
		}

		const handleOrderStatusChanged = (_payload: OrderStatusChangedEvent) => {
			void queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'orders' })
		}

		const handlePaymentConfirmed = (payload: PaymentConfirmedEvent) => {
			void queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })

			// orderId is now a UUID string
			if (payload.orderId) {
				void queryClient.invalidateQueries({ queryKey: paymentKeys.order(payload.orderId) })
				void queryClient.invalidateQueries({ queryKey: paymentKeys.orderSummary(payload.orderId) })
			}

			const customerId = payload.customerId ? Number(payload.customerId) : Number.NaN
			if (Number.isFinite(customerId) && customerId > 0) {
				void queryClient.invalidateQueries({ queryKey: paymentKeys.customer(customerId) })
			}
		}

		const handleImportProgress = (payload: ImportProgressEvent) => {
			void queryClient.invalidateQueries({ queryKey: productImportExportKeys.importJobs() })
			if (payload.jobId) {
				void queryClient.invalidateQueries({ queryKey: productImportExportKeys.importJob(payload.jobId) })
			}
		}

		const handleInventoryAlert = (_payload: InventoryAlertEvent) => {
			void queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() })
			void queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() })
			void queryClient.invalidateQueries({ queryKey: inventoryKeys.outOfStock() })
			void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
			if (_payload.productId) {
				void queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(_payload.productId) })
				void queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions(_payload.productId) })
			}
		}

		const handleShippingStatusChanged = (payload: ShippingStatusChangedEvent) => {
			void queryClient.invalidateQueries({ queryKey: shippingKeys.labels() })

			// orderId is now a UUID string
			if (payload.orderId) {
				void queryClient.invalidateQueries({ queryKey: shippingKeys.orderLabels(payload.orderId) })
			}

			if (payload.trackingNumber) {
				void queryClient.invalidateQueries({ queryKey: shippingKeys.tracking(payload.trackingNumber) })
			}
		}

		const handleAnalyticsKpiUpdated = (_payload: AnalyticsKpiUpdatedEvent) => {
			invalidateCache('analytics-summary')
		}

		const handleAnalyticsRevenueUpdated = (_payload: AnalyticsRevenueUpdatedEvent) => {
			invalidateCache('revenue-timeline')
		}

		const handleErpSyncProgress = (payload: ErpSyncProgressEvent) => {
			void queryClient.invalidateQueries({ queryKey: integrationKeys.dashboard() })
			if (payload.correlationId) {
				void queryClient.invalidateQueries({ queryKey: integrationKeys.syncStatus(payload.correlationId) })
			}
		}

		realtimeSocketService.on(socketEventNames.quoteCreated, handleQuoteCreated)
		realtimeSocketService.on(socketEventNames.quoteStatusChanged, handleQuoteStatusChanged)
		realtimeSocketService.on(socketEventNames.quotePricingChanged, handleQuotePricingChanged)
		realtimeSocketService.on(socketEventNames.quoteArchived, handleQuoteArchived)
		realtimeSocketService.on(socketEventNames.quoteDeleted, handleQuoteDeleted)
		realtimeSocketService.on(socketEventNames.orderCreated, handleOrderCreated)
		realtimeSocketService.on(socketEventNames.orderStatusChanged, handleOrderStatusChanged)
		realtimeSocketService.on(socketEventNames.paymentConfirmed, handlePaymentConfirmed)
		realtimeSocketService.on(socketEventNames.importProgress, handleImportProgress)
		realtimeSocketService.on(socketEventNames.inventoryAlert, handleInventoryAlert)
		realtimeSocketService.on(socketEventNames.shippingStatusChanged, handleShippingStatusChanged)
		realtimeSocketService.on(socketEventNames.analyticsKpiUpdated, handleAnalyticsKpiUpdated)
		realtimeSocketService.on(socketEventNames.analyticsRevenueUpdated, handleAnalyticsRevenueUpdated)
		realtimeSocketService.on(socketEventNames.erpSyncProgress, handleErpSyncProgress)

		const unsubscribeReconnected = realtimeSocketService.onReconnected(() => {
			void queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
			void queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
			void queryClient.invalidateQueries({ queryKey: productImportExportKeys.importJobs() })
			void queryClient.invalidateQueries({ queryKey: integrationKeys.dashboard() })
		})

		return () => {
			realtimeSocketService.off(socketEventNames.quoteCreated, handleQuoteCreated)
			realtimeSocketService.off(socketEventNames.quoteStatusChanged, handleQuoteStatusChanged)
			realtimeSocketService.off(socketEventNames.quotePricingChanged, handleQuotePricingChanged)
			realtimeSocketService.off(socketEventNames.quoteArchived, handleQuoteArchived)
			realtimeSocketService.off(socketEventNames.quoteDeleted, handleQuoteDeleted)
			realtimeSocketService.off(socketEventNames.orderCreated, handleOrderCreated)
			realtimeSocketService.off(socketEventNames.orderStatusChanged, handleOrderStatusChanged)
			realtimeSocketService.off(socketEventNames.paymentConfirmed, handlePaymentConfirmed)
			realtimeSocketService.off(socketEventNames.importProgress, handleImportProgress)
			realtimeSocketService.off(socketEventNames.inventoryAlert, handleInventoryAlert)
			realtimeSocketService.off(socketEventNames.shippingStatusChanged, handleShippingStatusChanged)
			realtimeSocketService.off(socketEventNames.analyticsKpiUpdated, handleAnalyticsKpiUpdated)
			realtimeSocketService.off(socketEventNames.analyticsRevenueUpdated, handleAnalyticsRevenueUpdated)
			realtimeSocketService.off(socketEventNames.erpSyncProgress, handleErpSyncProgress)
			unsubscribeReconnected()
		}
	}, [enabled, queryClient])

	useEffect(() => {
		if (!enabled) {
			return
		}

		return realtimeSocketService.onStateChange((state) => {
			if (state === 'disconnected') {
				logger.info('Realtime socket disconnected')
				if (!hasShownDisconnect.current) {
					notificationService.info('Real-time updates are temporarily unavailable.', {
						component: 'useRealtimeEvents',
						action: 'socketDisconnected',
					})
					hasShownDisconnect.current = true
				}
			}

			if (state === 'connected') {
				hasShownDisconnect.current = false
			}
		})
	}, [enabled])
}

