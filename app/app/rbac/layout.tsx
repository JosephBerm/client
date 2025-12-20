/**
 * RBAC Management Layout
 *
 * Provides error boundary and common layout for all RBAC pages.
 *
 * Architecture: Layout component wraps all nested routes with:
 * - Error boundary for graceful error handling
 * - Common providers (if needed in future)
 *
 * @see prd_rbac_management.md
 * @module app/rbac/layout
 */

import { RBACErrorBoundary } from './_components'

interface RBACLayoutProps {
	children: React.ReactNode
}

export default function RBACLayout({ children }: RBACLayoutProps) {
	return <RBACErrorBoundary>{children}</RBACErrorBoundary>
}

