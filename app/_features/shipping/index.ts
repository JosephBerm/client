/**
 * Shipping Integration Feature (MVP Feature #03)
 *
 * Provides shipping integration capabilities including:
 * - Rate shopping from multiple carriers
 * - Shipping label generation
 * - Tracking information
 * - Webhook handling for status updates
 *
 * **Usage:**
 * ```typescript
 * import { useGetShippingRates, useCreateShippingLabel, ShipmentStatus } from '@_features/shipping'
 *
 * // For API calls, use centralized API object:
 * import API from '@_shared/services/api'
 * await API.Shipping.getRates(request)
 * ```
 *
 * @module shipping
 */

// Types and Enums (explicit named exports for tree-shaking)
export {
	// Enums
	ShipmentStatus,
	ShipmentStatusLabels,
	// Helper functions
	getCarrierDisplayName,
	formatShippingCost,
	isShipmentComplete,
} from './types'

export type {
	// Request DTOs
	ShippingRateRequest,
	CreateLabelRequest,
	// Response DTOs
	ShippingRate,
	ShipmentLabel,
	OrderShipmentsResponse,
	TrackingEvent,
	TrackingInfo,
} from './types'

// Hooks
export {
	shippingKeys,
	useGetShippingRates,
	useShippingLabel,
	useOrderShippingLabels,
	useCreateShippingLabel,
	useVoidShippingLabel,
	useShippingTracking,
} from './hooks'
