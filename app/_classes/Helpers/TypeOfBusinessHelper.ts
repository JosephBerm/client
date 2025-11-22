/**
 * TypeOfBusinessHelper - FAANG-Level Enum Helper
 * 
 * Centralized metadata and helper functions for TypeOfBusiness enum.
 * Used for categorizing customer businesses by industry type.
 * 
 * **Pattern:** Exhaustive metadata mapping (Google/Netflix/Stripe standard)
 * 
 * **Features:**
 * - Display names for UI
 * - Descriptions for forms/help text
 * - Icon names for visual categorization
 * - Industry categories for filtering
 * 
 * @example
 * ```typescript
 * import TypeOfBusinessHelper from '@_classes/Helpers/TypeOfBusinessHelper'
 * import { TypeOfBusiness } from '@_classes/Enums'
 * 
 * // Get display name
 * const name = TypeOfBusinessHelper.getDisplay(TypeOfBusiness.Dentist)
 * // → "Dental Practice"
 * 
 * // Populate business type dropdown
 * <FormSelect
 *   label="Business Type"
 *   options={TypeOfBusinessHelper.toList.map(meta => ({
 *     value: meta.value,
 *     label: meta.display,
 *   }))}
 * />
 * 
 * // Check if medical industry
 * if (TypeOfBusinessHelper.isMedical(company.businessType)) {
 *   // Show medical-specific products
 * }
 * ```
 * 
 * @module Helpers/TypeOfBusinessHelper
 */

import { TypeOfBusiness } from '../Enums'

/**
 * Industry category for grouping and filtering
 */
export type BusinessIndustryCategory = 'medical' | 'hospitality' | 'construction' | 'other'

/**
 * Complete metadata for a TypeOfBusiness enum value
 */
export interface TypeOfBusinessMetadata {
	/** Enum value */
	value: TypeOfBusiness
	/** Human-readable display name */
	display: string
	/** Detailed description */
	description: string
	/** Icon name for visual categorization */
	iconName: string
	/** Industry category */
	category: BusinessIndustryCategory
	/** Example businesses (for help text) */
	examples: string[]
}

/**
 * Exhaustive metadata map for TypeOfBusiness enum
 * 
 * TypeScript enforces: If you add a new TypeOfBusiness, you MUST add metadata here.
 */
const TYPE_OF_BUSINESS_METADATA_MAP: Record<TypeOfBusiness, TypeOfBusinessMetadata> = {
	[TypeOfBusiness.Dentist]: {
		value: TypeOfBusiness.Dentist,
		display: 'Dental Practice',
		description: 'Dental clinics, orthodontists, and oral surgeons',
		iconName: 'ToothIcon',
		category: 'medical',
		examples: ['Dental clinic', 'Orthodontist', 'Oral surgeon'],
	},
	[TypeOfBusiness.SurgeryCenter]: {
		value: TypeOfBusiness.SurgeryCenter,
		display: 'Surgery Center',
		description: 'Outpatient surgery centers and ambulatory surgical facilities',
		iconName: 'HospitalIcon',
		category: 'medical',
		examples: ['Outpatient surgery center', 'Ambulatory surgical facility', 'Day surgery clinic'],
	},
	[TypeOfBusiness.Hospital]: {
		value: TypeOfBusiness.Hospital,
		display: 'Hospital',
		description: 'Hospitals, medical centers, and large healthcare facilities',
		iconName: 'BuildingHospitalIcon',
		category: 'medical',
		examples: ['Hospital', 'Medical center', 'Healthcare facility'],
	},
	[TypeOfBusiness.Veterinarian]: {
		value: TypeOfBusiness.Veterinarian,
		display: 'Veterinary Clinic',
		description: 'Veterinary clinics, animal hospitals, and pet care facilities',
		iconName: 'PawIcon',
		category: 'medical',
		examples: ['Veterinary clinic', 'Animal hospital', 'Pet care facility'],
	},
	[TypeOfBusiness.Restaurant]: {
		value: TypeOfBusiness.Restaurant,
		display: 'Restaurant',
		description: 'Restaurants, cafes, catering services, and food establishments',
		iconName: 'UtensilsIcon',
		category: 'hospitality',
		examples: ['Restaurant', 'Cafe', 'Catering service', 'Food service establishment'],
	},
	[TypeOfBusiness.Construction]: {
		value: TypeOfBusiness.Construction,
		display: 'Construction Company',
		description: 'Construction companies, contractors, and building services',
		iconName: 'HardHatIcon',
		category: 'construction',
		examples: ['Construction company', 'General contractor', 'Building service'],
	},
	[TypeOfBusiness.Other]: {
		value: TypeOfBusiness.Other,
		display: 'Other',
		description: 'Other business types not listed above',
		iconName: 'BuildingIcon',
		category: 'other',
		examples: ['Other business type'],
	},
}

/**
 * TypeOfBusinessHelper - Static helper class
 * 
 * Provides type-safe access to TypeOfBusiness metadata.
 */
export default class TypeOfBusinessHelper {
	/**
	 * Array of all TypeOfBusiness metadata
	 * 
	 * @example
	 * ```typescript
	 * // Populate dropdown
	 * <FormSelect
	 *   options={TypeOfBusinessHelper.toList.map(meta => ({
	 *     value: meta.value,
	 *     label: meta.display,
	 *   }))}
	 * />
	 * ```
	 */
	static readonly toList: TypeOfBusinessMetadata[] = Object.values(TYPE_OF_BUSINESS_METADATA_MAP)

	/**
	 * Get display name for a business type
	 * 
	 * @param type - TypeOfBusiness enum value
	 * @returns Display name string
	 * 
	 * @example
	 * ```typescript
	 * TypeOfBusinessHelper.getDisplay(TypeOfBusiness.Dentist)
	 * // → "Dental Practice"
	 * ```
	 */
	static getDisplay(type: TypeOfBusiness): string {
		return TYPE_OF_BUSINESS_METADATA_MAP[type]?.display || 'Unknown'
	}

	/**
	 * Get description for a business type
	 * 
	 * @param type - TypeOfBusiness enum value
	 * @returns Description string
	 * 
	 * @example
	 * ```typescript
	 * const desc = TypeOfBusinessHelper.getDescription(TypeOfBusiness.Hospital)
	 * // → "Hospitals, medical centers, and large healthcare facilities"
	 * ```
	 */
	static getDescription(type: TypeOfBusiness): string {
		return TYPE_OF_BUSINESS_METADATA_MAP[type]?.description || 'No description available'
	}

	/**
	 * Get full metadata for a business type
	 * 
	 * @param type - TypeOfBusiness enum value
	 * @returns Complete metadata object
	 * 
	 * @example
	 * ```typescript
	 * const meta = TypeOfBusinessHelper.getMetadata(TypeOfBusiness.Restaurant)
	 * console.log(meta.category)  // "hospitality"
	 * console.log(meta.examples)  // ["Restaurant", "Cafe", ...]
	 * ```
	 */
	static getMetadata(type: TypeOfBusiness): TypeOfBusinessMetadata {
		return TYPE_OF_BUSINESS_METADATA_MAP[type]
	}

	/**
	 * Get icon name for a business type
	 * 
	 * @param type - TypeOfBusiness enum value
	 * @returns Icon name string
	 * 
	 * @example
	 * ```typescript
	 * const iconName = TypeOfBusinessHelper.getIconName(TypeOfBusiness.Dentist)
	 * // → "ToothIcon"
	 * ```
	 */
	static getIconName(type: TypeOfBusiness): string {
		return TYPE_OF_BUSINESS_METADATA_MAP[type]?.iconName || 'BuildingIcon'
	}

	/**
	 * Get industry category for a business type
	 * 
	 * @param type - TypeOfBusiness enum value
	 * @returns Industry category
	 * 
	 * @example
	 * ```typescript
	 * TypeOfBusinessHelper.getCategory(TypeOfBusiness.Hospital)
	 * // → "medical"
	 * ```
	 */
	static getCategory(type: TypeOfBusiness): BusinessIndustryCategory {
		return TYPE_OF_BUSINESS_METADATA_MAP[type]?.category || 'other'
	}

	/**
	 * Get example businesses for a business type
	 * 
	 * @param type - TypeOfBusiness enum value
	 * @returns Array of example business names
	 * 
	 * @example
	 * ```typescript
	 * const examples = TypeOfBusinessHelper.getExamples(TypeOfBusiness.SurgeryCenter)
	 * // → ["Outpatient surgery center", "Ambulatory surgical facility", ...]
	 * ```
	 */
	static getExamples(type: TypeOfBusiness): string[] {
		return TYPE_OF_BUSINESS_METADATA_MAP[type]?.examples || []
	}

	/**
	 * Get all business types by industry category
	 * 
	 * @param category - Industry category to filter by
	 * @returns Array of TypeOfBusiness values in that category
	 * 
	 * @example
	 * ```typescript
	 * const medicalTypes = TypeOfBusinessHelper.getByCategory('medical')
	 * // → [TypeOfBusiness.Dentist, TypeOfBusiness.SurgeryCenter, ...]
	 * ```
	 */
	static getByCategory(category: BusinessIndustryCategory): TypeOfBusiness[] {
		return this.toList.filter((meta) => meta.category === category).map((meta) => meta.value)
	}

	/**
	 * Get all medical business types
	 * 
	 * @returns Array of medical TypeOfBusiness values
	 * 
	 * @example
	 * ```typescript
	 * const medicalTypes = TypeOfBusinessHelper.getMedicalTypes()
	 * // → [TypeOfBusiness.Dentist, TypeOfBusiness.Hospital, ...]
	 * 
	 * // Filter medical customers
	 * const medicalCustomers = customers.filter(c =>
	 *   medicalTypes.includes(c.businessType)
	 * )
	 * ```
	 */
	static getMedicalTypes(): TypeOfBusiness[] {
		return this.getByCategory('medical')
	}

	/**
	 * Check if business type is medical industry
	 * 
	 * @param type - TypeOfBusiness enum value
	 * @returns True if medical category
	 * 
	 * @example
	 * ```typescript
	 * if (TypeOfBusinessHelper.isMedical(company.businessType)) {
	 *   // Show medical-specific products
	 * }
	 * ```
	 */
	static isMedical(type: TypeOfBusiness): boolean {
		return this.getCategory(type) === 'medical'
	}

	/**
	 * Check if a value is a valid TypeOfBusiness enum value
	 * 
	 * @param value - Value to check
	 * @returns True if valid TypeOfBusiness
	 * 
	 * @example
	 * ```typescript
	 * const type = getBusinessTypeFromAPI()
	 * 
	 * if (TypeOfBusinessHelper.isValid(type)) {
	 *   // TypeScript now knows type is TypeOfBusiness
	 *   const display = TypeOfBusinessHelper.getDisplay(type)
	 * }
	 * ```
	 */
	static isValid(value: unknown): value is TypeOfBusiness {
		if (typeof value !== 'number') return false
		return Object.values(TypeOfBusiness).includes(value as TypeOfBusiness)
	}
}

