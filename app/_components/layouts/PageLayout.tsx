/**
 * PageLayout Component
 *
 * Server component page layout wrapper with optional page header.
 * Provides consistent page structure, spacing, and max-width constraints.
 * Includes title, description, and action buttons in the header section.
 *
 * **Features:**
 * - Server component safe (no 'use client')
 * - Optional page header with title, description, and actions
 * - Configurable max-width (sm, md, lg, xl, 2xl, full)
 * - Responsive design with mobile-first approach
 * - Consistent padding and spacing
 * - Custom className support
 *
 * **Page Header:**
 * - Title: Large, bold text in primary color
 * - Description: Smaller, gray text below title
 * - Actions: Flex container for buttons (right-aligned on desktop)
 *
 * **Use Cases:**
 * - Standard admin pages
 * - Content pages with headers
 * - List pages (products, orders, users)
 * - Detail pages
 * - Settings pages
 *
 * @example
 * ```tsx
 * import PageLayout from '@_components/layouts/PageLayout';
 * import Button from '@_components/ui/Button';
 *
 * // Basic page with title
 * export default function ProductsPage() {
 *   return (
 *     <PageLayout title="Products">
 *       <div>Your content here...</div>
 *     </PageLayout>
 *   );
 * }
 *
 * // Full header with title, description, and actions
 * export default function OrdersPage() {
 *   return (
 *     <PageLayout
 *       title="Orders"
 *       description="Manage customer orders and track shipments"
 *       actions={
 *         <>
 *           <Button variant="ghost" href={Routes.Orders.export()}>
 *             Export
 *           </Button>
 *           <Button variant="primary" href={Routes.Orders.create()}>
 *             Create Order
 *           </Button>
 *         </>
 *       }
 *     >
 *       <OrdersTable />
 *     </PageLayout>
 *   );
 * }
 *
 * // Custom max-width
 * export default function ProfilePage() {
 *   return (
 *     <PageLayout
 *       title="Profile Settings"
 *       maxWidth="lg"
 *     >
 *       <UpdateAccountForm user={user} />
 *     </PageLayout>
 *   );
 * }
 *
 * // No header (just container and max-width)
 * export default function DashboardPage() {
 *   return (
 *     <PageLayout maxWidth="full">
 *       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 *         <StatCard />
 *         <StatCard />
 *         <StatCard />
 *       </div>
 *     </PageLayout>
 *   );
 * }
 * ```
 *
 * @module PageLayout
 */

import type { ReactNode } from 'react'
import classNames from 'classnames'

/**
 * PageLayout component props interface.
 */
interface PageLayoutProps {
	/**
	 * Page content to render below the header.
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
}

/**
 * PageLayout Component
 *
 * Full-featured page layout with optional header section.
 * Provides consistent structure for admin pages.
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
 * **Max-Width Options:**
 * - sm: max-w-screen-sm (640px)
 * - md: max-w-screen-md (768px)
 * - lg: max-w-screen-lg (1024px)
 * - xl: max-w-screen-xl (1280px)
 * - 2xl: max-w-screen-2xl (1536px) - default
 * - full: max-w-full (no constraint)
 *
 * **Server Component:**
 * This is a server component (no 'use client') and can be used in server-rendered pages.
 * For client-side features like loading states, use ClientPageLayout instead.
 *
 * @param props - Component props including children, title, description, actions, maxWidth, className
 * @returns PageLayout component
 */
export default function PageLayout({
	children,
	title,
	description,
	actions,
	maxWidth = '2xl',
	className,
}: PageLayoutProps) {
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

			{children}
		</div>
	)
}
