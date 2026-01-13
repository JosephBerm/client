'use client'

/**
 * ERP Integrations Dashboard Page
 *
 * PRD Reference: client/md/PRDs/internal-routes/prd_erp_integration.md
 * RBAC: IntegrationsView policy required (Admin, SalesManager)
 *
 * This page provides:
 * - Overview of all ERP connections and their status
 * - Integration statistics and health monitoring
 * - Quick access to connection management
 * - Recent sync activity feed
 */

import { useState } from 'react'

import { Settings, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

import { PermissionGuard, Resources, Actions } from '@_components/common/guards'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import Skeleton from '@_components/ui/Skeleton'
import Tabs, { TabsList, Tab, TabPanel } from '@_components/ui/Tabs'
import {
	IntegrationConnectionCard,
	IntegrationStatsGrid,
	QuickBooksConnect,
	SyncLogsTable,
	useIntegrationDashboard,
} from '@/app/_features/integrations'

import { InternalPageHeader } from '../_components'

/**
 * Permission-denied fallback component
 */
function PermissionDenied() {
	return (
		<div className='flex flex-col items-center justify-center min-h-[50vh] text-center'>
			<ShieldAlert className='h-16 w-16 text-warning mb-4' />
			<h2 className='text-2xl font-bold mb-2'>Access Denied</h2>
			<p className='text-base-content/60 max-w-md'>
				You don&apos;t have permission to view ERP integrations. Contact your administrator if you need access.
			</p>
		</div>
	)
}

export default function IntegrationsPage() {
	const { data: dashboard, isLoading } = useIntegrationDashboard()
	const [activeTab, setActiveTab] = useState('overview')

	const quickbooksConnection = dashboard?.connections?.find((c) => c.provider === 'QuickBooks')
	const netsuiteConnection = dashboard?.connections?.find((c) => c.provider === 'NetSuite')

	return (
		<PermissionGuard
			resource={Resources.Integrations}
			action={Actions.Read}
			fallback={<PermissionDenied />}>
			<div className='space-y-6 pb-8'>
				<InternalPageHeader
					title='ERP Integrations'
					description='Connect and manage your accounting and ERP system integrations'
					actions={
						<PermissionGuard
							resource={Resources.Integrations}
							action={Actions.Manage}>
							<Link href='/app/integrations/settings'>
								<Button variant='outline'>
									<Settings className='mr-2 h-4 w-4' />
									Settings
								</Button>
							</Link>
						</PermissionGuard>
					}
				/>

				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}>
					<TabsList>
						<Tab value='overview'>Overview</Tab>
						<Tab value='connections'>Connections</Tab>
						<Tab value='logs'>Sync Logs</Tab>
					</TabsList>

					{/* Overview Tab */}
					<TabPanel value='overview'>
						<div className='space-y-6'>
							{/* Stats Grid */}
							<IntegrationStatsGrid />

							{/* Connection Cards */}
							<div className='grid gap-6 md:grid-cols-2'>
								{isLoading ? (
									<>
										<Card>
											<Skeleton className='h-32 w-full' />
										</Card>
										<Card>
											<Skeleton className='h-32 w-full' />
										</Card>
									</>
								) : (
									<>
										<QuickBooksConnect connection={quickbooksConnection} />
										{netsuiteConnection && (
											<IntegrationConnectionCard connection={netsuiteConnection} />
										)}
									</>
								)}
							</div>

							{/* Recent Activity */}
							<Card title='Recent Sync Activity'>
								{isLoading ? (
									<div className='space-y-2'>
										{Array.from({ length: 5 }).map((_, i) => (
											<Skeleton
												key={i}
												className='h-10 w-full'
											/>
										))}
									</div>
								) : dashboard?.recentActivity?.length ? (
									<div className='space-y-2'>
										{dashboard.recentActivity.slice(0, 10).map((activity, i) => (
											<div
												key={i}
												className='flex items-center justify-between rounded-md border border-base-300 p-3'>
												<div className='flex items-center gap-3'>
													<span className='font-medium'>{activity.provider}</span>
													<span className='text-base-content/60'>
														{activity.entityType} - {activity.operation}
													</span>
												</div>
												<div className='flex items-center gap-3'>
													<span
														className={`text-sm ${
															activity.status === 'Completed'
																? 'text-success'
																: activity.status === 'Failed'
																? 'text-error'
																: 'text-warning'
														}`}>
														{activity.status}
													</span>
													<span className='text-xs text-base-content/60'>
														{new Date(activity.timestamp).toLocaleString()}
													</span>
												</div>
											</div>
										))}
									</div>
								) : (
									<p className='py-8 text-center text-base-content/60'>No recent sync activity</p>
								)}
							</Card>
						</div>
					</TabPanel>

					{/* Connections Tab */}
					<TabPanel value='connections'>
						<div className='grid gap-6'>
							<QuickBooksConnect
								connection={quickbooksConnection}
								onConnectionUpdate={() => window.location.reload()}
							/>
							{netsuiteConnection && <IntegrationConnectionCard connection={netsuiteConnection} />}
						</div>
					</TabPanel>

					{/* Sync Logs Tab */}
					<TabPanel value='logs'>
						<Card title='Synchronization Logs'>
							<SyncLogsTable pageSize={20} />
						</Card>
					</TabPanel>
				</Tabs>
			</div>
		</PermissionGuard>
	)
}
