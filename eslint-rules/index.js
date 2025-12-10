/**
 * Custom ESLint Plugin for MedSource Pro
 * 
 * This plugin provides custom rules to enforce project-specific coding standards.
 */

const noImgTag = require('./rules/no-img-tag')
const noNewDate = require('./rules/no-new-date')
const noConsoleLog = require('./rules/no-console-log')
const noCustomElements = require('./rules/no-custom-elements')
const noMagicStringRoutes = require('./rules/no-magic-string-routes')

module.exports = {
	rules: {
		'no-img-tag': noImgTag,
		'no-new-date': noNewDate,
		'no-console-log': noConsoleLog,
		'no-custom-elements': noCustomElements,
		'no-magic-string-routes': noMagicStringRoutes,
	},
	configs: {
		recommended: {
			rules: {
				'custom-rules/no-img-tag': 'error',
				'custom-rules/no-new-date': 'error',
				'custom-rules/no-console-log': 'error',
				'custom-rules/no-custom-elements': 'error',
				'custom-rules/no-magic-string-routes': 'error',
			},
		},
	},
}

