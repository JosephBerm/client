/**
 * Global Teardown - Cleanup After All Tests
 *
 * ARCHITECTURE: Runs once after all tests complete.
 * Used for cleanup, reporting, and resource management.
 *
 * @see https://playwright.dev/docs/test-global-setup-teardown
 */

import { FullConfig } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const AUTH_DIR = path.join(__dirname, '..', '.auth')

/**
 * Global teardown function
 * Runs once after all tests complete
 */
async function globalTeardown(config: FullConfig): Promise<void> {
	console.log('\n' + '='.repeat(60))
	console.log('🧹 PLAYWRIGHT GLOBAL TEARDOWN')
	console.log('='.repeat(60))
	console.log(`📅 ${new Date().toISOString()}`)

	// Optionally clean up storage states in CI
	// In development, we keep them to speed up subsequent runs
	if (process.env.CI && process.env.CLEANUP_AUTH_STATES === 'true') {
		console.log('\n🗑️  Cleaning up authentication storage states...')

		if (fs.existsSync(AUTH_DIR)) {
			const files = fs.readdirSync(AUTH_DIR)
			for (const file of files) {
				if (file.endsWith('.json')) {
					fs.unlinkSync(path.join(AUTH_DIR, file))
					console.log(`   Deleted: ${file}`)
				}
			}
		}
	} else {
		console.log('\n♻️  Keeping authentication storage states for reuse')
	}

	// Clean up failure screenshots
	if (fs.existsSync(AUTH_DIR)) {
		const files = fs.readdirSync(AUTH_DIR)
		const screenshots = files.filter((f) => f.endsWith('-auth-failure.png'))

		if (screenshots.length > 0) {
			console.log(`\n📸 ${screenshots.length} authentication failure screenshot(s) found:`)
			screenshots.forEach((s) => console.log(`   - ${s}`))
		}
	}

	console.log('\n' + '='.repeat(60) + '\n')
}

export default globalTeardown
