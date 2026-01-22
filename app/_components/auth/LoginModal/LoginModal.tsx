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

import { parseDateOrNow } from '@_lib/dates'

// Phase 1: Account status modals
import AccountLockedModal from '@_components/modals/AccountLockedModal'
import AccountSuspendedModal from '@_components/modals/AccountSuspendedModal'
import EmailVerificationModal from '@_components/modals/EmailVerificationModal'
import Modal from '@_components/ui/Modal'

import AuthDivider from './AuthDivider'
import AuthModalHeader from './AuthModalHeader'
import LoginForm from './LoginForm'
import { MODAL_SUBTITLES, LAYOUT_CLASSES } from './LoginModal.constants'
import MfaChallengeForm from './MfaChallengeForm'
import PhoneAuthForm from './PhoneAuthForm'
import SignupForm from './SignupForm'
import SocialLoginButtons from './SocialLoginButtons'
import { useAuthModal } from './useAuthModal'

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
		// Phase 1: Account status modal states
		showLockedModal,
		setShowLockedModal,
		showSuspendedModal,
		setShowSuspendedModal,
		showVerificationModal,
		setShowVerificationModal,
		userEmail,
		// MFA state
		mfaChallengeState,
		mfaError,
		handleMfaVerify,
		handleMfaCancel,
		// Phone auth state
		phoneNumber,
		setPhoneNumber,
		phoneCode,
		setPhoneCode,
		phoneCodeSent,
		phoneExpiresIn,
		handleSendPhoneCode,
		handleVerifyPhoneCode,
		handlePhoneCancel,
	} = useAuthModal({ onClose, onLoginSuccess })

	return (
		<>
			{/* Main Authentication Modal */}
			<Modal
				isOpen={isOpen}
				onClose={handleClose}
				size='sm'
				closeOnOverlayClick={true}
				closeOnEscape={true}>
				<div className={LAYOUT_CLASSES.MODAL_CONTAINER}>
					{/* Header with navigation controls */}
					<AuthModalHeader
						currentView={currentView}
						onSwitchToLogin={handleSwitchToLogin}
						onClose={handleClose}
					/>

					{/* Subtitle */}
					<p className={LAYOUT_CLASSES.SUBTITLE}>{MODAL_SUBTITLES[currentView]}</p>

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

					{/* MFA View */}
					{(currentView === 'mfa' || currentView === 'mfa-recovery') && (
						<MfaChallengeForm
							challengeId={mfaChallengeState?.challengeId ?? ''}
							expiresAt={mfaChallengeState?.expiresAt ?? parseDateOrNow()}
							onVerify={handleMfaVerify}
							onCancel={handleMfaCancel}
							isLoading={isLoading}
							error={mfaError}
						/>
					)}

					{/* Phone Auth View */}
					{currentView === 'phone' && (
						<PhoneAuthForm
							phoneNumber={phoneNumber}
							setPhoneNumber={setPhoneNumber}
							phoneCode={phoneCode}
							setPhoneCode={setPhoneCode}
							phoneCodeSent={phoneCodeSent}
							phoneExpiresIn={phoneExpiresIn}
							isLoading={isLoading}
							onSendCode={handleSendPhoneCode}
							onVerifyCode={handleVerifyPhoneCode}
							onCancel={handlePhoneCancel}
						/>
					)}
				</div>
			</Modal>

			{/* Phase 1: Account Status Modals */}
			{/* These appear when login fails due to account status */}
			<AccountLockedModal
				isOpen={showLockedModal}
				onClose={() => setShowLockedModal(false)}
			/>

			<AccountSuspendedModal
				isOpen={showSuspendedModal}
				onClose={() => setShowSuspendedModal(false)}
			/>

			<EmailVerificationModal
				isOpen={showVerificationModal}
				onClose={() => setShowVerificationModal(false)}
				email={userEmail}
			/>
		</>
	)
}
