/**
 * Rule: Prevent using new Date() - must use date utils
 */
module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow new Date(). Use date utils from @_lib/dates instead.',
			category: 'Best Practices',
			recommended: true,
		},
		messages: {
			noNewDate: '❌ Do not use new Date().\n✅ Use date utils from @_lib/dates instead:\n  import { parseDate, parseDateOrNow } from "@_lib/dates";\n  const date = parseDateOrNow(); // or parseDate(input)',
		},
		fixable: null,
	},
	create(context) {
		return {
			NewExpression(node) {
				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'Date' &&
					node.arguments.length === 0
				) {
					context.report({
						node,
						messageId: 'noNewDate',
					})
				}
			},
		}
	},
}

