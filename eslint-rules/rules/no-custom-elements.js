/**
 * Rule: Prevent creating custom button/select/table elements
 * Must use built components from @_components/ui
 */
module.exports = {
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
						if (importDecl.source && importDecl.source.value) {
							const importPath = importDecl.source.value
							if (
								importPath.includes('@_components/ui') ||
								importPath.includes('@_components/tables')
							) {
								return importDecl.specifiers.some((spec) => {
									if (spec.type === 'ImportDefaultSpecifier') {
										return spec.local.name === elementName
									}
									if (spec.type === 'ImportSpecifier') {
										return spec.imported.name === elementName
									}
									return false
								})
							}
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
}

