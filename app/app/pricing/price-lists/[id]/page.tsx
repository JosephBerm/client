/**
 * Price List Detail Page
 *
 * Full view of a price list with:
 * - Price list information (editable for admin)
 * - Products/items in the price list
 * - Customer assignments
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 5.2 Components
 *
 * @module app/pricing/price-lists/[id]/page
 */

'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

import {
	ArrowLeft,
	Edit,
	Trash2,
	Plus,
	Package,
	Users,
	Settings,
	CheckCircle,
	XCircle,
	Calendar,
} from 'lucide-react'

import { Routes } from '@_features/navigation'
import { usePermissions } from '@_shared/hooks/usePermissions'
import { RoleLevels } from '@_types/rbac'
import { formatDate } from '@_lib/dates'

import Card from '@_components/ui/Card'
import Button from '@_components/ui/Button'
import Badge from '@_components/ui/Badge'
import { Tabs, TabsList, Tab, TabPanel } from '@_components/ui/Tabs'

import { InternalPageHeader } from '../../../_components'

import { usePriceList, useDeletePriceList } from '@_features/pricing'

import { PriceListForm, PriceListItemEditor, CustomerAssignmentEditor } from '../../_components'

// =========================================================================
// TYPES
// =========================================================================

type DetailTabId = 'overview' | 'items' | 'customers'

// =========================================================================
// COMPONENT
// =========================================================================

export default function PriceListDetailPage() {
	// ---------------------------------------------------------------------------
	// STATE & HOOKS
	// ---------------------------------------------------------------------------

	const params = useParams()
	const router = useRouter()
	const priceListId = params.id as string

	const [activeTab, setActiveTab] = useState<DetailTabId>('overview')
	const [isEditing, setIsEditing] = useState(false)

	const { hasMinimumRole } = usePermissions()
	const isAdmin = hasMinimumRole(RoleLevels.Admin)

	const { data: priceList, isLoading, error, refetch } = usePriceList(priceListId)
	const deleteMutation = useDeletePriceList()

	// ---------------------------------------------------------------------------
	// HANDLERS
	// ---------------------------------------------------------------------------

	const handleDelete = async () => {
		if (!priceList) return
		if (!confirm(`Are you sure you want to delete "${priceList.name}"? This action cannot be undone.`)) {
			return
		}

		try {
			await deleteMutation.mutateAsync(priceListId)
			router.push(Routes.Pricing.priceLists)
		} catch (err) {
			// Error handled by mutation
		}
	}

	const handleEditSuccess = () => {
		setIsEditing(false)
		refetch()
	}

	// ---------------------------------------------------------------------------
	// RENDER: LOADING
	// ---------------------------------------------------------------------------

	if (isLoading) {
		return (
			<>
				<InternalPageHeader
					title="Loading..."
					description="Fetching price list details"
					loading={true}
				/>
				<Card className="border border-base-300 bg-base-100 p-6 shadow-sm animate-pulse">
					<div className="h-8 w-64 bg-base-300 rounded mb-4" />
					<div className="h-4 w-96 bg-base-200 rounded" />
				</Card>
			</>
		)
	}

	// ---------------------------------------------------------------------------
	// RENDER: ERROR
	// ---------------------------------------------------------------------------

	if (error || !priceList) {
		return (
			<>
				<InternalPageHeader
					title="Error"
					description="Failed to load price list"
					actions={
						<Link href={Routes.Pricing.priceLists}>
							<Button variant="ghost" size="sm">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Price Lists
							</Button>
						</Link>
					}
				/>
				<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
					<div className="text-center py-8">
						<p className="text-error mb-4">{error?.message ?? 'Price list not found'}</p>
						<Button variant="primary" size="sm" onClick={() => refetch()}>
							Retry
						</Button>
					</div>
				</Card>
			</>
		)
	}

	// ---------------------------------------------------------------------------
	// RENDER: EDIT MODE
	// ---------------------------------------------------------------------------

	if (isEditing) {
		return (
			<>
				<InternalPageHeader
					title={`Edit: ${priceList.name}`}
					description="Update price list settings"
					actions={
						<Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Cancel
						</Button>
					}
				/>
				<PriceListForm
					priceList={priceList}
					onSuccess={handleEditSuccess}
					onCancel={() => setIsEditing(false)}
				/>
			</>
		)
	}

	// ---------------------------------------------------------------------------
	// RENDER: DETAIL VIEW
	// ---------------------------------------------------------------------------

	const isCurrentlyValid = priceList.isCurrentlyValid()

	return (
		<>
			{/* Page Header */}
			<InternalPageHeader
				title={priceList.name}
				description={priceList.description ?? 'No description'}
				actions={
					<div className="flex items-center gap-2">
						<Link href={Routes.Pricing.priceLists}>
							<Button variant="ghost" size="sm">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Button>
						</Link>
						{isAdmin && (
							<>
								<Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
									<Edit className="h-4 w-4 mr-2" />
									Edit
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="text-error hover:bg-error/10"
									onClick={handleDelete}
									disabled={deleteMutation.isPending}
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete
								</Button>
							</>
						)}
					</div>
				}
			/>

			{/* Status Banner */}
			<div className="flex flex-wrap items-center gap-3 mb-6">
				{priceList.isActive ? (
					<Badge variant="success" size="lg">
						<CheckCircle className="h-4 w-4 mr-1" />
						Active
					</Badge>
				) : (
					<Badge variant="error" size="lg">
						<XCircle className="h-4 w-4 mr-1" />
						Inactive
					</Badge>
				)}
				<Badge variant="neutral" size="lg">
					Priority: {priceList.priority}
				</Badge>
				{priceList.validFrom && (
					<Badge variant="info" size="lg">
						<Calendar className="h-4 w-4 mr-1" />
						From: {formatDate(priceList.validFrom, 'short')}
					</Badge>
				)}
				{priceList.validUntil && (
					<Badge variant="info" size="lg">
						<Calendar className="h-4 w-4 mr-1" />
						Until: {formatDate(priceList.validUntil, 'short')}
					</Badge>
				)}
				{!isCurrentlyValid && priceList.isActive && (
					<Badge variant="warning" size="lg">
						Outside Valid Date Range
					</Badge>
				)}
			</div>

			{/* Tabbed Content */}
			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DetailTabId)} variant="bordered">
				<TabsList className="mb-6">
					<Tab value="overview" icon={<Settings className="h-4 w-4" />}>
						Overview
					</Tab>
					<Tab value="items" icon={<Package className="h-4 w-4" />}>
						Products ({priceList.itemCount})
					</Tab>
					<Tab value="customers" icon={<Users className="h-4 w-4" />}>
						Customers ({priceList.customerCount})
					</Tab>
				</TabsList>

				{/* Overview Tab */}
				<TabPanel value="overview">
					<div className="grid gap-6 md:grid-cols-2">
						{/* Stats Card */}
						<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
							<h3 className="font-semibold text-base-content mb-4">Statistics</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-base-content/70">Products</span>
									<span className="font-medium text-base-content">{priceList.itemCount}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-base-content/70">Customers</span>
									<span className="font-medium text-base-content">{priceList.customerCount}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-base-content/70">Priority</span>
									<span className="font-medium text-base-content">{priceList.priority}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-base-content/70">Created</span>
									<span className="font-medium text-base-content">
										{formatDate(priceList.createdAt, 'long')}
									</span>
								</div>
							</div>
						</Card>

						{/* Quick Actions Card */}
						{isAdmin && (
							<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
								<h3 className="font-semibold text-base-content mb-4">Quick Actions</h3>
								<div className="space-y-3">
									<Button
										variant="secondary"
										size="sm"
										className="w-full justify-start"
										onClick={() => setActiveTab('items')}
									>
										<Plus className="h-4 w-4 mr-2" />
										Add Products
									</Button>
									<Button
										variant="secondary"
										size="sm"
										className="w-full justify-start"
										onClick={() => setActiveTab('customers')}
									>
										<Plus className="h-4 w-4 mr-2" />
										Assign Customers
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="w-full justify-start"
										onClick={() => setIsEditing(true)}
									>
										<Edit className="h-4 w-4 mr-2" />
										Edit Settings
									</Button>
								</div>
							</Card>
						)}
					</div>
				</TabPanel>

				{/* Items Tab */}
				<TabPanel value="items">
					<PriceListItemEditor priceListId={priceListId} isAdmin={isAdmin} />
				</TabPanel>

				{/* Customers Tab */}
				<TabPanel value="customers">
					<CustomerAssignmentEditor priceListId={priceListId} isAdmin={isAdmin} />
				</TabPanel>
			</Tabs>
		</>
	)
}
