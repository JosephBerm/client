/**
 * Customer Feature Constants
 * 
 * Static configuration and display mappings for customer management.
 * 
 * @module customers/constants
 */

import { CustomerStatus, TypeOfBusiness } from '@_classes/Enums'

import type { BusinessTypeConfig, CustomerStatusConfig } from '../types'

/**
 * Customer status display configuration.
 * Maps CustomerStatus enum values to display properties.
 */
export const CUSTOMER_STATUS_CONFIG: Record<CustomerStatus, CustomerStatusConfig> = {
	[CustomerStatus.Active]: {
		label: 'Active',
		color: 'success',
		icon: 'check-circle',
	},
	[CustomerStatus.Suspended]: {
		label: 'Suspended',
		color: 'error',
		icon: 'ban',
	},
	[CustomerStatus.PendingVerification]: {
		label: 'Pending Verification',
		color: 'warning',
		icon: 'clock',
	},
	[CustomerStatus.Inactive]: {
		label: 'Inactive',
		color: 'neutral',
		icon: 'pause-circle',
	},
	[CustomerStatus.Churned]: {
		label: 'Churned',
		color: 'neutral',
		icon: 'x-circle',
	},
}

/**
 * Business type display configuration.
 * Maps TypeOfBusiness enum values to display properties.
 */
export const BUSINESS_TYPE_CONFIG: Record<TypeOfBusiness, BusinessTypeConfig> = {
	[TypeOfBusiness.Dentist]: {
		label: 'Dental Practice',
		icon: '🦷',
		description: 'Dental clinic or practice',
	},
	[TypeOfBusiness.SurgeryCenter]: {
		label: 'Surgery Center',
		icon: '🏥',
		description: 'Outpatient surgery center',
	},
	[TypeOfBusiness.Hospital]: {
		label: 'Hospital',
		icon: '🏨',
		description: 'Hospital or medical center',
	},
	[TypeOfBusiness.Veterinarian]: {
		label: 'Veterinary',
		icon: '🐾',
		description: 'Veterinary clinic or hospital',
	},
	[TypeOfBusiness.Restaurant]: {
		label: 'Restaurant',
		icon: '🍽️',
		description: 'Restaurant or food service',
	},
	[TypeOfBusiness.Construction]: {
		label: 'Construction',
		icon: '🏗️',
		description: 'Construction company',
	},
	[TypeOfBusiness.Other]: {
		label: 'Other',
		icon: '🏢',
		description: 'Other business type',
	},
}

/**
 * Get status configuration for a CustomerStatus value.
 */
export function getCustomerStatusConfig(status: CustomerStatus): CustomerStatusConfig {
	return CUSTOMER_STATUS_CONFIG[status] || CUSTOMER_STATUS_CONFIG[CustomerStatus.Active]
}

/**
 * Get business type configuration for a TypeOfBusiness value.
 */
export function getBusinessTypeConfig(type: TypeOfBusiness): BusinessTypeConfig {
	return BUSINESS_TYPE_CONFIG[type] || BUSINESS_TYPE_CONFIG[TypeOfBusiness.Other]
}

/**
 * Customer status options for select inputs.
 */
export const CUSTOMER_STATUS_OPTIONS = Object.entries(CUSTOMER_STATUS_CONFIG).map(([value, config]) => ({
	value: Number(value),
	label: config.label,
}))

/**
 * Business type options for select inputs.
 */
export const BUSINESS_TYPE_OPTIONS = Object.entries(BUSINESS_TYPE_CONFIG).map(([value, config]) => ({
	value: Number(value),
	label: config.label,
	icon: config.icon,
}))

