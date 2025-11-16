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
		// Configure allowed quality values to prevent Next.js 16 warnings
		// Next.js 16+ requires explicit quality configuration for security and performance
		// Industry best practice: Allow a range of quality values for flexibility
		// Common values: 75 (low), 80 (medium-low), 85 (default/balanced), 90 (high), 95 (very high), 100 (lossless)
		qualities: [75, 80, 85, 90, 95, 100],
		// Configure allowed device sizes for responsive images
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		// Configure allowed image sizes for different use cases
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		// Modern image formats for optimal performance
		formats: ['image/webp', 'image/avif'],
		// Cache TTL in seconds (60s = 1 minute)
		minimumCacheTTL: 60,
	},
	turbopack: {
		resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
	},
}

export default nextConfig
