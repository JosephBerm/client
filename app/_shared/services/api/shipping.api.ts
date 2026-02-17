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
	getRates: async (request: ShippingRateRequest) => HttpService.post<ShippingRate[]>('/Shipping/rates', request),

	/**
	 * Creates a shipping label for an order.
	 */
	createLabel: async (request: CreateLabelRequest) => HttpService.post<ShipmentLabel>('/Shipping/labels', request),

	/**
	 * Gets a shipping label by ID.
	 */
	getLabel: async (labelId: string) => HttpService.get<ShipmentLabel>(`/Shipping/labels/${labelId}`),

	/**
	 * Gets all shipping labels for an order.
	 * @param orderId - UUID string of the order
	 */
	getOrderLabels: async (orderId: string) =>
		HttpService.get<OrderShipmentsResponse>(`/Shipping/orders/${orderId}/labels`),

	/**
	 * Voids/cancels a shipping label.
	 */
	voidLabel: async (labelId: string) =>
		HttpService.delete<{ success: boolean; message: string }>(`/Shipping/labels/${labelId}`),

	/**
	 * Gets tracking information for a shipment.
	 */
	getTracking: async (trackingNumber: string, carrier?: string) => {
		const params = new URLSearchParams()
		if (carrier) params.append('carrier', carrier)
		const query = params.toString()
		if (!query) {
			return HttpService.get<TrackingInfo>(`/Shipping/tracking/${encodeURIComponent(trackingNumber)}`)
		}
		return HttpService.get<TrackingInfo>(`/Shipping/tracking/${encodeURIComponent(trackingNumber)}?${query}`)
	},
}
