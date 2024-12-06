/** @type {import('next').NextConfig} */

const Environments = {
	development: {
		API_URL: 'http://localhost:5254/api',
		CLIENT_DOMAIN: 'https://localhost:3000',
		DEBUG: 'true',
	},
	production: {
		API_URL: 'https://prod-server20241205193558.azurewebsites.net/api',
		CLIENT_DOMAIN: 'https://www.medsourcepro.com',
		DEBUG: 'false',
	},
}

const nextConfig = {
	env: { ...Environments['development'] },
	images: {
		domains: ['img.freepik.com', 'localhost'],

	},
}

export default nextConfig
