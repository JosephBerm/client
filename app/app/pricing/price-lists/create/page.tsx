/**
 * Create Price List Page
 *
 * Form for creating a new price list.
 * Admin only access.
 *
 * **PRD Reference:** prd_pricing_engine.md - US-PRICE-004
 *
 * @module app/pricing/price-lists/create/page
 */

'use client'

import { useRouter } from 'next/navigation'

import { ArrowLeft } from 'lucide-react'

import { Routes } from '@_features/navigation'

import Button from '@_components/ui/Button'

import { InternalPageHeader } from '../../../_components'

import { PriceListForm } from '../../_components'

// =========================================================================
// COMPONENT
// =========================================================================

export default function CreatePriceListPage() {
	const router = useRouter()

	const handleSuccess = (priceListId: string) => {
		router.push(Routes.Pricing.priceListDetail(priceListId))
	}

	const handleCancel = () => {
		router.push(Routes.Pricing.priceLists)
	}

	return (
		<>
			{/* Page Header */}
			<InternalPageHeader
				title="Create Price List"
				description="Create a new contract or customer-specific price list"
				actions={
					<Button variant="ghost" size="sm" onClick={handleCancel}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Cancel
					</Button>
				}
			/>

			{/* Form */}
			<PriceListForm onSuccess={handleSuccess} onCancel={handleCancel} />
		</>
	)
}
