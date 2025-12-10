/**
 * Rule: Prevent using console.log - must use logger service
 */
module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow console.log. Use logger service from @_core/logger instead.',
			category: 'Best Practices',
			recommended: true,
		},
		messages: {
			noConsoleLog: '❌ Do not use console.log().\n✅ Use logger service instead:\n  import { logger } from "@_core/logger";\n  logger.info("message", { data });\n  logger.error("error", { error });\n  logger.debug("debug", { data });',
		},
		fixable: null,
	},
	create(context) {
		return {
			MemberExpression(node) {
				if (
					node.object.type === 'Identifier' &&
					node.object.name === 'console' &&
					node.property.type === 'Identifier' &&
					node.property.name === 'log'
				) {
					context.report({
						node,
						messageId: 'noConsoleLog',
					})
				}
			},
		}
	},
}

