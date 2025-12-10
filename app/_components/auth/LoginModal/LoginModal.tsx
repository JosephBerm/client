/**
 * LoginModal Component
 *
 * ChatGPT-style authentication modal with social login and email/password options.
 * Composes smaller, focused sub-components for maintainability.
 * 
 * **Architecture:**
 * - LoginModal (this file) - Orchestrates modal state and layout
 * - useAuthModal - Contains all auth business logic
 * - AuthModalHeader - Header with navigation controls
 * - SocialLoginButtons - OAuth provider buttons
 * - AuthDivider - "OR" separator
 * - LoginForm - Email/password login
 * - SignupForm - User registration
 *
 * **Features:**
 * - Social login (Google, Apple, Microsoft, Phone)
 * - Email/password authentication with progressive disclosure
 * - Integrated sign-up flow
 * - Mobile-first responsive design
 * - WCAG 2.1 AA accessible
 *
 * @module LoginModal
 */

'use client'

import Modal from '@_components/ui/Modal'

import AuthModalHeader from './AuthModalHeader'
import SocialLoginButtons from './SocialLoginButtons'
import AuthDivider from './AuthDivider'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import { useAuthModal } from './useAuthModal'
import { MODAL_SUBTITLES, LAYOUT_CLASSES } from './LoginModal.constants'

import type { LoginModalProps } from './LoginModal.types'

/**
 * LoginModal Component
 *
 * Main authentication modal that composes sub-components.
 * Uses useAuthModal hook for all business logic.
 *
 * @param props - Component props
 * @returns LoginModal component
 * 
 * @example
 * ```tsx
 * <LoginModal
 *   isOpen={isLoginOpen}
 *   onClose={() => setIsLoginOpen(false)}
 *   onLoginSuccess={() => console.log('User logged in!')}
 * />
 * ```
 */
export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
	const {
		currentView,
		isLoading,
		showEmailForm,
		loginForm,
		signupForm,
		handleSocialLogin,
		handleLoginFormSubmit,
		handleSignupFormSubmit,
		handleSwitchToSignup,
		handleSwitchToLogin,
		handleClose,
	} = useAuthModal({ onClose, onLoginSuccess })

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			size='sm'
			closeOnOverlayClick={true}
			closeOnEscape={true}
		>
			<div className={LAYOUT_CLASSES.MODAL_CONTAINER}>
				{/* Header with navigation controls */}
				<AuthModalHeader
					currentView={currentView}
					onSwitchToLogin={handleSwitchToLogin}
					onClose={handleClose}
				/>

				{/* Subtitle */}
				<p className={LAYOUT_CLASSES.SUBTITLE}>
					{MODAL_SUBTITLES[currentView]}
				</p>

				{/* Login View */}
				{currentView === 'login' && (
					<>
						{/* Social login options */}
						<SocialLoginButtons
							isHidden={showEmailForm}
							onSocialLogin={handleSocialLogin}
						/>

						{/* Divider */}
						<AuthDivider isHidden={showEmailForm} />

						{/* Email/password form */}
						<LoginForm
							form={loginForm}
							isLoading={isLoading}
							showPasswordField={showEmailForm}
							onSubmit={handleLoginFormSubmit}
							onSwitchToSignup={handleSwitchToSignup}
						/>
					</>
				)}

				{/* Signup View */}
				{currentView === 'signup' && (
					<SignupForm
						form={signupForm}
						isLoading={isLoading}
						onSubmit={handleSignupFormSubmit}
						onSwitchToLogin={handleSwitchToLogin}
					/>
				)}
			</div>
		</Modal>
	)
}

