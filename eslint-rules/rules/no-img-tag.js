/**
 * Rule: Prevent using <img> tag - must use Next.js Image component
 */
module.exports = {
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
}

