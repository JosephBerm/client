/**
 * Next.js 16 Configuration - MedSource Pro
 * 
 * @see https://nextjs.org/docs/app/guides/upgrading/version-16
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js
 *
 * Breaking Changes Applied (Next.js 16):
 * - Turbopack is now the DEFAULT bundler (--turbo flag removed from dev script)
 * - middleware.ts renamed to proxy.ts (runs on Node.js, not Edge)
 * - next lint command removed (using ESLint directly via eslint.config.mjs)
 * - images.minimumCacheTTL default changed from 60 to 14400 (we keep 60)
 * - images.dangerouslyAllowLocalIP now defaults to false
 * - images.qualities default changed to [75] only
 * - images.imageSizes default removed 16
 *
 * @type {import('next').NextConfig}
 */

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Environment-specific configuration
 * In production, uses Azure backend. In development, uses localhost.
 * 
 * NOTE: API URLs do NOT include /api prefix - routes are at root level.
 * This is the MAANG-standard approach where API paths are defined by route
 * attributes (e.g., /Products/..., /Accounts/...), not by a global path prefix.
 */
const Environments = {
	development: {
		NEXT_PUBLIC_API_URL: 'http://localhost:5254',
		CLIENT_DOMAIN: 'http://localhost:3000',
	},
	production: {
		NEXT_PUBLIC_API_URL: 'https://prod-server20241205193558.azurewebsites.net',
		CLIENT_DOMAIN: 'https://www.medsourcepro.com',
	},
}

// Select environment based on NODE_ENV
const currentEnv = isProduction ? 'production' : 'development'

// =============================================================================
// NEXT.JS CONFIGURATION
// =============================================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
	// ---------------------------------------------------------------------------
	// Environment Variables
	// ---------------------------------------------------------------------------
	env: {
		...Environments[currentEnv],
	},

	// ---------------------------------------------------------------------------
	// React Configuration
	// ---------------------------------------------------------------------------
	
	/**
	 * React Strict Mode
	 * Enables additional checks and warnings for React 19.
	 * Recommended for catching potential issues early.
	 * 
	 * @see https://react.dev/reference/react/StrictMode
	 */
	reactStrictMode: true,

	// ---------------------------------------------------------------------------
	// Image Optimization Configuration
	// ---------------------------------------------------------------------------
	images: {
		/**
		 * Remote Patterns
		 * Whitelist of external image sources allowed by Next.js Image component.
		 * Required for security - prevents loading arbitrary external images.
		 */
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'img.freepik.com',
				pathname: '/**',
			},
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '5254',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'prod-server20241205193558.azurewebsites.net',
				pathname: '/**',
			},
		],

		/**
		 * Image Qualities
		 * Next.js 16 BREAKING CHANGE: Default is now [75] only.
		 * We explicitly allow multiple qualities for product images.
		 * 
		 * Use cases:
		 * - 75: Thumbnails, listings (good balance)
		 * - 85: Product detail images (default)
		 * - 90-100: High-quality medical product images where detail matters
		 */
		qualities: [75, 80, 85, 90, 95, 100],

		/**
		 * Device Sizes
		 * Breakpoints for responsive images.
		 * These generate srcset values for different viewport widths.
		 */
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

		/**
		 * Image Sizes
		 * Next.js 16 BREAKING CHANGE: Value 16 removed from default.
		 * We explicitly include 16 for small icons and thumbnails.
		 */
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

		/**
		 * Image Formats
		 * Modern formats for optimal compression.
		 * AVIF offers best compression, WebP has wider browser support.
		 */
		formats: ['image/avif', 'image/webp'],

		/**
		 * Minimum Cache TTL
		 * Next.js 16 BREAKING CHANGE: Default changed from 60 to 14400 (4 hours).
		 * 
		 * We keep 60 seconds for now because:
		 * - Product images may be updated by vendors
		 * - Quote-based business needs fresh pricing/availability indicators
		 * - Can increase to 3600 or 14400 after stable product catalog
		 * 
		 * @see business_flow.md - Product catalog performance considerations
		 */
		minimumCacheTTL: 60,

		/**
		 * Allow Local IP
		 * Next.js 16 BREAKING CHANGE: Now defaults to false.
		 * Required to load images from localhost during development.
		 * Only enabled in development for security.
		 */
		dangerouslyAllowLocalIP: isDevelopment,
	},

	// ---------------------------------------------------------------------------
	// Turbopack Configuration (Next.js 16 Stable)
	// ---------------------------------------------------------------------------
	
	/**
	 * Turbopack
	 * Next.js 16: Turbopack is now stable and the DEFAULT bundler.
	 * Moved from experimental to top-level configuration.
	 * 
	 * Benefits:
	 * - Faster cold starts
	 * - Faster HMR (Hot Module Replacement)
	 * - Better memory efficiency
	 */
	turbopack: {
		/**
		 * Resolve Extensions
		 * File extensions Turbopack will resolve, in order of preference.
		 * TypeScript files are prioritized over JavaScript.
		 */
		resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
	},

	// ---------------------------------------------------------------------------
	// Proxy/Middleware Configuration
	// ---------------------------------------------------------------------------
	
	/**
	 * Skip Proxy URL Normalize
	 * Prevents Next.js from normalizing URLs in proxy.ts
	 * Useful if you need to preserve exact URL structure.
	 * 
	 * Currently disabled - enable if needed for specific routing requirements.
	 */
	// skipProxyUrlNormalize: false,

	// ---------------------------------------------------------------------------
	// Build Configuration
	// ---------------------------------------------------------------------------
	
	/**
	 * TypeScript Configuration
	 * Strict type checking during build.
	 * 
	 * Note: ESLint configuration is no longer supported in next.config.mjs
	 * as of Next.js 16. Use eslint.config.mjs instead.
	 */
	typescript: {
		// Don't ignore TypeScript errors during build
		ignoreBuildErrors: false,
	},

	// ---------------------------------------------------------------------------
	// Performance & Security
	// ---------------------------------------------------------------------------
	
	/**
	 * Powered By Header
	 * Removes X-Powered-By header for security.
	 * Prevents exposing that we're using Next.js.
	 */
	poweredByHeader: false,

	/**
	 * Compress
	 * Enable gzip compression for responses.
	 */
	compress: true,

	// ---------------------------------------------------------------------------
	// React Compiler (Next.js 16 Stable)
	// ---------------------------------------------------------------------------

	/**
	 * React Compiler
	 * Automatically memoizes components, reducing unnecessary re-renders.
	 * Eliminates need for manual useMemo/useCallback in most cases.
	 *
	 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
	 *
	 * Benefits for MedSource Pro:
	 * - DataGrid/DivTable components (complex rendering)
	 * - Quote/Order tables with many columns
	 * - Product filtering and sorting
	 *
	 * Note: Compile times may be higher as React Compiler uses Babel.
	 * Requires: npm install -D babel-plugin-react-compiler
	 */
	reactCompiler: true,

	// ---------------------------------------------------------------------------
	// Cache Components (Next.js 16 Stable)
	// ---------------------------------------------------------------------------

	/**
	 * Cache Components
	 * Enables the "use cache" directive and Partial Prerendering (PPR).
	 * 
	 * @see https://nextjs.org/docs/app/getting-started/cache-components
	 * @see https://nextjs.org/docs/app/api-reference/directives/use-cache
	 * 
	 * Benefits for MedSource Pro:
	 * - Product Detail pages cached with cacheTag for granular invalidation
	 * - Static content (FAQ, About) included in static HTML shell
	 * - Faster Time to First Byte (TTFB) for product catalog
	 * - Reduced API calls for frequently accessed products
	 * 
	 * How it works:
	 * - Routes prerender into a static HTML shell
	 * - Dynamic content streams in via Suspense boundaries
	 * - "use cache" directive caches function/component output
	 * - cacheTag() enables on-demand revalidation
	 * - cacheLife() sets cache duration ('hours', 'days', 'max')
	 * 
	 * Note: Requires Node.js runtime (not Edge)
	 */
	cacheComponents: true,

	// ---------------------------------------------------------------------------
	// Experimental Features
	// ---------------------------------------------------------------------------

	experimental: {
		/**
		 * MCP Server (Model Context Protocol)
		 * Enables built-in MCP server for AI coding assistants.
		 * Accessible at http://localhost:3000/_next/mcp when dev server is running.
		 *
		 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js
		 */
		mcpServer: true,

		/**
		 * Optimize Package Imports
		 * Improves compilation speed for packages with many named exports (barrel files).
		 * 
		 * @see https://nextjs.org/docs/app/guides/package-bundling#packages-with-many-exports
		 * @see https://vercel.com/docs/conformance/rules/NEXTJS_MISSING_OPTIMIZE_PACKAGE_IMPORTS
		 * 
		 * Note: Many common packages (lucide-react, @heroicons/react, etc.) are 
		 * already auto-optimized by Next.js. We add less common ones here.
		 * 
		 * Benefits for MedSource Pro:
		 * - @tanstack/react-table: Used in 24+ files for data grids
		 * - react-hook-form: Used in 18+ files for form handling
		 * - zod: Schema validation library with many exports
		 */
		optimizePackageImports: [
			'@tanstack/react-table',
			'react-hook-form',
			'zod',
		],

		/**
		 * Turbopack File System Caching Notes:
		 *
		 * Next.js 16 Status:
		 * - turbopackFileSystemCacheForDev: ENABLED BY DEFAULT (no config needed)
		 * - turbopackFileSystemCacheForBuild: Requires Next.js canary (not stable yet)
		 *
		 * When turbopackFileSystemCacheForBuild becomes stable, enable it here:
		 * turbopackFileSystemCacheForBuild: true,
		 */
	},
}

export default nextConfig
