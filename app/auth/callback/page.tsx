/**
 * OAuth Callback Page
 *
 * Handles the callback from external OAuth providers (Google, Microsoft).
 * Processes the authentication token and redirects to the appropriate page.
 *
 * **Flow:**
 * 1. User clicks social login button
 * 2. Redirects to backend /auth/external/challenge/{provider}
 * 3. Backend redirects to OAuth provider
 * 4. Provider redirects back to backend /auth/external/callback/{provider}
 * 5. Backend processes auth and redirects here with token
 * 6. This page stores the token and redirects to dashboard
 *
 * **Query Parameters:**
 * - token: JWT access token (on success)
 * - new: Whether this is a new account
 * - error: Error code (on failure)
 * - error_description: Human-readable error message
 * - linked: Whether an account was linked (for link flow)
 * - provider: Provider that was linked
 *
 * @module AuthCallbackPage
 */

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

import { useAuthStore, checkAuthStatus, useAuthRedirect } from '@_features/auth'
import { logger } from '@_core'
import { notificationService, storeTokens } from '@_shared'

/**
 * Status states for the callback page
 */
type CallbackStatus = 'processing' | 'success' | 'error' | 'linked'

/**
 * Error messages mapped from backend error codes
 */
const ERROR_MESSAGES: Record<string, string> = {
	invalid_provider: 'Invalid authentication provider.',
	auth_failed: 'Authentication failed. Please try again.',
	invalid_claims: 'Could not retrieve your information from the provider.',
	account_error: 'Failed to create or access your account.',
	account_suspended: 'Your account has been suspended. Please contact support.',
	account_archived: 'Your account is no longer active.',
	already_linked: 'This external account is already linked to another user.',
	server_error: 'An unexpected error occurred. Please try again.',
	invalid_state: 'Invalid authentication state. Please try again.',
}

/**
 * Inner component that uses useSearchParams
 */
function CallbackContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const loginUser = useAuthStore((state) => state.login)
	const { executePostAuthRedirect } = useAuthRedirect()

	const [status, setStatus] = useState<CallbackStatus>('processing')
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [isNewAccount, setIsNewAccount] = useState(false)

	useEffect(() => {
		const processCallback = async () => {
			// Check for errors first
			const error = searchParams.get('error')
			if (error) {
				const description = searchParams.get('error_description')
				const message = ERROR_MESSAGES[error] || description || 'Authentication failed.'

				logger.error('OAuth callback error', {
					component: 'AuthCallbackPage',
					error,
					description,
				})

				setErrorMessage(message)
				setStatus('error')
				return
			}

			// Check for account linking success
			const linked = searchParams.get('linked')
			if (linked === 'true') {
				const provider = searchParams.get('provider')

				logger.info('Account linking successful', {
					component: 'AuthCallbackPage',
					provider,
				})

				notificationService.success(`Successfully linked your ${provider} account!`)
				setStatus('linked')

				// Redirect to profile settings after delay
				setTimeout(() => {
					router.push('/settings/security')
				}, 2000)
				return
			}

			// Check for auth token
			const token = searchParams.get('token')
			if (!token) {
				logger.error('No token in OAuth callback', { component: 'AuthCallbackPage' })
				setErrorMessage('No authentication token received.')
				setStatus('error')
				return
			}

			// Check if new account
			const newAccount = searchParams.get('new') === 'true'
			setIsNewAccount(newAccount)

			try {
				// Store the access token using storeTokens
				// OAuth callback only receives the access token, so we create a minimal TokenPair
				// Backend should also set an HttpOnly refresh token cookie
				const accessTokenExpires =
					searchParams.get('expires') ?? new Date(Date.now() + 15 * 60 * 1000).toISOString()
				const refreshTokenExpires =
					searchParams.get('refresh_expires') ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
				storeTokens({
					accessToken: token,
					accessTokenExpires,
					refreshTokenExpires,
				})

				// Fetch user data
				const user = await checkAuthStatus()

				if (user) {
					loginUser(user)

					logger.info('OAuth login successful', {
						component: 'AuthCallbackPage',
						userId: user.id ?? undefined,
						isNew: newAccount,
					})

					if (newAccount) {
						notificationService.success('Welcome! Your account has been created.')
					} else {
						notificationService.success('Logged in successfully!')
					}

					setStatus('success')

					// Redirect using centralized AuthRedirectService
					// Priority: Intent → Return URL → Dashboard (default)
					setTimeout(() => {
						executePostAuthRedirect({
							onRedirect: (result) => {
								logger.info('OAuth post-auth redirect executed', {
									component: 'AuthCallbackPage',
									redirectType: result.type,
									url: result.url,
								})
							},
						})
					}, 1500)
				} else {
					throw new Error('Failed to fetch user data')
				}
			} catch (err) {
				logger.error('Error processing OAuth callback', {
					component: 'AuthCallbackPage',
					error: err,
				})

				setErrorMessage('Failed to complete authentication. Please try again.')
				setStatus('error')
			}
		}

		void processCallback()
	}, [searchParams, loginUser, router, executePostAuthRedirect])

	/**
	 * Handle retry - redirect to home with login modal
	 */
	const handleRetry = () => {
		router.push('/')
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-base-200 px-4'>
			<div className='card w-full max-w-md bg-base-100 shadow-xl'>
				<div className='card-body text-center'>
					{/* Processing State */}
					{status === 'processing' && (
						<>
							<div className='mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4'>
								<Loader2
									className='w-8 h-8 text-primary animate-spin'
									aria-hidden='true'
								/>
							</div>
							<h1 className='text-xl font-bold text-base-content'>Completing Sign In...</h1>
							<p className='text-base-content/70 mt-2'>
								Please wait while we finish setting up your session.
							</p>
						</>
					)}

					{/* Success State */}
					{status === 'success' && (
						<>
							<div className='mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4'>
								<CheckCircle
									className='w-8 h-8 text-success'
									aria-hidden='true'
								/>
							</div>
							<h1 className='text-xl font-bold text-base-content'>
								{isNewAccount ? 'Welcome!' : 'Welcome Back!'}
							</h1>
							<p className='text-base-content/70 mt-2'>
								{isNewAccount
									? 'Your account has been created. Redirecting to dashboard...'
									: 'Login successful. Redirecting to dashboard...'}
							</p>
						</>
					)}

					{/* Linked State */}
					{status === 'linked' && (
						<>
							<div className='mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4'>
								<CheckCircle
									className='w-8 h-8 text-success'
									aria-hidden='true'
								/>
							</div>
							<h1 className='text-xl font-bold text-base-content'>Account Linked!</h1>
							<p className='text-base-content/70 mt-2'>
								Your external account has been linked. Redirecting to settings...
							</p>
						</>
					)}

					{/* Error State */}
					{status === 'error' && (
						<>
							<div className='mx-auto w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4'>
								<XCircle
									className='w-8 h-8 text-error'
									aria-hidden='true'
								/>
							</div>
							<h1 className='text-xl font-bold text-base-content'>Authentication Failed</h1>
							<p className='text-base-content/70 mt-2'>{errorMessage}</p>
							<button
								onClick={handleRetry}
								className='btn btn-primary mt-4'
								type='button'>
								Try Again
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

/**
 * OAuth Callback Page Component
 *
 * Wraps the content in Suspense for useSearchParams
 */
export default function AuthCallbackPage() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen flex items-center justify-center bg-base-200'>
					<div className='card bg-base-100 shadow-xl p-8'>
						<Loader2 className='w-8 h-8 text-primary animate-spin mx-auto' />
						<p className='text-center mt-4'>Loading...</p>
					</div>
				</div>
			}>
			<CallbackContent />
		</Suspense>
	)
}
