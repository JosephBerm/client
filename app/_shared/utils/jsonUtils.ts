/**
 * JSON Utilities
 *
 * Shared helpers for safe JSON parsing.
 * Keeps parsing logic DRY across the app.
 */

/**
 * Safely parses a JSON string, returning undefined on failure instead of throwing.
 *
 * NOTE: Returns undefined (not null) to align with backend omitting null fields.
 * This ensures consistent handling of missing/invalid data throughout the app.
 *
 * @template T - The expected type of the parsed JSON
 * @param value - The JSON string to parse (undefined returns undefined)
 * @returns The parsed value as type T, or undefined if parsing fails
 *
 * @example
 * ```ts
 * const data = safeJsonParse<{ name: string }>(jsonString)
 * if (data) {
 *   console.log(data.name)
 * }
 * ```
 */
export function safeJsonParse<T>(value?: string): T | undefined {
	if (!value) {
		return undefined
	}

	try {
		return JSON.parse(value) as T
	} catch {
		return undefined
	}
}
