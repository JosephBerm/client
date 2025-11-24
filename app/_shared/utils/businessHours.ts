/**
 * Business Hours Utility
 * 
 * Timezone-aware business hours management for contact sections.
 * Provides utilities for checking if business is currently open, formatting times,
 * and supporting multiple timezones for global operations.
 * 
 * **Features:**
 * - Timezone-aware time calculations
 * - Current business status checking
 * - Internationalization support
 * - Configurable business hours
 * - Holiday/special hours support (future)
 * 
 * **FAANG Principles:**
 * - Single source of truth for business hours
 * - Type-safe configuration
 * - Testable and maintainable
 * - Performance optimized (caching where appropriate)
 * 
 * @module shared/utils/businessHours
 */

/**
 * Day of week identifier
 */
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

/**
 * Time slot configuration
 */
export interface TimeSlot {
	/** Opening time in 24-hour format (e.g., "08:00") */
	open: string
	/** Closing time in 24-hour format (e.g., "18:00") */
	close: string
	/** Timezone (IANA timezone identifier) */
	timezone: string
}

/**
 * Business hours configuration
 */
export interface BusinessHoursConfig {
	[key: string]: TimeSlot | null // null means closed
}

/**
 * Default business hours for MedSource Pro
 * 
 * **Configuration:**
 * - Monday-Friday: 8:00 AM - 6:00 PM EST
 * - Saturday: 9:00 AM - 2:00 PM EST
 * - Sunday: Closed
 * 
 * **Note:** Update these values via environment variables or CMS in production
 */
export const DEFAULT_BUSINESS_HOURS: BusinessHoursConfig = {
	monday: { open: '08:00', close: '18:00', timezone: 'America/New_York' },
	tuesday: { open: '08:00', close: '18:00', timezone: 'America/New_York' },
	wednesday: { open: '08:00', close: '18:00', timezone: 'America/New_York' },
	thursday: { open: '08:00', close: '18:00', timezone: 'America/New_York' },
	friday: { open: '08:00', close: '18:00', timezone: 'America/New_York' },
	saturday: { open: '09:00', close: '14:00', timezone: 'America/New_York' },
	sunday: null, // Closed
}

/**
 * Get current day of week in lowercase
 */
function getCurrentDay(): DayOfWeek {
	const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
	return days[new Date().getDay()]
}

/**
 * Parse time string (HH:MM) and return hours and minutes
 */
function parseTime(timeString: string): { hours: number; minutes: number } {
	const [hours, minutes] = timeString.split(':').map(Number)
	return { hours, minutes }
}

/**
 * Convert time to minutes since midnight for easy comparison
 */
function timeToMinutes(hours: number, minutes: number): number {
	return hours * 60 + minutes
}

/**
 * Get current time in target timezone
 */
function getCurrentTimeInTimezone(timezone: string): Date {
	return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }))
}

/**
 * Check if business is currently open
 * 
 * @param {BusinessHoursConfig} config - Business hours configuration (defaults to DEFAULT_BUSINESS_HOURS)
 * @returns {boolean} True if business is currently open
 * 
 * @example
 * ```typescript
 * if (isBusinessOpen()) {
 *   showLiveChat();
 * }
 * ```
 */
export function isBusinessOpen(config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS): boolean {
	const today = getCurrentDay()
	const todayHours = config[today]

	// Closed if no hours configured for today
	if (!todayHours) {
		return false
	}

	try {
		// Get current time in business timezone
		const currentTime = getCurrentTimeInTimezone(todayHours.timezone)
		const currentMinutes = timeToMinutes(currentTime.getHours(), currentTime.getMinutes())

		// Parse business hours
		const openTime = parseTime(todayHours.open)
		const closeTime = parseTime(todayHours.close)

		const openMinutes = timeToMinutes(openTime.hours, openTime.minutes)
		const closeMinutes = timeToMinutes(closeTime.hours, closeTime.minutes)

		// Check if current time is within business hours
		return currentMinutes >= openMinutes && currentMinutes < closeMinutes
	} catch (error) {
		// Log error and default to closed if timezone calculation fails
		console.error('Error checking business hours:', error)
		return false
	}
}

/**
 * Format time string for display (converts 24h to 12h format)
 * 
 * @param {string} time24 - Time in 24-hour format (e.g., "14:00")
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted time (e.g., "2:00 PM")
 * 
 * @example
 * ```typescript
 * formatTime("14:00") // "2:00 PM"
 * formatTime("09:00") // "9:00 AM"
 * ```
 */
export function formatTime(time24: string, locale: string = 'en-US'): string {
	const { hours, minutes } = parseTime(time24)
	const date = new Date()
	date.setHours(hours, minutes, 0, 0)

	return date.toLocaleTimeString(locale, {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	})
}

/**
 * Get business hours for a specific day with formatted times
 * 
 * @param {DayOfWeek} day - Day of week
 * @param {BusinessHoursConfig} config - Business hours configuration
 * @param {string} locale - Locale for time formatting
 * @returns {object} Formatted business hours or null if closed
 * 
 * @example
 * ```typescript
 * const hours = getBusinessHoursForDay('monday');
 * // { open: "8:00 AM", close: "6:00 PM", timezone: "EST", isClosed: false }
 * ```
 */
export function getBusinessHoursForDay(
	day: DayOfWeek,
	config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS,
	locale: string = 'en-US'
): { open: string; close: string; timezone: string; isClosed: false } | { isClosed: true } {
	const hours = config[day]

	if (!hours) {
		return { isClosed: true }
	}

	// Get timezone abbreviation (EST, PST, etc.)
	const timezoneAbbr = new Date()
		.toLocaleTimeString('en-US', {
			timeZone: hours.timezone,
			timeZoneName: 'short',
		})
		.split(' ')
		.pop() || 'EST'

	return {
		open: formatTime(hours.open, locale),
		close: formatTime(hours.close, locale),
		timezone: timezoneAbbr,
		isClosed: false,
	}
}

/**
 * Get next opening time if currently closed
 * 
 * @param {BusinessHoursConfig} config - Business hours configuration
 * @returns {string | null} Human-readable next opening time or null if open now
 * 
 * @example
 * ```typescript
 * const nextOpen = getNextOpeningTime();
 * // "Monday at 8:00 AM EST"
 * ```
 */
export function getNextOpeningTime(config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS): string | null {
	if (isBusinessOpen(config)) {
		return null // Already open
	}

	const daysOrder: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
	const today = getCurrentDay()
	const todayIndex = daysOrder.indexOf(today)

	// Check next 7 days
	for (let i = 1; i <= 7; i++) {
		const nextDayIndex = (todayIndex + i) % 7
		const nextDay = daysOrder[nextDayIndex]
		const nextDayHours = config[nextDay]

		if (nextDayHours) {
			const dayName = nextDay.charAt(0).toUpperCase() + nextDay.slice(1)
			const openTime = formatTime(nextDayHours.open)

			// Get timezone abbreviation
			const timezoneAbbr = new Date()
				.toLocaleTimeString('en-US', {
					timeZone: nextDayHours.timezone,
					timeZoneName: 'short',
				})
				.split(' ')
				.pop() || 'EST'

			return `${dayName} at ${openTime} ${timezoneAbbr}`
		}
	}

	return null // No opening hours found in next 7 days
}

/**
 * Get all business hours formatted for display
 * 
 * @param {BusinessHoursConfig} config - Business hours configuration
 * @param {string} locale - Locale for time formatting
 * @returns {Array} Array of formatted business hours by day
 * 
 * @example
 * ```typescript
 * const schedule = getAllBusinessHours();
 * // [
 * //   { day: 'Monday', open: '8:00 AM', close: '6:00 PM', timezone: 'EST' },
 * //   { day: 'Tuesday', ... },
 * //   ...
 * // ]
 * ```
 */
export function getAllBusinessHours(
	config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS,
	locale: string = 'en-US'
): Array<{ day: string; open: string; close: string; timezone: string } | { day: string; closed: true }> {
	const daysOrder: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

	return daysOrder.map((day) => {
		const dayName = day.charAt(0).toUpperCase() + day.slice(1)
		const hours = getBusinessHoursForDay(day, config, locale)

		if (hours.isClosed) {
			return { day: dayName, closed: true as const }
		}

		return {
			day: dayName,
			open: hours.open,
			close: hours.close,
			timezone: hours.timezone,
		}
	})
}

/**
 * Group consecutive days with same hours for compact display
 * 
 * @example
 * ```typescript
 * const grouped = getGroupedBusinessHours();
 * // [
 * //   { days: 'Monday - Friday', open: '8:00 AM', close: '6:00 PM', timezone: 'EST' },
 * //   { days: 'Saturday', open: '9:00 AM', close: '2:00 PM', timezone: 'EST' },
 * //   { days: 'Sunday', closed: true }
 * // ]
 * ```
 */
export function getGroupedBusinessHours(
	config: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS,
	locale: string = 'en-US'
): Array<{ days: string; open: string; close: string; timezone: string } | { days: string; closed: true }> {
	const allHours = getAllBusinessHours(config, locale)
	const grouped: Array<{ days: string; open: string; close: string; timezone: string } | { days: string; closed: true }> = []

	let currentGroup: (typeof allHours)[0] | null = null
	let startDay: string | null = null
	let endDay: string | null = null

	allHours.forEach((dayHours, index) => {
		if (!currentGroup) {
			// Start new group
			currentGroup = dayHours
			startDay = dayHours.day
			endDay = dayHours.day
		} else {
			// Check if this day matches current group
			const matches =
				'closed' in currentGroup && 'closed' in dayHours
					? true
					: 'open' in currentGroup &&
					  'open' in dayHours &&
					  currentGroup.open === dayHours.open &&
					  currentGroup.close === dayHours.close

			if (matches) {
				// Extend current group
				endDay = dayHours.day
			} else {
				// Push current group and start new one
				if ('closed' in currentGroup) {
					grouped.push({
						days: startDay === endDay ? startDay! : `${startDay} - ${endDay}`,
						closed: true,
					})
				} else {
					grouped.push({
						days: startDay === endDay ? startDay! : `${startDay} - ${endDay}`,
						open: currentGroup.open,
						close: currentGroup.close,
						timezone: currentGroup.timezone,
					})
				}

				currentGroup = dayHours
				startDay = dayHours.day
				endDay = dayHours.day
			}
		}

		// Push last group
		if (index === allHours.length - 1) {
			if ('closed' in currentGroup) {
				grouped.push({
					days: startDay === endDay ? startDay : `${startDay} - ${endDay}`,
					closed: true,
				})
			} else {
				grouped.push({
					days: startDay === endDay ? startDay : `${startDay} - ${endDay}`,
					open: currentGroup.open,
					close: currentGroup.close,
					timezone: currentGroup.timezone,
				})
			}
		}
	})

	return grouped
}

