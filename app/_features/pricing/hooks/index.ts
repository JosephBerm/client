/**
 * Pricing Hooks Barrel Export
 *
 * @module pricing/hooks
 */

export {
	// Query key factory
	pricingKeys,
	// Price calculation hooks
	useCalculatePrice,
	useCalculatePricesMutation,
	// Price list hooks
	usePriceLists,
	usePriceList,
	useCreatePriceList,
	useUpdatePriceList,
	useDeletePriceList,
	// Price list item hooks
	useAddPriceListItem,
	useUpdatePriceListItem,
	useRemovePriceListItem,
	// Customer assignment hooks
	useCustomerPriceLists,
	useAssignCustomerPriceList,
	useRemoveCustomerPriceList,
	// Volume tier hooks
	useVolumeTiers,
	useSetVolumeTiers,
	useClearVolumeTiers,
	// Price override hooks (Sales Manager)
	useOverrideQuoteItemPrice,
	usePriceOverrideHistory,
	// Audit log hooks
	usePricingAuditLogs,
	// Analytics hooks
	usePricingAnalytics,
} from './usePricing'

// Customer pricing hooks
export { useCustomerPricing, useBulkCustomerPricing } from './useCustomerPricing'
