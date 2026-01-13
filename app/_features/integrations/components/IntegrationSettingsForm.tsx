'use client'

import { useEffect, useState } from 'react'

import { Loader2, Save, Settings } from 'lucide-react'
import { notificationService } from '@_shared'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import FormInput from '@_components/forms/FormInput'
import Select, { type SelectOption } from '@_components/ui/Select'

import { useIntegrationSettings, useUpdateIntegrationSettings } from '../hooks'
import type { IntegrationProvider, IntegrationSettingsDTO } from '../types'

interface IntegrationSettingsFormProps {
	provider: IntegrationProvider
}

const SYNC_INTERVAL_OPTIONS: SelectOption<string>[] = [
	{ label: 'Never (Manual Only)', value: '0' },
	{ label: 'Every 15 minutes', value: '15' },
	{ label: 'Every 30 minutes', value: '30' },
	{ label: 'Every hour', value: '60' },
	{ label: 'Every 2 hours', value: '120' },
	{ label: 'Every 4 hours', value: '240' },
	{ label: 'Every 6 hours', value: '360' },
	{ label: 'Every 12 hours', value: '720' },
	{ label: 'Daily', value: '1440' },
]

/**
 * Form for configuring integration settings for a specific provider.
 *
 * PRD Reference: prd_erp_integration.md - US-ERP-010 (Configure sync settings)
 */
export function IntegrationSettingsForm({ provider }: IntegrationSettingsFormProps) {
	const { data: settings, isLoading } = useIntegrationSettings(provider)
	const updateSettings = useUpdateIntegrationSettings()

	const [formState, setFormState] = useState<Partial<IntegrationSettingsDTO>>({
		autoSyncEnabled: false,
		syncIntervalMinutes: 60,
		syncCustomers: true,
		syncInvoices: true,
		syncPayments: true,
		syncProducts: false,
		defaultSalesTermId: '',
		webhooksEnabled: false,
	})

	// Load settings into form when data arrives
	useEffect(() => {
		if (settings) {
			setFormState({
				autoSyncEnabled: settings.autoSyncEnabled,
				syncIntervalMinutes: settings.syncIntervalMinutes,
				syncCustomers: settings.syncCustomers,
				syncInvoices: settings.syncInvoices,
				syncPayments: settings.syncPayments,
				syncProducts: settings.syncProducts,
				defaultSalesTermId: settings.defaultSalesTermId || '',
				webhooksEnabled: settings.webhooksEnabled,
			})
		}
	}, [settings])

	const handleSave = () => {
		updateSettings.mutate(
			{
				provider,
				settings: {
					...formState,
					provider,
				} as IntegrationSettingsDTO,
			},
			{
				onSuccess: () => {
					notificationService.success(`${provider} integration settings have been updated.`)
				},
				onError: (error) => {
					notificationService.error(error instanceof Error ? error.message : 'Failed to save settings')
				},
			}
		)
	}

	if (isLoading) {
		return (
			<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
				<div className="flex items-center justify-center py-8">
					<Loader2 className="h-6 w-6 animate-spin text-base-content/60" />
				</div>
			</Card>
		)
	}

	return (
		<Card className="border border-base-300 bg-base-100 shadow-sm">
			{/* Header */}
			<div className="border-b border-base-200 p-4">
				<div className="flex items-center gap-2">
					<Settings className="h-5 w-5 text-primary" />
					<h2 className="text-lg font-semibold">{provider} Settings</h2>
				</div>
				<p className="mt-1 text-sm text-base-content/60">
					Configure synchronization and behavior for your {provider} integration.
				</p>
			</div>

			<div className="space-y-6 p-4">
				{/* Auto-Sync Settings */}
				<div className="space-y-4">
					<h3 className="text-sm font-medium">Automatic Synchronization</h3>

					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<label htmlFor="auto-sync" className="text-sm font-medium">
								Enable Auto-Sync
							</label>
							<p className="text-sm text-base-content/60">
								Automatically synchronize data at the configured interval
							</p>
						</div>
						<input
							type="checkbox"
							id="auto-sync"
							className="toggle toggle-primary"
							checked={formState.autoSyncEnabled}
							onChange={(e) =>
								setFormState((prev) => ({ ...prev, autoSyncEnabled: e.target.checked }))
							}
						/>
					</div>

					<div className="space-y-1">
						<label htmlFor="sync-interval" className="text-sm font-medium">
							Sync Interval
						</label>
						<Select
							id="sync-interval"
							value={formState.syncIntervalMinutes?.toString() ?? '60'}
							onChange={(e) =>
								setFormState((prev) => ({ ...prev, syncIntervalMinutes: parseInt(e.target.value) }))
							}
							options={SYNC_INTERVAL_OPTIONS}
							disabled={!formState.autoSyncEnabled}
						/>
					</div>
				</div>

				{/* Entity Sync Settings */}
				<div className="space-y-4">
					<h3 className="text-sm font-medium">Entity Synchronization</h3>
					<p className="text-sm text-base-content/60">
						Choose which entities to synchronize with {provider}.
					</p>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="flex items-center justify-between rounded-md border border-base-300 p-3">
							<label htmlFor="sync-customers" className="text-sm font-medium">
								Customers
							</label>
							<input
								type="checkbox"
								id="sync-customers"
								className="toggle toggle-primary toggle-sm"
								checked={formState.syncCustomers}
								onChange={(e) =>
									setFormState((prev) => ({ ...prev, syncCustomers: e.target.checked }))
								}
							/>
						</div>

						<div className="flex items-center justify-between rounded-md border border-base-300 p-3">
							<label htmlFor="sync-invoices" className="text-sm font-medium">
								Invoices
							</label>
							<input
								type="checkbox"
								id="sync-invoices"
								className="toggle toggle-primary toggle-sm"
								checked={formState.syncInvoices}
								onChange={(e) =>
									setFormState((prev) => ({ ...prev, syncInvoices: e.target.checked }))
								}
							/>
						</div>

						<div className="flex items-center justify-between rounded-md border border-base-300 p-3">
							<label htmlFor="sync-payments" className="text-sm font-medium">
								Payments
							</label>
							<input
								type="checkbox"
								id="sync-payments"
								className="toggle toggle-primary toggle-sm"
								checked={formState.syncPayments}
								onChange={(e) =>
									setFormState((prev) => ({ ...prev, syncPayments: e.target.checked }))
								}
							/>
						</div>

						<div className="flex items-center justify-between rounded-md border border-base-300 p-3">
							<label htmlFor="sync-products" className="text-sm font-medium">
								Products
							</label>
							<input
								type="checkbox"
								id="sync-products"
								className="toggle toggle-primary toggle-sm"
								checked={formState.syncProducts}
								onChange={(e) =>
									setFormState((prev) => ({ ...prev, syncProducts: e.target.checked }))
								}
							/>
						</div>
					</div>
				</div>

				{/* Webhooks */}
				<div className="space-y-4">
					<h3 className="text-sm font-medium">Real-Time Updates</h3>

					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<label htmlFor="webhooks" className="text-sm font-medium">
								Enable Webhooks
							</label>
							<p className="text-sm text-base-content/60">
								Receive real-time updates from {provider} when data changes
							</p>
						</div>
						<input
							type="checkbox"
							id="webhooks"
							className="toggle toggle-primary"
							checked={formState.webhooksEnabled}
							onChange={(e) =>
								setFormState((prev) => ({ ...prev, webhooksEnabled: e.target.checked }))
							}
						/>
					</div>
				</div>

				{/* Provider-Specific Settings */}
				{provider === 'QuickBooks' && (
					<div className="space-y-4">
						<h3 className="text-sm font-medium">QuickBooks-Specific Settings</h3>

						<FormInput
							label="Default Sales Term ID"
							placeholder="e.g., Net 30 term ID"
							value={formState.defaultSalesTermId}
							onChange={(e) =>
								setFormState((prev) => ({ ...prev, defaultSalesTermId: e.target.value }))
							}
							helperText="The default payment term to apply to new invoices in QuickBooks"
						/>
					</div>
				)}

				{/* Save Button */}
				<div className="flex justify-end border-t border-base-200 pt-4">
					<Button variant="primary" onClick={handleSave} disabled={updateSettings.isPending}>
						{updateSettings.isPending ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Save className="mr-2 h-4 w-4" />
						)}
						Save Settings
					</Button>
				</div>
			</div>
		</Card>
	)
}

export default IntegrationSettingsForm
