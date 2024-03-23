import type { Config } from 'tailwindcss'

const config: Config = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				main: '#a264ff',
				'main-tinted': '#29114',
				accent: '#fff',
				bg: '#0d1224',
				header: '#0e1326',
				text: '#d3d8e8',
				'section-bg': '#181d2f',
				error: '#b22222',
				slate: '#8892b0',
				'dark-slate': '#495670',
				'darker-slate': '#0a0f1c',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
		},
		fontSize: {
			xxsm: '1.2rem',
			xsm: '1.3rem',
			sm: '1.4rem',
			base: '1.6rem',
			xl: '2rem',
			'2xl': '2.2rem',
			'3xl': '2.5rem',
			'4xl': '3rem',
			'5xl': '3.5rem',
		},
	},
	plugins: [],
}
export default config
