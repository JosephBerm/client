/**
 * Phone Authentication API Client
 *
 * Handles phone-based authentication via Twilio Verify API.
 *
 * **Authentication Flow:**
 * 1. Check if phone auth is available
 * 2. Send verification code to phone number
 * 3. User enters code from SMS
 * 4. Verify code and receive JWT tokens
 *
 * @example
 * ```typescript
 * import { PhoneAuthApi } from '@_shared/services/api'
 *
 * // Check availability
 * const { available } = await PhoneAuthApi.isAvailable()
 *
 * // Send code
 * await PhoneAuthApi.sendCode('+1234567890')
 *
 * // Verify and login
 * const response = await PhoneAuthApi.verify('+1234567890', '123456')
 * if (response.success) {
 *   // Store tokens, redirect to dashboard
 * }
 * ```
 *
 * @module PhoneAuthApi
 */

import { HttpService } from '../httpService'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PhoneAuthAvailability {
	available: boolean
	message?: string
}

export interface SendCodeRequest {
	phoneNumber: string
}

export interface SendCodeResponse {
	success: boolean
	message?: string
	error?: string
	expiresInSeconds?: number
}

export interface VerifyCodeRequest {
	phoneNumber: string
	code: string
}

export interface PhoneAuthAccountInfo {
	id: string
	phone?: string
	name?: string
	email?: string
}

export interface VerifyCodeResponse {
	success: boolean
	error?: string
	token?: string
	refreshToken?: string
	isNewAccount: boolean
	account?: PhoneAuthAccountInfo
}

// ═══════════════════════════════════════════════════════════════════════════════
// API CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Phone Authentication API client.
 *
 * Provides methods for phone-based OTP authentication.
 */
export const PhoneAuthApi = {
	/**
	 * Check if phone authentication is available.
	 *
	 * @returns Availability status
	 *
	 * @example
	 * ```typescript
	 * const { available } = await PhoneAuthApi.isAvailable()
	 * if (!available) {
	 *   // Hide phone auth option
	 * }
	 * ```
	 */
	async isAvailable(): Promise<PhoneAuthAvailability> {
		const response = await HttpService.get<PhoneAuthAvailability>(
			'/auth/phone/available'
		)
		return response.data?.payload ?? { available: false }
	},

	/**
	 * Send a verification code to a phone number.
	 *
	 * @param phoneNumber - Phone number in any format (will be normalized to E.164)
	 * @returns Send status and expiration time
	 *
	 * @example
	 * ```typescript
	 * const result = await PhoneAuthApi.sendCode('+1 (555) 123-4567')
	 * if (result.success) {
	 *   console.log(`Code expires in ${result.expiresInSeconds} seconds`)
	 * }
	 * ```
	 */
	async sendCode(phoneNumber: string): Promise<SendCodeResponse> {
		const response = await HttpService.post<SendCodeResponse>(
			'/auth/phone/send-code',
			{ phoneNumber }
		)
		return response.data?.payload ?? { success: false, error: 'Unknown error' }
	},

	/**
	 * Verify the code and authenticate the user.
	 *
	 * @param phoneNumber - Phone number (must match what was used for sendCode)
	 * @param code - The 6-digit verification code from SMS
	 * @returns Authentication result with JWT tokens
	 *
	 * @example
	 * ```typescript
	 * const result = await PhoneAuthApi.verify('+15551234567', '123456')
	 * if (result.success) {
	 *   // Store tokens
	 *   localStorage.setItem('token', result.token!)
	 *   localStorage.setItem('refreshToken', result.refreshToken!)
	 *
	 *   if (result.isNewAccount) {
	 *     // Redirect to profile setup
	 *   } else {
	 *     // Redirect to dashboard
	 *   }
	 * }
	 * ```
	 */
	async verify(phoneNumber: string, code: string): Promise<VerifyCodeResponse> {
		const response = await HttpService.post<VerifyCodeResponse>(
			'/auth/phone/verify',
			{ phoneNumber, code }
		)
		return response.data?.payload ?? { success: false, isNewAccount: false, error: 'Unknown error' }
	},

	/**
	 * Convenience method for the complete phone auth flow.
	 * Sends code, then verifies when callback is called with code.
	 *
	 * @param phoneNumber - Phone number to authenticate
	 * @returns Object with sendCode result and verify function
	 *
	 * @example
	 * ```typescript
	 * const { sendResult, verify } = await PhoneAuthApi.startFlow('+15551234567')
	 *
	 * if (sendResult.success) {
	 *   // Show code input UI
	 *   const code = await getUserInput()
	 *   const verifyResult = await verify(code)
	 * }
	 * ```
	 */
	async startFlow(phoneNumber: string): Promise<{
		sendResult: SendCodeResponse
		verify: (code: string) => Promise<VerifyCodeResponse>
	}> {
		const sendResult = await this.sendCode(phoneNumber)
		return {
			sendResult,
			verify: (code: string) => this.verify(phoneNumber, code),
		}
	},
}

export default PhoneAuthApi
