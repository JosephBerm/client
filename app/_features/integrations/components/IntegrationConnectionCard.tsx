'use client'

/**
 * IntegrationConnectionCard Component
 *
 * Displays an ERP integration connection status with controls.
 *
 * **DRY Compliance:**
 * - Uses Card from @_components/ui/Card
 * - Uses Badge from @_components/ui/Badge
 * - Uses Button from @_components/ui/Button
 * - Uses Checkbox from @_components/ui/Checkbox
 * - Mobile-first responsive design
 *
 * @module integrations/components
 */

import { useState } from 'react'

import { AlertCircle, CheckCircle, Clock, RefreshCw, Settings, Unplug } from 'lucide-react'

import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import Checkbox from '@_components/ui/Checkbox'

import { useDisconnectIntegration, useTestConnection, useUpdateConnectionSettings } from '../hooks'
import type { IntegrationConnectionDTO, UpdateConnectionSettingsRequest } from '../types'

interface IntegrationConnectionCardProps {
	connection: IntegrationConnectionDTO
	onSettingsClick?: () => void
}

/**
 * Card displaying an integration connection status and controls.
 */
export function IntegrationConnectionCard({ connection, onSettingsClick }: IntegrationConnectionCardProps) {
	const [showSettings, setShowSettings] = useState(false)

	const updateSettings = useUpdateConnectionSettings()
	const testConnection = useTestConnection()
	const disconnect = useDisconnectIntegration()

	const handleToggleSetting = (key: keyof UpdateConnectionSettingsRequest, value: boolean) => {
		updateSettings.mutate({
			connectionId: connection.id,
			request: { [key]: value },
		})
	}

	const handleTestConnection = () => {
		testConnection.mutate(connection.id)
	}

	const handleDisconnect = () => {
		if (window.confirm(`Are you sure you want to disconnect ${connection.providerDisplayName}?`)) {
			disconnect.mutate(connection.id)
		}
	}

	const getStatusBadge = () => {
		if (!connection.isConnected) {
			return (
				<Badge
					variant='neutral'
					badgeStyle='soft'
					className='gap-1'>
					<Clock className='h-3 w-3' />
					Not Connected
				</Badge>
			)
		}
		if (connection.needsReauthorization || connection.isTokenExpired) {
			return (
				<Badge
					variant='error'
					badgeStyle='solid'
					className='gap-1'>
					<AlertCircle className='h-3 w-3' />
					Needs Reauthorization
				</Badge>
			)
		}
		if (connection.lastSyncError) {
			return (
				<Badge
					variant='warning'
					badgeStyle='solid'
					className='gap-1'>
					<AlertCircle className='h-3 w-3' />
					Sync Error
				</Badge>
			)
		}
		return (
			<Badge
				variant='success'
				badgeStyle='solid'
				className='gap-1'>
				<CheckCircle className='h-3 w-3' />
				Connected
			</Badge>
		)
	}

	return (
		<Card
			title={connection.providerDisplayName}
			subtitle={connection.companyName ?? connection.externalCompanyId ?? 'Not connected'}
			variant='elevated'
			hover={false}
			className='w-full'>
			{/* Status Badge */}
			<div className='flex justify-end -mt-8 mb-4'>{getStatusBadge()}</div>

			{/* Connection Info - Mobile-first: single column on mobile */}
			<div className='grid grid-cols-1 gap-4 text-sm sm:grid-cols-2'>
				<div>
					<span className='text-base-content/60'>Last Sync:</span>{' '}
					{connection.lastSyncAt ? new Date(connection.lastSyncAt).toLocaleString() : 'Never'}
				</div>
				<div>
					<span className='text-base-content/60'>Connected By:</span> {connection.connectedBy ?? '-'}
				</div>
			</div>

			{/* Error Message */}
			{connection.lastSyncError && (
				<div className='rounded-md bg-error/10 p-3 text-sm text-error mt-4'>
					<AlertCircle className='mr-2 inline h-4 w-4' />
					{connection.lastSyncError}
				</div>
			)}

			{/* Settings Toggle */}
			{connection.isConnected && (
				<div className='mt-4'>
					<Button
						variant='ghost'
						size='sm'
						onClick={() => setShowSettings(!showSettings)}
						className='gap-2'>
						<Settings className='h-4 w-4' />
						{showSettings ? 'Hide Settings' : 'Show Settings'}
					</Button>

					{showSettings && (
						<div className='space-y-3 rounded-md border border-base-300 p-3 mt-3'>
							<div className='flex items-center justify-between'>
								<span className='text-sm'>Auto-sync enabled</span>
								<Checkbox
									checked={connection.autoSyncEnabled}
									onChange={(e) => handleToggleSetting('autoSyncEnabled', e.target.checked)}
								/>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-sm'>Sync Customers</span>
								<Checkbox
									checked={connection.syncCustomers}
									onChange={(e) => handleToggleSetting('syncCustomers', e.target.checked)}
								/>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-sm'>Sync Invoices</span>
								<Checkbox
									checked={connection.syncInvoices}
									onChange={(e) => handleToggleSetting('syncInvoices', e.target.checked)}
								/>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-sm'>Sync Payments</span>
								<Checkbox
									checked={connection.syncPayments}
									onChange={(e) => handleToggleSetting('syncPayments', e.target.checked)}
								/>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-sm'>Sync Products</span>
								<Checkbox
									checked={connection.syncProducts}
									onChange={(e) => handleToggleSetting('syncProducts', e.target.checked)}
								/>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Actions */}
			<div className='flex flex-wrap gap-2 mt-4'>
				{connection.isConnected ? (
					<>
						<Button
							variant='outline'
							size='sm'
							onClick={handleTestConnection}
							disabled={testConnection.isPending}
							className='gap-2'
							title={`Test connection to ${connection.providerDisplayName}`}>
							<RefreshCw className={`h-4 w-4 ${testConnection.isPending ? 'animate-spin' : ''}`} />
							Test
						</Button>

						<Button
							variant='error'
							size='sm'
							onClick={handleDisconnect}
							disabled={disconnect.isPending}
							className='gap-2'>
							<Unplug className='h-4 w-4' />
							Disconnect
						</Button>
					</>
				) : (
					<Button
						variant='primary'
						size='sm'
						onClick={onSettingsClick}
						className='gap-2'>
						Connect {connection.providerDisplayName}
					</Button>
				)}
			</div>

			{/* Test Result */}
			{testConnection.isSuccess && (
				<div
					className={`rounded-md p-2 text-sm mt-4 ${
						testConnection.data.success ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
					}`}>
					{testConnection.data.message}
				</div>
			)}
		</Card>
	)
}

export default IntegrationConnectionCard
