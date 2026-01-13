'use client'

import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle, Key, Loader2, ServerCog } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import FormInput from '@_components/forms/FormInput'
import { notificationService } from '@_shared'

import { IntegrationService } from '../services'
import type { IntegrationConnectionDTO } from '../types'
import { ConnectionStatus } from '../types'

// NetSuite credential validation schema
const netSuiteCredentialsSchema = z.object({
	accountId: z.string().min(1, 'Account ID is required'),
	consumerKey: z.string().min(1, 'Consumer key is required'),
	consumerSecret: z.string().min(1, 'Consumer secret is required'),
	tokenId: z.string().min(1, 'Token ID is required'),
	tokenSecret: z.string().min(1, 'Token secret is required'),
})

type NetSuiteCredentials = z.infer<typeof netSuiteCredentialsSchema>

interface NetSuiteConnectorProps {
	connection?: IntegrationConnectionDTO | null
	onConnectionUpdate?: () => void
}

/**
 * Component for managing NetSuite OAuth/TBA connection.
 * Uses Token-Based Authentication (TBA) for NetSuite integration.
 *
 * PRD Reference: US-ERP-007 (NetSuite connection)
 */
export function NetSuiteConnector({ connection, onConnectionUpdate }: NetSuiteConnectorProps) {
	const [isConnecting, setIsConnecting] = useState(false)
	const [isValidating, setIsValidating] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [showCredentialsForm, setShowCredentialsForm] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<NetSuiteCredentials>({
		resolver: zodResolver(netSuiteCredentialsSchema),
	})

	const handleConnect = async (credentials: NetSuiteCredentials) => {
		setIsConnecting(true)
		setError(null)

		try {
			const result = await IntegrationService.connectNetSuite(credentials)

			if (result.isSuccess) {
				notificationService.success('NetSuite connected successfully!')
				reset()
				setShowCredentialsForm(false)
				onConnectionUpdate?.()
			} else {
				setError(result.errorMessage || 'Failed to connect to NetSuite')
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to connect to NetSuite')
		} finally {
			setIsConnecting(false)
		}
	}

	const handleValidate = async () => {
		if (!connection?.id) return

		setIsValidating(true)
		setError(null)

		try {
			const result = await IntegrationService.testConnection(connection.id)

			if (result.success) {
				notificationService.success('NetSuite connection is valid!')
			} else {
				setError(result.message || 'Connection validation failed')
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Validation failed')
		} finally {
			setIsValidating(false)
		}
	}

	const isConnected = connection?.status === ConnectionStatus.Connected

	return (
		<Card>
			{/* Header */}
			<div className="flex items-center gap-3 mb-4">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A3A71]/10">
					<ServerCog className="h-6 w-6 text-[#1A3A71]" />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-base-content">NetSuite</h3>
					<p className="text-sm text-base-content/60">
						Connect your NetSuite account for enterprise ERP integration
					</p>
				</div>
			</div>

			{/* Content */}
			<div className="space-y-4">
				{error && (
					<div className="flex items-start gap-3 rounded-lg border border-error/50 bg-error/10 p-4">
						<AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
						<div>
							<p className="font-medium text-error">Connection Error</p>
							<p className="text-sm text-error/80">{error}</p>
						</div>
					</div>
				)}

				{isConnected ? (
					<div className="space-y-4">
						<div className="flex items-start gap-3 rounded-lg border border-success/50 bg-success/10 p-4">
							<CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
							<div>
								<p className="font-medium text-success">Connected</p>
								<p className="text-sm text-success/80">
									Connected to {connection?.companyName || 'NetSuite'}
									{connection?.externalCompanyId && (
										<>
											<br />
											Account ID: {connection.externalCompanyId}
										</>
									)}
									{connection?.lastSyncAt && (
										<>
											<br />
											Last synced: {new Date(connection.lastSyncAt).toLocaleString()}
										</>
									)}
								</p>
							</div>
						</div>

						<div className="flex flex-col gap-2 sm:flex-row">
							<Button
								variant="outline"
								className="flex-1"
								onClick={handleValidate}
								disabled={isValidating}
							>
								{isValidating ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<CheckCircle className="mr-2 h-4 w-4" />
								)}
								Test Connection
							</Button>
							<Button
								variant="outline"
								className="flex-1"
								onClick={() => setShowCredentialsForm(true)}
								disabled={isConnecting}
							>
								<Key className="mr-2 h-4 w-4" />
								Update Credentials
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						{!showCredentialsForm ? (
							<>
								<p className="text-sm text-base-content/60">
									Connect your NetSuite account using Token-Based Authentication (TBA).
									You&apos;ll need your Account ID, Consumer Key/Secret, and Token
									ID/Secret from NetSuite.
								</p>

								<Button
									onClick={() => setShowCredentialsForm(true)}
									className="w-full sm:w-auto"
								>
									<Key className="mr-2 h-4 w-4" />
									Enter Credentials
								</Button>
							</>
						) : (
							<form onSubmit={handleSubmit(handleConnect)} className="space-y-4">
								<div className="space-y-3">
									<FormInput
										label="Account ID"
										placeholder="e.g., 1234567"
										{...register('accountId')}
										error={errors.accountId}
										autoComplete="off"
									/>

									<FormInput
										label="Consumer Key"
										type="password"
										placeholder="Your consumer key"
										{...register('consumerKey')}
										error={errors.consumerKey}
										autoComplete="new-password"
									/>

									<FormInput
										label="Consumer Secret"
										type="password"
										placeholder="Your consumer secret"
										{...register('consumerSecret')}
										error={errors.consumerSecret}
										autoComplete="new-password"
									/>

									<FormInput
										label="Token ID"
										type="password"
										placeholder="Your token ID"
										{...register('tokenId')}
										error={errors.tokenId}
										autoComplete="new-password"
									/>

									<FormInput
										label="Token Secret"
										type="password"
										placeholder="Your token secret"
										{...register('tokenSecret')}
										error={errors.tokenSecret}
										autoComplete="new-password"
									/>
								</div>

								<div className="flex flex-col gap-2 pt-2 sm:flex-row">
									<Button
										type="button"
										variant="ghost"
										onClick={() => {
											setShowCredentialsForm(false)
											reset()
											setError(null)
										}}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={isConnecting} className="flex-1">
										{isConnecting ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<ServerCog className="mr-2 h-4 w-4" />
										)}
										{isConnecting ? 'Connecting...' : 'Connect NetSuite'}
									</Button>
								</div>
							</form>
						)}
					</div>
				)}
			</div>
		</Card>
	)
}

export default NetSuiteConnector
