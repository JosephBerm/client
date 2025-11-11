import type { NextConfig } from 'next'

const Environments = {
	development: {
		API_URL: 'http://localhost:5254/api',
		CLIENT_DOMAIN: 'https://localhost:3000',
	},
	production: {
		API_URL: 'https://prod-server20241205193558.azurewebsites.net/api',
		CLIENT_DOMAIN: 'https://www.medsourcepro.com',
	},
}

const nextConfig: NextConfig = {
	env: { ...Environments['production'] },
	images: {
		// Next.js 15: Use remotePatterns instead of deprecated domains
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'img.freepik.com',
			},
			{
				protocol: 'http',
				hostname: 'localhost',
			},
			{
				protocol: 'https',
				hostname: 'prod-server20241205193558.azurewebsites.net',
			},
		],
	},
	// Turbopack is now the default in Next.js 15
	// Use --webpack flag in scripts if you need Webpack instead
	turbopack: {
		// Add Turbopack-specific configurations here if needed
	},
}

export default nextConfig




