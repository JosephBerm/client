/**
 * Pricing Dashboard Page
 *
 * Admin interface for the Advanced Pricing Engine.
 * Provides overview of pricing configuration and quick access to management functions.
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 3 (Admin View)
 *
 * **Features:**
 * - Pricing overview stats (active price lists, customers with pricing, etc.)
 * - Quick access to Price List management
 * - Volume Tier configuration
 * - Customer Assignment management
 *
 * **RBAC:**
 * - View: Admin, SalesManager, SalesRep (PricingView policy)
 * - Manage: Admin only (PricingManage policy)
 *
 * @module app/pricing/page
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'

import { DollarSign, List, Users, TrendingUp, Plus, Settings, ChevronRight, History, BarChart3 } from 'lucide-react'

import { Routes } from '@_features/navigation'
import { usePermissions } from '@_shared/hooks/usePermissions'
import { RoleLevels } from '@_types/rbac'

import Card from '@_components/ui/Card'
import Button from '@_components/ui/Button'
import { Tabs, TabsList, Tab, TabPanel } from '@_components/ui/Tabs'

import { InternalPageHeader } from '../_components'

import {
	PriceListTable,
	PricingStatsCards,
	PricingAuditLogViewer,
	CustomerAssignmentMatrix,
	PricingAnalytics,
	usePricingOverview,
	type PricingTabId,
} from './_components'

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * Pricing Dashboard Page
 *
 * Main entry point for pricing management.
 * Shows stats overview and tabbed interface for different pricing functions.
 */
export default function PricingDashboardPage() {
	// ---------------------------------------------------------------------------
	// STATE & HOOKS
	// ---------------------------------------------------------------------------

	const [activeTab, setActiveTab] = useState<PricingTabId>('price-lists')

	const { hasMinimumRole } = usePermissions()
	const isAdmin = hasMinimumRole(RoleLevels.Admin)

	const {
		stats,
		isLoading,
		error,
		refresh,
	} = usePricingOverview()

	// ---------------------------------------------------------------------------
	// RENDER
	// ---------------------------------------------------------------------------

	return (
		<>
			{/* Page Header */}
			<InternalPageHeader
				title="Pricing Engine"
				description="Manage price lists, volume tiers, and customer pricing assignments"
				loading={isLoading}
				actions={
					isAdmin && (
						<Link href={Routes.Pricing.priceListCreate}>
							<Button variant="primary" size="sm">
								<Plus className="h-4 w-4 mr-2" />
								New Price List
							</Button>
						</Link>
					)
				}
			/>

			{/* Error Alert */}
			{error && (
				<div className="alert alert-error mb-6">
					<span>{error}</span>
					<Button variant="ghost" size="sm" onClick={refresh}>
						Retry
					</Button>
				</div>
			)}

			{/* Stats Overview */}
			<PricingStatsCards stats={stats} isLoading={isLoading} />

			{/* Quick Actions (Admin Only) */}
			{isAdmin && (
				<div className="grid gap-4 md:grid-cols-3 mb-8">
					<Link href={Routes.Pricing.priceLists}>
						<Card className="border border-base-300 bg-base-100 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<List className="h-5 w-5 text-primary" />
									</div>
									<div>
										<h3 className="font-semibold text-base-content">Price Lists</h3>
										<p className="text-sm text-base-content/60">Manage contract pricing</p>
									</div>
								</div>
								<ChevronRight className="h-5 w-5 text-base-content/40 group-hover:text-primary transition-colors" />
							</div>
						</Card>
					</Link>

					<Link href={Routes.Pricing.customerAssignments}>
						<Card className="border border-base-300 bg-base-100 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
										<Users className="h-5 w-5 text-success" />
									</div>
									<div>
										<h3 className="font-semibold text-base-content">Customer Pricing</h3>
										<p className="text-sm text-base-content/60">Assign price lists</p>
									</div>
								</div>
								<ChevronRight className="h-5 w-5 text-base-content/40 group-hover:text-success transition-colors" />
							</div>
						</Card>
					</Link>

					<Card className="border border-base-300 bg-base-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
								<Settings className="h-5 w-5 text-warning" />
							</div>
							<div>
								<h3 className="font-semibold text-base-content">Global Settings</h3>
								<p className="text-sm text-base-content/60">Margin protection thresholds</p>
							</div>
						</div>
					</Card>
				</div>
			)}

			{/* Tabbed Content */}
			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PricingTabId)} variant="bordered">
				<TabsList className="mb-6">
					<Tab value="price-lists" icon={<List className="h-4 w-4" />}>
						Price Lists
					</Tab>
					<Tab value="volume-tiers" icon={<TrendingUp className="h-4 w-4" />}>
						Volume Pricing
					</Tab>
					<Tab value="customers" icon={<Users className="h-4 w-4" />}>
						Customer Assignments
					</Tab>
				<Tab value="audit-logs" icon={<History className="h-4 w-4" />}>
					Audit Logs
				</Tab>
				<Tab value="analytics" icon={<BarChart3 className="h-4 w-4" />}>
					Analytics
				</Tab>
			</TabsList>

				{/* Price Lists Tab */}
				<TabPanel value="price-lists">
					<PriceListTable />
				</TabPanel>

				{/* Volume Tiers Tab */}
				<TabPanel value="volume-tiers">
					<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
						<div className="text-center py-12">
							<TrendingUp className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
							<h3 className="text-lg font-semibold text-base-content mb-2">Volume Pricing Tiers</h3>
							<p className="text-base-content/60 mb-4">
								Configure quantity-based pricing tiers for products.<br />
								Select a product from the Products page to manage its volume tiers.
							</p>
							<Link href={Routes.InternalStore.location}>
								<Button variant="primary" size="sm">
									Go to Products
								</Button>
							</Link>
						</div>
					</Card>
				</TabPanel>

				{/* Customers Tab */}
				<TabPanel value="customers">
					<CustomerAssignmentMatrix />
				</TabPanel>

				{/* Audit Logs Tab */}
				<TabPanel value="audit-logs">
					<PricingAuditLogViewer />
				</TabPanel>

				{/* Analytics Tab */}
				<TabPanel value="analytics">
					<PricingAnalytics isAdmin={isAdmin} />
				</TabPanel>
			</Tabs>
		</>
	)
}
