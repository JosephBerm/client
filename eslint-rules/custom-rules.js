/**
 * Custom ESLint Rules for MedSource Pro
 * 
 * Enforces project-specific coding standards:
 * - No <img> tags (use Next.js Image component)
 * - No new Date() (use date utils)
 * - No console.log (use logger service)
 * - No custom button/select/table (use built components)
 * - No magic string routes (use Routes system)
 */

module.exports = {
	rules: {
		/**
		 * Rule: Prevent using <img> tag - must use Next.js Image component
		 */
		'no-img-tag': {
			meta: {
				type: 'problem',
				docs: {
					description: 'Disallow <img> tags. Use Next.js Image component instead.',
					category: 'Best Practices',
					recommended: true,
				},
				messages: {
					noImgTag: '❌ Do not use <img> tag.\n✅ Use Next.js Image component instead:\n  import Image from "next/image";\n  <Image src={...} alt={...} />',
				},
				fixable: null,
			},
			create(context) {
				return {
					JSXOpeningElement(node) {
						if (node.name.name === 'img') {
							context.report({
								node,
								messageId: 'noImgTag',
							})
						}
					},
				}
			},
		},

		/**
		 * Rule: Prevent using new Date() - must use date utils
		 */
		'no-new-date': {
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
		},

		/**
		 * Rule: Prevent using console.log - must use logger service
		 */
		'no-console-log': {
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
		},

		/**
		 * Rule: Prevent creating custom button/select/table elements
		 * Must use built components from @_components/ui
		 */
		'no-custom-elements': {
			meta: {
				type: 'problem',
				docs: {
					description: 'Disallow custom button/select/table elements. Use built components from @_components/ui instead.',
					category: 'Best Practices',
					recommended: true,
				},
				messages: {
					noCustomButton: '❌ Do not create custom <button> elements.\n✅ Use Button component from @_components/ui:\n  import Button from "@_components/ui/Button";\n  <Button onClick={...}>Click me</Button>',
					noCustomSelect: '❌ Do not create custom <select> elements.\n✅ Use Select component from @_components/ui:\n  import Select from "@_components/ui/Select";\n  <Select options={...} value={...} onChange={...} />',
					noCustomTable: '❌ Do not create custom <table> elements.\n✅ Use Table components from @_components/tables:\n  import { DivTable } from "@_components/tables/DivTable";\n  <DivTable data={...} columns={...} />',
				},
				fixable: null,
			},
			create(context) {
				const restrictedElements = ['button', 'select', 'table']
				
				return {
					JSXOpeningElement(node) {
						const elementName = node.name.name
						
						if (restrictedElements.includes(elementName)) {
							// Check if it's imported from our UI components
							const sourceCode = context.getSourceCode()
							const importDeclarations = sourceCode.ast.body.filter(
								(node) => node.type === 'ImportDeclaration'
							)
							
							// Check if the element is imported from our component library
							const isImported = importDeclarations.some((importDecl) => {
								if (importDecl.source.value.includes('@_components/ui')) {
									return importDecl.specifiers.some((spec) => {
										if (spec.type === 'ImportDefaultSpecifier') {
											return spec.local.name === elementName
										}
										return false
									})
								}
								return false
							})
							
							if (!isImported) {
								let messageId
								if (elementName === 'button') {
									messageId = 'noCustomButton'
								} else if (elementName === 'select') {
									messageId = 'noCustomSelect'
								} else if (elementName === 'table') {
									messageId = 'noCustomTable'
								}
								
								context.report({
									node,
									messageId,
								})
							}
						}
					},
				}
			},
		},

		/**
		 * Rule: Prevent magic string routes - must use Routes system
		 */
		'no-magic-string-routes': {
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
				// Patterns that indicate route usage
				const routePatterns = [
					// router.push('/path')
					{
						check: (node) => {
							return (
								node.type === 'CallExpression' &&
								node.callee.type === 'MemberExpression' &&
								node.callee.property.name === 'push' &&
								node.arguments.length > 0 &&
								node.arguments[0].type === 'Literal' &&
								typeof node.arguments[0].value === 'string' &&
								(node.arguments[0].value.startsWith('/') ||
									node.arguments[0].value.startsWith('?'))
							)
						},
					},
					// router.replace('/path')
					{
						check: (node) => {
							return (
								node.type === 'CallExpression' &&
								node.callee.type === 'MemberExpression' &&
								node.callee.property.name === 'replace' &&
								node.arguments.length > 0 &&
								node.arguments[0].type === 'Literal' &&
								typeof node.arguments[0].value === 'string' &&
								(node.arguments[0].value.startsWith('/') ||
									node.arguments[0].value.startsWith('?'))
							)
						},
					},
					// href="/path" in JSX
					{
						check: (node) => {
							if (node.type === 'JSXAttribute' && node.name.name === 'href') {
								const value = node.value
								if (
									value &&
									value.type === 'Literal' &&
									typeof value.value === 'string' &&
									(value.value.startsWith('/') ||
										value.value.startsWith('?'))
								) {
									return true
								}
							}
							return false
						},
					},
					// redirect('/path')
					{
						check: (node) => {
							return (
								node.type === 'CallExpression' &&
								node.callee.type === 'Identifier' &&
								node.callee.name === 'redirect' &&
								node.arguments.length > 0 &&
								node.arguments[0].type === 'Literal' &&
								typeof node.arguments[0].value === 'string' &&
								(node.arguments[0].value.startsWith('/') ||
									node.arguments[0].value.startsWith('?'))
							)
						},
					},
				]

				return {
					// Check all nodes
					'CallExpression, JSXAttribute'(node) {
						for (const pattern of routePatterns) {
							if (pattern.check(node)) {
								// Check if Routes is imported
								const sourceCode = context.getSourceCode()
								const importDeclarations = sourceCode.ast.body.filter(
									(node) => node.type === 'ImportDeclaration'
								)

								const hasRoutesImport = importDeclarations.some((importDecl) => {
									return (
										importDecl.source.value === '@_features/navigation' ||
										importDecl.source.value.includes('routes')
									)
								})

								if (!hasRoutesImport) {
									context.report({
										node: node.arguments?.[0] || node.value || node,
										messageId: 'noMagicStringRoute',
									})
								}
							}
						}
					},
				}
			},
		},
	},
}

