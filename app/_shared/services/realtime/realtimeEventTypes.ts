export interface RealtimeEventBase {
	eventId: string
	eventType: string
	tenantId: string
	timestampUtc: string
	actorId?: string | null
	correlationId?: string | null
}

export interface QuoteCreatedEvent extends RealtimeEventBase {
	quoteId: string
	status: number
	customerId?: string | null
	assignedSalesRepId?: string | null
}

export interface QuoteStatusChangedEvent extends RealtimeEventBase {
	quoteId: string
	previousStatus: number
	currentStatus: number
	customerId?: string | null
	assignedSalesRepId?: string | null
}

export interface QuotePricingChangedEvent extends RealtimeEventBase {
	quoteId: string
	productId: string
	customerId?: string | null
	assignedSalesRepId?: string | null
}

export interface QuoteArchivedEvent extends RealtimeEventBase {
	quoteId: string
	customerId?: string | null
	assignedSalesRepId?: string | null
}

export interface QuoteDeletedEvent extends RealtimeEventBase {
	quoteId: string
	customerId?: string | null
	assignedSalesRepId?: string | null
}

export interface OrderCreatedEvent extends RealtimeEventBase {
	orderId: string
	status: number
	customerId?: string | null
	assignedSalesRepId?: string | null
}

export interface OrderStatusChangedEvent extends RealtimeEventBase {
	orderId: string
	previousStatus: number
	currentStatus: number
	customerId?: string | null
	assignedSalesRepId?: string | null
	trackingNumber?: string | null
}

export interface PaymentConfirmedEvent extends RealtimeEventBase {
	paymentId: string
	orderId: string
	customerId?: string | null
	amountCents: number
	method: number
}

export interface ImportProgressEvent extends RealtimeEventBase {
	jobId: string
	status: number
	totalRows: number
	processedRows: number
	successCount: number
	errorCount: number
	skippedCount: number
	progressPercent: number
	errorMessage?: string | null
}

export interface ErpSyncProgressEvent extends RealtimeEventBase {
	provider: string
	entityType: string
	status: number
	message?: string | null
}

export interface NotificationCreatedEvent extends RealtimeEventBase {
	notificationId: string
	userId: string
	type: number
}

export interface InventoryAlertEvent extends RealtimeEventBase {
	inventoryId: string
	productId: string
	status: number
	quantityOnHand: number
	quantityAvailable: number
	reorderPoint: number
}

export interface ShippingStatusChangedEvent extends RealtimeEventBase {
	shipmentId: string
	orderId: string
	status: number
	trackingNumber?: string | null
	trackingUrl?: string | null
}

export interface AnalyticsKpiUpdatedEvent extends RealtimeEventBase {
	metric?: string | null
}

export interface AnalyticsRevenueUpdatedEvent extends RealtimeEventBase {
	metric?: string | null
}

