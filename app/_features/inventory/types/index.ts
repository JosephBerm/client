/**
 * Inventory Types - TypeScript Interfaces for Inventory Management
 *
 * These types mirror the backend DTOs for type-safe API communication.
 *
 * @module inventory/types
 */

// =========================================================================
// ENUMS
// =========================================================================

/**
 * Inventory status enum (mirrors backend InventoryStatus)
 */
export enum InventoryStatus {
	InStock = 1,
	LowStock = 2,
	OutOfStock = 3,
	FullyReserved = 4,
	NotTracked = 5,
}

/**
 * Inventory transaction types (mirrors backend InventoryTransactionType)
 */
export enum InventoryTransactionType {
	// Increases
	InitialStock = 100,
	PurchaseReceived = 110,
	ReturnReceived = 120,
	ManualAdjustmentIncrease = 130,
	TransferIn = 140,

	// Decreases
	SaleShipped = 200,
	ReturnToVendor = 210,
	ManualAdjustmentDecrease = 220,
	Damaged = 230,
	Expired = 240,
	Lost = 250,
	TransferOut = 260,

	// Reservations
	OrderReserved = 300,
	ReservationReleased = 310,

	// Corrections
	CycleCountAdjustment = 400,
	StocktakeAdjustment = 410,
}

// =========================================================================
// CORE ENTITIES
// =========================================================================

/**
 * Product inventory record
 */
export interface ProductInventory {
	id: string
	tenantId: string
	productId: string
	product?: {
		id: string
		name: string
		sku: string
		price: number
	}

	// Quantities
	quantityOnHand: number
	quantityReserved: number
	quantityAvailable: number // Computed: OnHand - Reserved
	quantityBackordered: number

	// Reorder settings
	reorderPoint: number
	reorderQuantity: number
	maxStockLevel: number

	// Settings
	trackInventory: boolean
	allowBackorder: boolean
	preventOverselling: boolean

	// Audit
	createdAt: string
	updatedAt?: string
	lastStockCheckAt?: string

	// Computed status
	status: InventoryStatus
}

/**
 * Inventory transaction record (immutable audit log)
 */
export interface InventoryTransaction {
	id: string
	tenantId: string
	productInventoryId: string
	productId: string

	transactionType: InventoryTransactionType
	quantityChange: number
	quantityBefore: number
	quantityAfter: number

	referenceType?: string
	referenceId?: string
	reason?: string
	notes?: string

	createdAt: string
	createdBy: string
	ipAddress?: string
}

// =========================================================================
// REQUEST DTOs
// =========================================================================

/**
 * Request to receive stock
 */
export interface ReceiveStockRequest {
	quantity: number
	purchaseOrderId?: string
	notes?: string
}

/**
 * Request to adjust stock
 */
export interface AdjustStockRequest {
	newQuantity: number
	transactionType: InventoryTransactionType
	reason: string
	notes?: string
}

/**
 * Inventory settings update request
 */
export interface InventorySettingsRequest {
	reorderPoint: number
	reorderQuantity: number
	maxStockLevel: number
	trackInventory: boolean
	allowBackorder: boolean
	preventOverselling: boolean
}

/**
 * Request to initialize inventory
 */
export interface InitializeInventoryRequest {
	productId: string
	initialQuantity: number
	settings?: InventorySettingsRequest
}

/**
 * Availability check item
 */
export interface AvailabilityCheckItem {
	productId: string
	quantity: number
}

/**
 * Stock receipt item (for bulk operations)
 */
export interface StockReceiptItem {
	productId: string
	quantity: number
	notes?: string
}

/**
 * Bulk receive request
 */
export interface BulkReceiveRequest {
	items: StockReceiptItem[]
	purchaseOrderId?: string
}

// =========================================================================
// RESPONSE DTOs
// =========================================================================

/**
 * Inventory statistics for dashboard
 */
export interface InventoryStats {
	totalProducts: number
	trackedProducts: number
	inStockCount: number
	lowStockCount: number
	outOfStockCount: number
	totalInventoryValue: number
}

/**
 * Availability check result
 */
export interface AvailabilityResult {
	productId: string
	isAvailable: boolean
	requestedQuantity: number
	availableQuantity: number
	reason?: string
}

/**
 * Inventory operation result
 */
export interface InventoryResult {
	isSuccess: boolean
	errorCode?: string
	errorMessage?: string
	inventory?: ProductInventory
	transaction?: InventoryTransaction
}

/**
 * Product inventory summary for list views
 */
export interface ProductInventorySummary {
	id: string
	productId: string
	productName: string
	productSku: string
	quantityOnHand: number
	quantityReserved: number
	quantityAvailable: number
	reorderPoint: number
	status: InventoryStatus
}

/**
 * Inventory transaction summary
 */
export interface InventoryTransactionSummary {
	id: string
	transactionType: InventoryTransactionType
	quantityChange: number
	quantityBefore: number
	quantityAfter: number
	referenceType?: string
	referenceId?: string
	reason?: string
	createdBy: string
	createdAt: string
}

// =========================================================================
// FILTER/SEARCH DTOs
// =========================================================================

/**
 * Inventory search filter
 */
export interface InventorySearchFilter {
	searchTerm?: string
	status?: InventoryStatus
	lowStockOnly?: boolean
	outOfStockOnly?: boolean
	categoryId?: string
	pageNumber?: number
	pageSize?: number
	sortBy?: string
	sortDescending?: boolean
}

/**
 * Paged inventory result
 */
export interface PagedInventoryResult<T> {
	items: T[]
	totalCount: number
	pageNumber: number
	pageSize: number
	totalPages: number
}

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

/**
 * Get display name for inventory status
 */
export function getInventoryStatusLabel(status: InventoryStatus): string {
	switch (status) {
		case InventoryStatus.InStock:
			return 'In Stock'
		case InventoryStatus.LowStock:
			return 'Low Stock'
		case InventoryStatus.OutOfStock:
			return 'Out of Stock'
		case InventoryStatus.FullyReserved:
			return 'Fully Reserved'
		case InventoryStatus.NotTracked:
			return 'Not Tracked'
		default:
			return 'Unknown'
	}
}

/**
 * Get CSS class for inventory status badge
 */
export function getInventoryStatusColor(status: InventoryStatus): string {
	switch (status) {
		case InventoryStatus.InStock:
			return 'bg-green-100 text-green-800'
		case InventoryStatus.LowStock:
			return 'bg-yellow-100 text-yellow-800'
		case InventoryStatus.OutOfStock:
			return 'bg-red-100 text-red-800'
		case InventoryStatus.FullyReserved:
			return 'bg-blue-100 text-blue-800'
		case InventoryStatus.NotTracked:
			return 'bg-gray-100 text-gray-800'
		default:
			return 'bg-gray-100 text-gray-800'
	}
}

/**
 * Get display name for transaction type
 */
export function getTransactionTypeLabel(type: InventoryTransactionType): string {
	switch (type) {
		case InventoryTransactionType.InitialStock:
			return 'Initial Stock'
		case InventoryTransactionType.PurchaseReceived:
			return 'Purchase Received'
		case InventoryTransactionType.ReturnReceived:
			return 'Return Received'
		case InventoryTransactionType.ManualAdjustmentIncrease:
			return 'Manual Increase'
		case InventoryTransactionType.TransferIn:
			return 'Transfer In'
		case InventoryTransactionType.SaleShipped:
			return 'Sale Shipped'
		case InventoryTransactionType.ReturnToVendor:
			return 'Return to Vendor'
		case InventoryTransactionType.ManualAdjustmentDecrease:
			return 'Manual Decrease'
		case InventoryTransactionType.Damaged:
			return 'Damaged'
		case InventoryTransactionType.Expired:
			return 'Expired'
		case InventoryTransactionType.Lost:
			return 'Lost'
		case InventoryTransactionType.TransferOut:
			return 'Transfer Out'
		case InventoryTransactionType.OrderReserved:
			return 'Order Reserved'
		case InventoryTransactionType.ReservationReleased:
			return 'Reservation Released'
		case InventoryTransactionType.CycleCountAdjustment:
			return 'Cycle Count'
		case InventoryTransactionType.StocktakeAdjustment:
			return 'Stocktake'
		default:
			return 'Unknown'
	}
}
