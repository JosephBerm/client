/**
 * ClientPageLayout Component
 *
 * Client component page layout wrapper with optional page header and loading state.
 * Identical to PageLayout but runs on the client side and supports loading indicators.
 * Use when you need client-side features like loading states or client-only hooks.
 *
 * **Features:**
 * - Client component ('use client' directive)
 * - Optional page header with title, description, and actions
 * - Built-in loading state with spinner
 * - Configurable max-width (sm, md, lg, xl, 2xl, full)
 * - Responsive design with mobile-first approach
 * - Consistent padding and spacing
 * - Custom className support
 *
 * **Loading State:**
 * When loading=true, displays centered spinner instead of children.
 * Useful for data fetching or async operations.
 *
 * **Use Cases:**
 * - Pages with client-side data fetching
 * - Pages using client-only hooks (useEffect, useState, etc.)
 * - Pages with loading states
 * - Interactive pages requiring client features
 *
 * @example
 * ```tsx
 * import ClientPageLayout from '@_components/layouts/ClientPageLayout';
 * import { useState, useEffect } from 'react';
 *
 * // Page with loading state
 * export default function ProductsPage() {
 *   const [products, setProducts] = useState<Product[]>([]);
 *   const [loading, setLoading] = useState(true);
 *
 *   useEffect(() => {
 *     fetchProducts().then(data => {
 *       setProducts(data);
 *       setLoading(false);
 *     });
 *   }, []);
 *
 *   return (
 *     <ClientPageLayout
 *       title="Products"
 *       description="Browse our medical supply catalog"
 *       loading={loading}
 *     >
 *       <ProductGrid products={products} />
 *     </ClientPageLayout>
 *   );
 * }
 *
 * // With actions and loading
 * export default function OrdersPage() {
 *   const { orders, isLoading } = useOrders();
 *
 *   return (
 *     <ClientPageLayout
 *       title="Orders"
 *       description="Manage customer orders"
 *       actions={
 *         <Button variant="primary" onClick={handleCreateOrder}>
 *           Create Order
 *         </Button>
 *       }
 *       loading={isLoading}
 *     >
 *       <OrdersTable orders={orders} />
 *     </ClientPageLayout>
 *   );
 * }
 *
 * // Custom max-width
 * export default function ProfilePage() {
 *   const [saving, setSaving] = useState(false);
 *
 *   return (
 *     <ClientPageLayout
 *       title="Profile Settings"
 *       maxWidth="lg"
 *       loading={saving}
 *     >
 *       <UpdateAccountForm onSubmit={handleSubmit} />
 *     </ClientPageLayout>
 *   );
 * }
 * ```
 *
 * @module ClientPageLayout
 */

'use client'

import type { ReactNode } from 'react'
import classNames from 'classnames'

/**
 * ClientPageLayout component props interface.
 */
interface ClientPageLayoutProps {
	/**
	 * Page content to render below the header.
	 * Hidden when loading=true.
	 */
	children: ReactNode

	/**
	 * Optional page title displayed in header.
	 * Large, bold text in primary color.
	 */
	title?: string

	/**
	 * Optional page description displayed below title.
	 * Smaller text in gray color.
	 */
	description?: string

	/**
	 * Optional action buttons/elements for the header.
	 * Typically buttons like "Create", "Export", "Settings".
	 * Displayed on the right side of header (desktop) or below title (mobile).
	 */
	actions?: ReactNode

	/**
	 * Maximum width constraint for the container.
	 * @default '2xl'
	 */
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

	/**
	 * Additional CSS classes to apply to the container.
	 */
	className?: string

	/**
	 * Whether the page is in loading state.
	 * When true, displays centered spinner instead of children.
	 * @default false
	 */
	loading?: boolean
}

/**
 * ClientPageLayout Component
 *
 * Client-side page layout with header and loading state support.
 * Identical structure to PageLayout but runs on the client.
 *
 * **Container:**
 * - Responsive container with configurable max-width
 * - Centered with mx-auto
 * - Padding: p-4 on mobile, p-8 on desktop
 *
 * **Page Header:**
 * - Responsive flex layout (column on mobile, row on desktop)
 * - Title: text-2xl (mobile) to text-4xl (desktop)
 * - Description: text-sm (mobile) to text-base (desktop)
 * - Actions: Flex wrap with gap-2
 * - Bottom margin: mb-6 (mobile), mb-8 (desktop)
 *
 * **Loading State:**
 * - Replaces children with centered spinner
 * - Min height of 400px to prevent layout shift
 * - Large spinner (loading-lg) in primary color
 * - Uses DaisyUI loading classes
 *
 * **Max-Width Options:**
 * - sm: max-w-screen-sm (640px)
 * - md: max-w-screen-md (768px)
 * - lg: max-w-screen-lg (1024px)
 * - xl: max-w-screen-xl (1280px)
 * - 2xl: max-w-screen-2xl (1536px) - default
 * - full: max-w-full (no constraint)
 *
 * **Client Component:**
 * This is a client component ('use client') and can use client-side hooks.
 * For server-rendered pages without loading state, use PageLayout instead.
 *
 * **Comparison:**
 * - PageLayout: Server component, no loading state
 * - ClientPageLayout: Client component, with loading state
 * - PageContainer: Minimal, no header
 *
 * @param props - Component props including children, title, description, actions, maxWidth, className, loading
 * @returns ClientPageLayout component
 */
export default function ClientPageLayout({
	children,
	title,
	description,
	actions,
	maxWidth = '2xl',
	className,
	loading = false,
}: ClientPageLayoutProps) {
	const maxWidthClass = {
		sm: 'max-w-screen-sm',
		md: 'max-w-screen-md',
		lg: 'max-w-screen-lg',
		xl: 'max-w-screen-xl',
		'2xl': 'max-w-screen-2xl',
		full: 'max-w-full',
	}[maxWidth]

	return (
		<div className={classNames('container mx-auto p-4 md:p-8', maxWidthClass, className)}>
			{(title || description || actions) && (
				<div className="mb-6 md:mb-8">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							{title && (
								<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">
									{title}
								</h1>
							)}
							{description && (
								<p className="text-sm md:text-base text-base-content/70">{description}</p>
							)}
						</div>
						{actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
					</div>
				</div>
			)}

			{loading ? (
				<div className="flex items-center justify-center min-h-[400px]">
					<span className="loading loading-spinner loading-lg text-primary"></span>
				</div>
			) : (
				children
			)}
		</div>
	)
}
