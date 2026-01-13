'use client'

import { useCallback, useEffect, useState } from 'react'

import { AlertCircle, CheckCircle, ExternalLink, Loader2, LogIn } from 'lucide-react'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { IntegrationService } from '../services'
import type { IntegrationConnectionDTO } from '../types'
import { ConnectionStatus } from '../types'

interface QuickBooksConnectProps {
	connection?: IntegrationConnectionDTO | null
	onConnectionUpdate?: () => void
}

/**
 * Component for initiating and managing QuickBooks OAuth connection.
 * Handles the OAuth popup flow and provides status feedback.
 */
export function QuickBooksConnect({ connection, onConnectionUpdate }: QuickBooksConnectProps) {
	const [isConnecting, setIsConnecting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Listen for OAuth callback messages from popup
	const handleOAuthCallback = useCallback(
		(event: MessageEvent) => {
			// Validate origin
			if (event.origin !== window.location.origin) return

			const { type, success, error: callbackError } = event.data || {}

			if (type === 'quickbooks-oauth-callback') {
				setIsConnecting(false)
				if (success) {
					setError(null)
					onConnectionUpdate?.()
				} else {
					setError(callbackError || 'OAuth connection failed')
				}
			}
		},
		[onConnectionUpdate]
	)

	useEffect(() => {
		window.addEventListener('message', handleOAuthCallback)
		return () => window.removeEventListener('message', handleOAuthCallback)
	}, [handleOAuthCallback])

	const handleConnect = async () => {
		setIsConnecting(true)
		setError(null)

		try {
			// Get OAuth URL from backend
			const result = await IntegrationService.initiateQuickBooksConnection()

			// Open OAuth popup
			const width = 600
			const height = 700
			const left = window.screenX + (window.outerWidth - width) / 2
			const top = window.screenY + (window.outerHeight - height) / 2

			const popup = window.open(
				result.authorizationUrl,
				'QuickBooks Connect',
				`width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
			)

			// Poll to check if popup was closed without completing
			const pollTimer = setInterval(() => {
				if (popup?.closed) {
					clearInterval(pollTimer)
					setIsConnecting(false)
				}
			}, 500)
		} catch (err) {
			setIsConnecting(false)
			setError(err instanceof Error ? err.message : 'Failed to start connection')
		}
	}

	const isConnected = connection?.status === ConnectionStatus.Connected

	return (
		<Card>
			{/* Header */}
			<div className="flex items-center gap-3 mb-4">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2CA01C]/10">
					<svg
						className="h-6 w-6"
						viewBox="0 0 40 40"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M20 40c11.046 0 20-8.954 20-20S31.046 0 20 0 0 8.954 0 20s8.954 20 20 20z"
							fill="#2CA01C"
						/>
						<path
							d="M10.286 21.714c0-3.714 3.143-6.714 6.857-6.714 1.143 0 2.143.286 3 .714V12c0-1.143.857-2 2-2s2 .857 2 2v10.857c0 .571-.286 1.143-.714 1.429-.857.571-2 .714-3 .714h-.143c-1.857 0-3.571-.714-4.857-2-.143-.143-.286-.286-.286-.429l-.143-.143c-1.857-1.857-2.714-4.571-2.714-7.143zm8.857 3c-.571.286-1.286.429-2 .429-2.286 0-4.143-1.857-4.143-4.143s1.857-4.143 4.143-4.143c.714 0 1.429.143 2 .429v7.428z"
							fill="white"
						/>
						<path
							d="M23.143 28c0 3.714-3.143 6.714-6.857 6.714-1.143 0-2.143-.286-3-.714v3.714c0 1.143-.857 2-2 2s-2-.857-2-2V26.857c0-.571.286-1.143.714-1.429.857-.571 2-.714 3-.714h.143c1.857 0 3.571.714 4.857 2 .143.143.286.286.286.429l.143.143c1.857 1.857 2.714 4.571 2.714 7.143v.571zm-8.857-3c.571-.286 1.286-.429 2-.429 2.286 0 4.143 1.857 4.143 4.143s-1.857 4.143-4.143 4.143c-.714 0-1.429-.143-2-.429V25z"
							fill="white"
						/>
					</svg>
				</div>
				<div>
					<h3 className="text-lg font-semibold text-base-content">QuickBooks Online</h3>
					<p className="text-sm text-base-content/60">
						Connect your QuickBooks account for automatic accounting sync
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
									Connected to {connection?.companyName || 'QuickBooks'}
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
								onClick={handleConnect}
								disabled={isConnecting}
							>
								{isConnecting ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<ExternalLink className="mr-2 h-4 w-4" />
								)}
								Reconnect
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<p className="text-sm text-base-content/60">
							Connect your QuickBooks Online account to automatically sync customers, invoices,
							and payments. Your data is encrypted and securely stored.
						</p>

						<Button onClick={handleConnect} disabled={isConnecting} className="w-full sm:w-auto">
							{isConnecting ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<LogIn className="mr-2 h-4 w-4" />
							)}
							{isConnecting ? 'Connecting...' : 'Connect QuickBooks'}
						</Button>
					</div>
				)}
			</div>
		</Card>
	)
}

export default QuickBooksConnect
