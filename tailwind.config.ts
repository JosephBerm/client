import type { Config } from 'tailwindcss'

type DaisyUISettings = {
	themes: (Record<string, Record<string, string>> | string)[]
	defaultTheme: string
}

const config: Config & { daisyui: DaisyUISettings } = {
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
	daisyui: {
		themes: [
			{
				'medsource-classic': {
					primary: '#416706',
					'primary-content': '#ffffff',
					secondary: '#2a4204',
					'secondary-content': '#ffffff',
					accent: '#06614a',
					'accent-content': '#ffffff',
					neutral: '#393939',
					'neutral-content': '#ffffff',
					'base-100': '#fcfff7',
					'base-200': '#f8f8f8',
					'base-300': '#d8d8d8',
					'base-content': '#393939',
					info: '#00008b',
					success: '#4d7a07',
					warning: '#ffcc00',
					error: '#d22b2b',
				},
			},
			'winter',
			'luxury',
		],
		defaultTheme: 'medsource-classic',
	},
	plugins: [require('daisyui')],
}

export default config
