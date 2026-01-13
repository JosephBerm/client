'use client'

/**
 * Integration Settings Page
 *
 * PRD Reference: client/md/PRDs/internal-routes/prd_erp_integration.md
 * RBAC: IntegrationsManage policy required (Admin only)
 *
 * This page provides:
 * - Provider-specific settings configuration
 * - Auto-sync and entity sync toggles
 * - Webhook configuration
 * - Connection management
 */

import { useState, useEffect } from 'react'

import { ArrowLeft, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

import { PermissionGuard, Resources, Actions } from '@_components/common/guards'
import Button from '@_components/ui/Button'
import Tabs, { TabsList, Tab, TabPanel } from '@_components/ui/Tabs'
import { IntegrationSettingsForm, useIntegrationConnections } from '@/app/_features/integrations'

import { InternalPageHeader } from '../../_components'

/**
 * Permission-denied fallback component
 */
function PermissionDenied() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
			<ShieldAlert className="h-16 w-16 text-warning mb-4" />
			<h2 className="text-2xl font-bold mb-2">Access Denied</h2>
			<p className="text-base-content/60 max-w-md">
				You don&apos;t have permission to manage ERP integration settings. This requires Admin access.
			</p>
			<Link href="/app/integrations" className="mt-4">
				<Button variant="outline">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Integrations
				</Button>
			</Link>
		</div>
	)
}

export default function IntegrationSettingsPage() {
	const { data: connections } = useIntegrationConnections()

	const hasQuickBooks = connections?.some((c) => c.provider === 'QuickBooks' && c.isConnected)
	const hasNetSuite = connections?.some((c) => c.provider === 'NetSuite' && c.isConnected)

	// Determine default tab based on which connections exist
	const defaultTab = hasQuickBooks ? 'quickbooks' : hasNetSuite ? 'netsuite' : 'quickbooks'
	const [activeTab, setActiveTab] = useState(defaultTab)

	// Update active tab when connections data loads
	useEffect(() => {
		if (connections) {
			const newDefault = hasQuickBooks ? 'quickbooks' : hasNetSuite ? 'netsuite' : 'quickbooks'
			setActiveTab(newDefault)
		}
	}, [connections, hasQuickBooks, hasNetSuite])

	return (
		<PermissionGuard
			resource={Resources.Integrations}
			action={Actions.Manage}
			fallback={<PermissionDenied />}
		>
			<div className="space-y-6 pb-8">
				<InternalPageHeader
					title="Integration Settings"
					description="Configure synchronization settings for your ERP integrations"
					actions={
						<Link href="/app/integrations">
							<Button variant="outline">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Integrations
							</Button>
						</Link>
					}
				/>

				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<Tab value="quickbooks" disabled={!hasQuickBooks}>
							QuickBooks
						</Tab>
						<Tab value="netsuite" disabled={!hasNetSuite}>
							NetSuite
						</Tab>
					</TabsList>

					<TabPanel value="quickbooks">
						{hasQuickBooks ? (
							<IntegrationSettingsForm provider="QuickBooks" />
						) : (
							<div className="mt-6 rounded-lg border border-base-300 bg-base-200/50 p-8 text-center">
								<h3 className="text-lg font-medium">QuickBooks Not Connected</h3>
								<p className="mt-2 text-base-content/60">
									Connect your QuickBooks account to configure settings.
								</p>
								<Link href="/app/integrations" className="mt-4 inline-block">
									<Button>Connect QuickBooks</Button>
								</Link>
							</div>
						)}
					</TabPanel>

					<TabPanel value="netsuite">
						{hasNetSuite ? (
							<IntegrationSettingsForm provider="NetSuite" />
						) : (
							<div className="mt-6 rounded-lg border border-base-300 bg-base-200/50 p-8 text-center">
								<h3 className="text-lg font-medium">NetSuite Not Connected</h3>
								<p className="mt-2 text-base-content/60">
									Connect your NetSuite account to configure settings.
								</p>
								<Link href="/app/integrations" className="mt-4 inline-block">
									<Button>Connect NetSuite</Button>
								</Link>
							</div>
						)}
					</TabPanel>
				</Tabs>
			</div>
		</PermissionGuard>
	)
}
