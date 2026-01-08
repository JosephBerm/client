/**
 * Shipping Integration Types (MVP Feature #03)
 *
 * TypeScript types for shipping operations including:
 * - Rate shopping
 * - Label generation
 * - Tracking information
 *
 * @see docs/MVP_IMPLEMENTATION_PLANS/03_SHIPPING_INTEGRATION_PLAN.md
 */

// =========================================================================
// ENUMS
// =========================================================================

/**
 * Shipment status values.
 */
export enum ShipmentStatus {
	Pending = 1,
	LabelCreated = 2,
	PickedUp = 3,
	InTransit = 4,
	OutForDelivery = 5,
	Delivered = 6,
	Exception = 10,
	Cancelled = 20,
}

/**
 * Display labels for shipment statuses.
 */
export const ShipmentStatusLabels: Record<ShipmentStatus, string> = {
	[ShipmentStatus.Pending]: 'Pending',
	[ShipmentStatus.LabelCreated]: 'Label Created',
	[ShipmentStatus.PickedUp]: 'Picked Up',
	[ShipmentStatus.InTransit]: 'In Transit',
	[ShipmentStatus.OutForDelivery]: 'Out for Delivery',
	[ShipmentStatus.Delivered]: 'Delivered',
	[ShipmentStatus.Exception]: 'Exception',
	[ShipmentStatus.Cancelled]: 'Cancelled',
}

// =========================================================================
// REQUEST TYPES
// =========================================================================

/**
 * Request for getting shipping rates.
 */
export interface ShippingRateRequest {
	fromZip: string
	toZip: string
	toCountry?: string
	weightLbs: number
	lengthIn: number
	widthIn: number
	heightIn: number
	carriers?: string[]
}

/**
 * Request for creating a shipping label.
 */
export interface CreateLabelRequest {
	orderId: number
	carrierCode: string
	serviceCode: string
	weightLbs: number
	lengthIn: number
	widthIn: number
	heightIn: number
	insuranceAmount?: number
}

// =========================================================================
// RESPONSE TYPES
// =========================================================================

/**
 * Shipping rate from a carrier.
 */
export interface ShippingRate {
	carrierCode: string
	carrierName: string
	serviceCode: string
	serviceName: string
	shippingCost: number
	otherCost: number
	totalCost: number
	deliveryDays?: number
	estimatedDeliveryDate?: string
	isGuaranteed: boolean
}

/**
 * Shipment label details.
 */
export interface ShipmentLabel {
	id: string
	orderId: number
	carrier: string
	serviceType: string
	trackingNumber?: string
	trackingUrl?: string
	labelUrl?: string
	shippingCost: number
	insuranceAmount: number
	weightLbs: number
	lengthIn: number
	widthIn: number
	heightIn: number
	status: ShipmentStatus
	statusDisplay: string
	createdAt: string
	shippedAt?: string
	deliveredAt?: string
}

/**
 * Response for order shipments query.
 */
export interface OrderShipmentsResponse {
	orderId: number
	shipments: ShipmentLabel[]
	totalShipments: number
	totalShippingCost: number
}

/**
 * Tracking event.
 */
export interface TrackingEvent {
	timestamp: string
	description: string
	city?: string
	state?: string
	country?: string
}

/**
 * Tracking information for a shipment.
 */
export interface TrackingInfo {
	trackingNumber: string
	carrier: string
	status: string
	statusDescription: string
	estimatedDeliveryDate?: string
	deliveredAt?: string
	trackingUrl?: string
	events: TrackingEvent[]
}

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

/**
 * Gets the display label for a carrier code.
 */
export function getCarrierDisplayName(carrierCode: string): string {
	const carriers: Record<string, string> = {
		fedex: 'FedEx',
		ups: 'UPS',
		usps: 'USPS',
		dhl: 'DHL',
	}
	return carriers[carrierCode.toLowerCase()] || carrierCode.toUpperCase()
}

/**
 * Formats a shipping cost for display.
 */
export function formatShippingCost(cost: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(cost)
}

/**
 * Checks if a shipment is in a final state.
 */
export function isShipmentComplete(status: ShipmentStatus): boolean {
	return status === ShipmentStatus.Delivered || status === ShipmentStatus.Cancelled
}
