/**
 * PageContainer Component
 *
 * Simple container component that provides consistent page spacing and centering.
 * Does not include a page header - use PageLayout or ClientPageLayout for full page structure.
 * Ideal for custom layouts, landing pages, or pages that manage their own header.
 *
 * **Features:**
 * - Responsive container (container mx-auto)
 * - Consistent padding (p-4 on mobile, p-8 on desktop)
 * - No max-width constraint (full width within container)
 * - No page header elements
 * - Custom className support
 * - Server component safe
 *
 * **Use Cases:**
 * - Landing pages with custom layouts
 * - Pages that manage their own headers
 * - Nested content sections
 * - Custom page structures
 * - Marketing pages
 *
 * @example
 * ```tsx
 * import PageContainer from '@_components/layouts/PageContainer';
 *
 * // Basic usage
 * export default function CustomPage() {
 *   return (
 *     <PageContainer>
 *       <h1 className="text-4xl font-bold mb-4">Welcome</h1>
 *       <p>Your content here...</p>
 *     </PageContainer>
 *   );
 * }
 *
 * // With custom className
 * <PageContainer className="bg-base-200">
 *   <div className="card">
 *     <h2>Card Title</h2>
 *     <p>Card content</p>
 *   </div>
 * </PageContainer>
 *
 * // Landing page example
 * export default function LandingPage() {
 *   return (
 *     <PageContainer>
 *       <section className="hero min-h-screen">
 *         <div className="hero-content">
 *           <h1>MedSource Pro</h1>
 *           <p>Quality medical supplies</p>
 *         </div>
 *       </section>
 *       <section className="py-20">
 *         <h2>Features</h2>
 *       </section>
 *     </PageContainer>
 *   );
 * }
 * ```
 *
 * @module PageContainer
 */

import type { ReactNode } from 'react'
import classNames from 'classnames'

/**
 * PageContainer component props interface.
 */
interface PageContainerProps {
	/**
	 * Page content to render within the container.
	 */
	children: ReactNode

	/**
	 * Additional CSS classes to apply to the container.
	 */
	className?: string
}

/**
 * PageContainer Component
 *
 * Minimal container providing consistent spacing without page header structure.
 * Use when you need basic page spacing but want full control over content layout.
 *
 * **Styling:**
 * - container: Responsive container with max-width based on screen size
 * - mx-auto: Centers the container
 * - p-4: 1rem (16px) padding on mobile
 * - md:p-8: 2rem (32px) padding on desktop (768px+)
 *
 * **Comparison with Other Layouts:**
 * - PageContainer: No header, minimal structure
 * - PageLayout: Includes page header (title, description, actions) - server component
 * - ClientPageLayout: Same as PageLayout but with loading state - client component
 *
 * @param props - Component props including children and className
 * @returns PageContainer component
 */
export default function PageContainer({ children, className }: PageContainerProps) {
	return <div className={classNames('container mx-auto p-4 md:p-8', className)}>{children}</div>
}
