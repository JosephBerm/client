/**
 * Shipping API Module
 *
 * Rate shopping, label generation, and tracking integration.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/shipping
 */

import type {
	CreateLabelRequest,
	OrderShipmentsResponse,
	ShipmentLabel,
	ShippingRate,
	ShippingRateRequest,
	TrackingInfo,
} from '@_features/shipping/types'

import { HttpService } from '../httpService'

// =========================================================================
// SHIPPING API
// =========================================================================

/**
 * Shipping Integration API (MVP Feature #03)
 * Rate shopping, label generation, and tracking.
 *
 * @see 03_SHIPPING_INTEGRATION_PLAN.md
 */
export const ShippingApi = {
	/**
	 * Gets shipping rates from multiple carriers.
	 */
	getRates: async (request: ShippingRateRequest) => HttpService.post<ShippingRate[]>('/shipping/rates', request),

	/**
	 * Creates a shipping label for an order.
	 */
	createLabel: async (request: CreateLabelRequest) => HttpService.post<ShipmentLabel>('/shipping/labels', request),

	/**
	 * Gets a shipping label by ID.
	 */
	getLabel: async (labelId: string) => HttpService.get<ShipmentLabel>(`/shipping/labels/${labelId}`),

	/**
	 * Gets all shipping labels for an order.
	 */
	getOrderLabels: async (orderId: number) =>
		HttpService.get<OrderShipmentsResponse>(`/shipping/orders/${orderId}/labels`),

	/**
	 * Voids/cancels a shipping label.
	 */
	voidLabel: async (labelId: string) =>
		HttpService.delete<{ success: boolean; message: string }>(`/shipping/labels/${labelId}`),

	/**
	 * Gets tracking information for a shipment.
	 */
	getTracking: async (trackingNumber: string, carrier?: string) => {
		const params = new URLSearchParams()
		if (carrier) params.append('carrier', carrier)
		const query = params.toString()
		return HttpService.get<TrackingInfo>(
			`/shipping/tracking/${encodeURIComponent(trackingNumber)}${query ? `?${query}` : ''}`
		)
	},
}
