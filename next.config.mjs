/** @type {import('next').NextConfig} */

const Environments = {
	development: {
		NEXT_PUBLIC_API_URL: 'http://localhost:5254/api',
		CLIENT_DOMAIN: 'https://localhost:3000',
	},
	production: {
		NEXT_PUBLIC_API_URL: 'https://prod-server20241205193558.azurewebsites.net/api',
		CLIENT_DOMAIN: 'https://www.medsourcepro.com',
	},
}

const nextConfig = {
	env: { ...Environments['production'] },
	images: {
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
	experimental: {
		turbo: {
			resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
		},
	},
}

export default nextConfig
