/**
 * API response unwrapping utilities.
 *
 * Supports both standardized envelope responses (`{ payload, message, statusCode }`)
 * and raw JSON responses for compatibility with legacy and mixed endpoints.
 */

export interface ApiTransportResponse {
	status: number
	data: unknown
}

export type ApiEnvelope<T> = {
	payload: T | null
	message?: string | null
	detail?: string | null
	title?: string | null
	statusCode?: number
}

export class ApiRequestError extends Error {
	readonly status: number

	constructor(message: string, status: number) {
		super(message)
		this.name = 'ApiRequestError'
		this.status = status
	}
}

export function hasPayloadEnvelope<T>(data: unknown): data is ApiEnvelope<T> {
	return typeof data === 'object' && data !== null && Object.prototype.hasOwnProperty.call(data, 'payload')
}

export function extractApiErrorMessage(data: unknown, fallback: string): string {
	if (typeof data === 'object' && data !== null) {
		const asRecord = data as Record<string, unknown>
		const { message, detail, title } = asRecord

		if (typeof message === 'string' && message.trim().length > 0) {
			return message
		}
		if (typeof detail === 'string' && detail.trim().length > 0) {
			return detail
		}
		if (typeof title === 'string' && title.trim().length > 0) {
			return title
		}
	}

	return fallback
}

export function ensureApiSuccessStatus(response: ApiTransportResponse, action: string): void {
	if (response.status >= 200 && response.status < 300) {
		return
	}

	const message = extractApiErrorMessage(response.data, `Failed to ${action}`)
	throw new ApiRequestError(`${message} (status: ${response.status})`, response.status)
}

export function unwrapApiPayload<T>(response: ApiTransportResponse, action: string): T {
	ensureApiSuccessStatus(response, action)

	const { data } = response
	if (hasPayloadEnvelope<T>(data)) {
		if (data.payload === null || data.payload === undefined) {
			const status = data.statusCode ?? response.status
			const message = extractApiErrorMessage(data, `Failed to ${action}`)
			throw new ApiRequestError(`${message} (status: ${status})`, status)
		}
		return data.payload
	}

	if (data === null || data === undefined) {
		throw new ApiRequestError(`Failed to ${action}: empty response`, response.status)
	}

	return data as T
}

export function unwrapApiNullablePayload<T>(response: ApiTransportResponse, action: string): T | null {
	ensureApiSuccessStatus(response, action)

	const { data } = response
	if (hasPayloadEnvelope<T>(data)) {
		return data.payload ?? null
	}

	if (data === undefined) {
		return null
	}

	return data as T
}

export function unwrapApiArrayPayload<T>(response: ApiTransportResponse, action: string): T[] {
	ensureApiSuccessStatus(response, action)

	const { data } = response
	if (hasPayloadEnvelope<T[]>(data)) {
		if (data.payload === null || data.payload === undefined) {
			return []
		}
		if (Array.isArray(data.payload)) {
			return data.payload
		}

		throw new ApiRequestError(`Failed to ${action}: invalid response shape`, response.status)
	}

	if (Array.isArray(data)) {
		return data as T[]
	}

	if (data === null || data === undefined) {
		return []
	}

	throw new ApiRequestError(`Failed to ${action}: invalid response shape`, response.status)
}
