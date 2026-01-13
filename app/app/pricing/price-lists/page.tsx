/**
 * Price Lists Page
 *
 * Dedicated page for price list management.
 * Lists all price lists with full CRUD capabilities.
 *
 * **PRD Reference:** prd_pricing_engine.md - Epic 2: Price List Management
 *
 * @module app/pricing/price-lists/page
 */

'use client'

import Link from 'next/link'

import { Plus, ArrowLeft } from 'lucide-react'

import { Routes } from '@_features/navigation'
import { usePermissions } from '@_shared/hooks/usePermissions'
import { RoleLevels } from '@_types/rbac'

import Button from '@_components/ui/Button'

import { InternalPageHeader } from '../../_components'

import { PriceListTable } from '../_components'

// =========================================================================
// COMPONENT
// =========================================================================

export default function PriceListsPage() {
	const { hasMinimumRole } = usePermissions()
	const isAdmin = hasMinimumRole(RoleLevels.Admin)

	return (
		<>
			{/* Page Header */}
			<InternalPageHeader
				title="Price Lists"
				description="Manage contract pricing and customer-specific price lists"
				actions={
					<div className="flex items-center gap-2">
						<Link href={Routes.Pricing.location}>
							<Button variant="ghost" size="sm">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Pricing
							</Button>
						</Link>
						{isAdmin && (
							<Link href={Routes.Pricing.priceListCreate}>
								<Button variant="primary" size="sm">
									<Plus className="h-4 w-4 mr-2" />
									New Price List
								</Button>
							</Link>
						)}
					</div>
				}
			/>

			{/* Price List Table */}
			<PriceListTable />
		</>
	)
}
