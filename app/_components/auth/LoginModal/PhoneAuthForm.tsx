/**
 * PhoneAuthForm Component
 *
 * Phone number authentication form with OTP verification.
 * Follows MAANG-level UX patterns for phone authentication flows.
 * Uses base components from @_components/ui for consistent styling.
 *
 * **Flow:**
 * 1. User enters phone number
 * 2. User clicks "Send Code" - SMS sent via Twilio
 * 3. User enters the 6-digit code
 * 4. User clicks "Verify" - Code verified, JWT issued
 *
 * @module LoginModal/PhoneAuthForm
 */

'use client'

import { useEffect, useState } from 'react'

import Button from '@_components/ui/Button'
import Input from '@_components/ui/Input'

import type { PhoneAuthFormProps } from './LoginModal.types'

/**
 * Format seconds to MM:SS display.
 */
function formatTimer(seconds: number): string {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * PhoneAuthForm Component
 *
 * Two-step phone authentication form.
 *
 * @param props - Component props
 * @returns PhoneAuthForm component
 */
export default function PhoneAuthForm({
	phoneNumber,
	setPhoneNumber,
	phoneCode,
	setPhoneCode,
	phoneCodeSent,
	phoneExpiresIn,
	isLoading,
	onSendCode,
	onVerifyCode,
	onCancel,
}: PhoneAuthFormProps) {
	// Countdown timer for code expiration
	const [countdown, setCountdown] = useState<number | null>(null)

	useEffect(() => {
		if (phoneExpiresIn && phoneCodeSent) {
			setCountdown(phoneExpiresIn)
			const timer = setInterval(() => {
				setCountdown((prev) => {
					if (prev === null || prev <= 1) {
						clearInterval(timer)
						return 0
					}
					return prev - 1
				})
			}, 1000)
			return () => clearInterval(timer)
		}
	}, [phoneExpiresIn, phoneCodeSent])

	return (
		<div className="space-y-6">
			{/* Phone Number Input */}
			{!phoneCodeSent && (
				<div>
					<Input
						id="phone-number"
						type="tel"
						autoComplete="tel"
						placeholder="+1 (555) 123-4567"
						value={phoneNumber}
						onChange={(e) => setPhoneNumber(e.target.value)}
						disabled={isLoading}
						aria-label="Phone Number"
						helperText="We'll send a verification code to this number"
					/>
				</div>
			)}

			{/* Verification Code Input */}
			{phoneCodeSent && (
				<div>
					<Input
						id="verification-code"
						type="text"
						inputMode="numeric"
						autoComplete="one-time-code"
						placeholder="123456"
						maxLength={8}
						value={phoneCode}
						onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ''))}
						disabled={isLoading}
						aria-label="Verification Code"
						className="text-center text-2xl tracking-widest"
						helperText={`Code sent to ${phoneNumber}`}
					/>
					<div className="mt-2 flex justify-end">
						{countdown !== null && countdown > 0 && (
							<p className="text-xs text-base-content/60">
								Expires in {formatTimer(countdown)}
							</p>
						)}
						{countdown === 0 && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={onSendCode}
								disabled={isLoading}
							>
								Resend code
							</Button>
						)}
					</div>
				</div>
			)}

			{/* Action Buttons */}
			<div className="space-y-3">
				{!phoneCodeSent ? (
					<Button
						type="button"
						variant="primary"
						fullWidth
						loading={isLoading}
						disabled={phoneNumber.length < 10}
						onClick={onSendCode}
					>
						Send Verification Code
					</Button>
				) : (
					<Button
						type="button"
						variant="primary"
						fullWidth
						loading={isLoading}
						disabled={phoneCode.length < 4}
						onClick={onVerifyCode}
					>
						Verify & Sign In
					</Button>
				)}

				<Button
					type="button"
					variant="outline"
					fullWidth
					disabled={isLoading}
					onClick={onCancel}
				>
					Back to Login
				</Button>
			</div>
		</div>
	)
}
