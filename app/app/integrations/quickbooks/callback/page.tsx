'use client'

/**
 * QuickBooks OAuth Callback Page
 *
 * PRD Reference: client/md/PRDs/internal-routes/prd_erp_integration.md
 *
 * This page handles the OAuth callback from QuickBooks:
 * 1. Receives authorization code from QuickBooks
 * 2. Exchanges code for tokens via backend
 * 3. Shows success/error state
 * 4. Notifies opener window (if popup) or redirects
 */

import { useEffect, useState } from 'react'

import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

export default function QuickBooksCallbackPage() {
	const searchParams = useSearchParams()
	const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
	const [message, setMessage] = useState('')

	useEffect(() => {
		const handleCallback = async () => {
			const code = searchParams.get('code')
			const state = searchParams.get('state')
			const realmId = searchParams.get('realmId')
			const error = searchParams.get('error')
			const errorDescription = searchParams.get('error_description')

			// Check for OAuth error
			if (error) {
				setStatus('error')
				setMessage(errorDescription || error || 'Authorization was denied')
				notifyOpener(false, errorDescription || error)
				return
			}

			// Validate required parameters
			if (!code || !state || !realmId) {
				setStatus('error')
				setMessage('Missing required OAuth parameters')
				notifyOpener(false, 'Missing required OAuth parameters')
				return
			}

			try {
				// Exchange code for tokens via backend
				const response = await fetch('/api/quickbooks/callback', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ code, state, realmId }),
				})

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}))
					throw new Error(errorData.message || 'Failed to complete authorization')
				}

				setStatus('success')
				setMessage('QuickBooks connected successfully!')
				notifyOpener(true)

				// If not in popup, redirect after short delay
				if (!window.opener) {
					setTimeout(() => {
						window.location.href = '/app/integrations'
					}, 2000)
				}
			} catch (err) {
				setStatus('error')
				const errorMessage = err instanceof Error ? err.message : 'Failed to connect QuickBooks'
				setMessage(errorMessage)
				notifyOpener(false, errorMessage)
			}
		}

		handleCallback()
	}, [searchParams])

	/**
	 * Notifies the opener window (if this is a popup) about the OAuth result.
	 */
	const notifyOpener = (success: boolean, error?: string) => {
		if (window.opener) {
			window.opener.postMessage(
				{
					type: 'quickbooks-oauth-callback',
					success,
					error,
				},
				window.location.origin
			)
			// Close popup after a short delay
			setTimeout(() => {
				window.close()
			}, success ? 1500 : 3000)
		}
	}

	const handleClose = () => {
		if (window.opener) {
			window.close()
		} else {
			window.location.href = '/app/integrations'
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-base-100 p-4">
			<Card className="w-full max-w-md text-center">
				{/* QuickBooks Logo Header */}
				<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2CA01C]/10">
					<svg
						className="h-8 w-8"
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
				<h2 className="text-xl font-semibold mb-4">QuickBooks Authorization</h2>

				<div className="space-y-4">
					{status === 'processing' && (
						<div className="flex flex-col items-center gap-4 py-4">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<p className="text-base-content/60">Completing authorization...</p>
						</div>
					)}

					{status === 'success' && (
						<div className="flex items-start gap-3 rounded-lg border border-success/50 bg-success/10 p-4 text-left">
							<CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
							<div>
								<p className="font-medium text-success">Connected!</p>
								<p className="text-sm text-success/80">{message}</p>
							</div>
						</div>
					)}

					{status === 'error' && (
						<div className="flex items-start gap-3 rounded-lg border border-error/50 bg-error/10 p-4 text-left">
							<AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
							<div>
								<p className="font-medium text-error">Connection Failed</p>
								<p className="text-sm text-error/80">{message}</p>
							</div>
						</div>
					)}

					{status !== 'processing' && (
						<Button onClick={handleClose} className="w-full">
							{typeof window !== 'undefined' && window.opener ? 'Close Window' : 'Go to Integrations'}
						</Button>
					)}
				</div>
			</Card>
		</div>
	)
}
