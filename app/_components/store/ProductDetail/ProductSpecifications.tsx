/**
 * Product Specifications Component
 *
 * Displays product specifications in a minimal table format.
 * Uses DataGrid component for consistent table rendering.
 *
 * **Note:** This is a Client Component - it must receive serialized (plain object)
 * product data, not class instances. Next.js cannot serialize class instances
 * across the Server/Client boundary.
 *
 * @module ProductDetail/ProductSpecifications
 */

'use client'

import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import type { SerializedProduct } from '@_lib/serializers/productSerializer'

import Guid from '@_classes/Base/Guid'
import { DataGrid } from '@_components/tables'

import { ANIMATION_DELAYS, PRODUCT_STATUS, SECTION_LABELS, SPEC_LABELS } from './ProductDetail.constants'

export interface ProductSpecificationsProps {
	/** Serialized product data (plain object, not class instance) */
	product: SerializedProduct
}

/**
 * Specification row data type
 */
interface SpecificationRow {
	label: string
	value: string | React.ReactNode
}

/**
 * Product Specifications
 *
 * Renders product specifications table with category, product ID, SKU, and manufacturer.
 * Uses DataGrid component for consistent styling and accessibility.
 */
export default function ProductSpecifications({ product }: ProductSpecificationsProps) {
	// Prepare data rows for the table
	const specificationData = useMemo<SpecificationRow[]>(() => {
		const rows: SpecificationRow[] = []

		if (product.categories.length > 0) {
			rows.push({
				label: SPEC_LABELS.CATEGORY,
				value: product.categories.map((c) => c.name).join(', '),
			})
		}

		rows.push({
			label: SPEC_LABELS.PRODUCT_ID,
			value: <span className='break-all font-mono text-xs'>{Guid.formatForDisplay(product.id)}</span>,
		})

		rows.push({
			label: SPEC_LABELS.SKU,
			value: <span className='font-mono'>{product.sku ?? PRODUCT_STATUS.SKU_NA}</span>,
		})

		if (product.manufacturer) {
			rows.push({
				label: SPEC_LABELS.MANUFACTURER,
				value: product.manufacturer,
			})
		}

		return rows
	}, [product])

	// Column definitions - mobile-first responsive
	const columns = useMemo<ColumnDef<SpecificationRow>[]>(
		() => [
			{
				accessorKey: 'label',
				header: '',
				cell: ({ row }) => (
					<span className='text-xs sm:text-sm font-medium text-base-content/60 bg-base-200/30 px-3 sm:px-4 py-2 sm:py-3 block'>
						{row.original.label}
					</span>
				),
				size: 120,
			},
			{
				accessorKey: 'value',
				header: '',
				cell: ({ row }) => (
					<span className='text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 text-base-content block'>
						{row.original.value}
					</span>
				),
			},
		],
		[]
	)

	return (
		<div
			className='animate-elegant-reveal pt-4'
			style={{ animationDelay: ANIMATION_DELAYS.SPECIFICATIONS }}>
			<h3 className='mb-4 text-sm font-bold uppercase tracking-widest text-base-content/40'>
				{SECTION_LABELS.SPECIFICATIONS}
			</h3>
			<div className='overflow-hidden rounded-xl border border-base-200 shadow-sm'>
				<DataGrid
					columns={columns}
					data={specificationData}
					ariaLabel='Product specifications'
					className='text-sm'
				/>
			</div>
		</div>
	)
}
