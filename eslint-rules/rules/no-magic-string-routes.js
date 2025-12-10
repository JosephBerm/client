/**
 * Rule: Prevent magic string routes - must use Routes system
 */
module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow hardcoded string routes. Use Routes system from @_features/navigation instead.',
			category: 'Best Practices',
			recommended: true,
		},
		messages: {
			noMagicStringRoute: '❌ Do not use hardcoded string routes.\n✅ Use Routes system instead:\n  import { Routes } from "@_features/navigation";\n  router.push(Routes.Quotes.detail("456"));\n  router.push(Routes.Orders.location);\n  <Link href={Routes.Store.product("123")}>Product</Link>',
		},
		fixable: null,
	},
	create(context) {
		// Helper to check if Routes is imported
		function hasRoutesImport(sourceCode) {
			const importDeclarations = sourceCode.ast.body.filter(
				(node) => node.type === 'ImportDeclaration'
			)

			return importDeclarations.some((importDecl) => {
				if (!importDecl.source || !importDecl.source.value) return false
				const importPath = importDecl.source.value
				return (
					importPath === '@_features/navigation' ||
					importPath.includes('routes') ||
					importPath.includes('Routes')
				)
			})
		}

		// Helper to check if a string looks like a route
		function isRouteString(value) {
			if (typeof value !== 'string') return false
			return (
				value.startsWith('/') ||
				value.startsWith('?') ||
				(value.startsWith('http') && value.includes('localhost'))
			)
		}

		return {
			// Check router.push('/path') and router.replace('/path')
			CallExpression(node) {
				if (
					node.callee.type === 'MemberExpression' &&
					node.callee.property &&
					(node.callee.property.name === 'push' ||
						node.callee.property.name === 'replace')
				) {
					if (
						node.arguments.length > 0 &&
						node.arguments[0].type === 'Literal' &&
						isRouteString(node.arguments[0].value)
					) {
						const sourceCode = context.getSourceCode()
						if (!hasRoutesImport(sourceCode)) {
							context.report({
								node: node.arguments[0],
								messageId: 'noMagicStringRoute',
							})
						}
					}
				}

				// Check redirect('/path')
				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'redirect' &&
					node.arguments.length > 0 &&
					node.arguments[0].type === 'Literal' &&
					isRouteString(node.arguments[0].value)
				) {
					const sourceCode = context.getSourceCode()
					if (!hasRoutesImport(sourceCode)) {
						context.report({
							node: node.arguments[0],
							messageId: 'noMagicStringRoute',
						})
					}
				}
			},

			// Check href="/path" in JSX
			JSXAttribute(node) {
				if (node.name.name === 'href' && node.value) {
					if (
						node.value.type === 'Literal' &&
						isRouteString(node.value.value)
					) {
						const sourceCode = context.getSourceCode()
						if (!hasRoutesImport(sourceCode)) {
							context.report({
								node: node.value,
								messageId: 'noMagicStringRoute',
							})
						}
					}
				}
			},
		}
	},
}

