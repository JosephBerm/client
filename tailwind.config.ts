import type { Config } from 'tailwindcss'

const config: Config = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-sans)'],
				mono: ['var(--font-mono)'],
			},
			// Custom brand colors for use in Tailwind classes
			colors: {
				'brand-1': '#416706',
				'brand-2': '#4d7a07',
				'brand-3': '#355405',
				'brand-4': '#2a4204',
				'brand-5': '#1e2f03',
				'teal': '#06614a',
				'darker-teal': '#055541',
			},
		},
	},
	plugins: [
		require('daisyui'),
	],
}

export default config
