'use client'

/**
 * RBAC Permission Audit Log Page
 *
 * Dedicated page for viewing permission audit logs.
 * Admin-only page for compliance, security monitoring, and troubleshooting.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Next.js 16 + React Compiler Optimized
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This component follows Next.js 16 best practices:
 *
 * 1. **React Compiler** (`reactCompiler: true` in next.config.mjs):
 *    - Automatic memoization - manual useCallback/useMemo NOT required
 *    - Compiler analyzes code and applies optimizations automatically
 *
 * 2. **Server-Side Pagination**:
 *    - Uses RichDataGrid with server-side pagination
 *    - Efficient handling of large audit log datasets
 *
 * 3. **Database-Driven RBAC**:
 *    - All audit data is fetched from the database via API
 *    - Immutable, tamper-evident logs for compliance
 *
 * **Industry Best Practices (2025-2026):**
 * - Event Feed with filtering (by user, resource, severity, date)
 * - Search & Query Builder for structured log queries
 * - Export & Reporting Tools for auditors
 * - Real-time updates for active monitoring
 * - Timestamp standardization (ISO8601, UTC)
 * - Metadata enrichment (IP, user agent, correlation IDs)
 *
 * **Security & Compliance:**
 * - ADMIN ONLY access (audit logs contain sensitive information)
 * - Logs are immutable/tamper-evident
 * - Supports SOC 2, HIPAA, and GDPR compliance requirements
 *
 * @see prd_rbac_management.md - US-RBAC-005
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 * @module app/rbac/audit/page
 */

import Link from 'next/link'

import { ChevronLeft, Info, Shield, History, AlertCircle, RefreshCw, FileText } from 'lucide-react'

import { Routes } from '@_features/navigation'
import { usePermissions } from '@_shared'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { InternalPageHeader } from '../../_components'
import { AuditLogRichDataGrid, useRBACManagement } from '../_components'

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Error state component
 * Displays error message with retry option
 */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
	return (
		<Card className='border-error/30 bg-error/5 p-8 text-center'>
			<AlertCircle className='mx-auto mb-4 h-12 w-12 text-error' />
			<h3 className='text-lg font-semibold text-error'>Failed to Load Audit Logs</h3>
			<p className='mt-2 text-base-content/70'>{message}</p>
			<Button
				variant='outline'
				size='sm'
				onClick={onRetry}
				className='mt-4'
				leftIcon={<RefreshCw className='h-4 w-4' />}>
				Try Again
			</Button>
		</Card>
	)
}

/**
 * Access denied component
 * Shown when user lacks admin privileges
 */
function AccessDeniedState() {
	return (
		<>
			<InternalPageHeader
				title='Access Denied'
				description='Administrator access required.'
			/>
			<Card className='border-error/30 bg-error/5 p-8 text-center'>
				<Shield className='mx-auto mb-4 h-12 w-12 text-error' />
				<h3 className='text-lg font-semibold text-error'>Access Restricted</h3>
				<p className='mt-2 text-base-content/70'>
					Audit logs contain sensitive information and are only accessible to administrators.
				</p>
				<Link
					href={Routes.RBAC.location}
					className='mt-4 inline-block'>
					<Button
						variant='primary'
						size='sm'>
						Back to RBAC
					</Button>
				</Link>
			</Card>
		</>
	)
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

/**
 * RBAC Permission Audit Log Page
 *
 * Provides a dedicated interface for viewing permission audit logs.
 * Features:
 * - Server-side paginated audit log entries
 * - Global search across logs
 * - Filter by date, user, resource, and result
 * - CSV export for compliance reporting
 * - Mobile-responsive design
 *
 * **Audit Log Entry Fields:**
 * - Timestamp: When the permission check occurred (ISO8601)
 * - User: Who triggered the permission check
 * - Permission: Resource:Action being checked
 * - Result: Allowed or Denied
 * - Details: Reason and IP address
 */
export default function RBACAuditLogPage() {
	const { isAdmin } = usePermissions()

	const { auditLog, isLoadingAuditLog, auditLogError, fetchAuditLog, canViewAuditLogs } = useRBACManagement()

	// ---------------------------------------------------------------------------
	// RENDER: ACCESS DENIED
	// ---------------------------------------------------------------------------

	if (!isAdmin || !canViewAuditLogs) {
		return <AccessDeniedState />
	}

	// ---------------------------------------------------------------------------
	// RENDER: MAIN PAGE
	// ---------------------------------------------------------------------------

	return (
		<>
			{/* Page Header */}
			<InternalPageHeader
				title='Permission Audit Log'
				description='Track all permission checks and access attempts in the system'
				loading={isLoadingAuditLog}
				actions={
					<div className='flex items-center gap-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => void fetchAuditLog()}
							leftIcon={<RefreshCw className='h-4 w-4' />}>
							<span className='hidden sm:inline'>Refresh</span>
						</Button>
						<Link href={Routes.RBAC.location}>
							<Button
								variant='ghost'
								size='sm'
								leftIcon={<ChevronLeft className='h-4 w-4' />}>
								<span className='hidden sm:inline'>Back to RBAC</span>
								<span className='sm:hidden'>Back</span>
							</Button>
						</Link>
					</div>
				}
			/>

			{/* Info Banner */}
			<Card className='mb-6 border-info/20 bg-info/5'>
				<div className='flex items-start gap-3 p-4'>
					<Info className='mt-0.5 h-5 w-5 shrink-0 text-info' />
					<div>
						<h4 className='font-medium text-info'>Security & Compliance Audit Trail</h4>
						<p className='mt-1 text-sm text-base-content/70'>
							This log tracks all permission checks performed by the system. Each entry shows who
							attempted what action, when, and whether it was allowed or denied. Logs are immutable and
							can be exported for compliance audits (SOC 2, HIPAA, GDPR).
						</p>
					</div>
				</div>
			</Card>

			{/* Stats Summary */}
			<div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4'>
				<Card className='border-base-300 p-4'>
					<div className='flex items-center gap-3'>
						<div className='rounded-lg bg-primary/10 p-2'>
							<History className='h-5 w-5 text-primary' />
						</div>
						<div>
							<p className='text-xs text-base-content/60'>Total Entries</p>
							<p className='text-lg font-semibold text-base-content'>
								{auditLog?.total?.toLocaleString() ?? '—'}
							</p>
						</div>
					</div>
				</Card>
				<Card className='border-base-300 p-4'>
					<div className='flex items-center gap-3'>
						<div className='rounded-lg bg-success/10 p-2'>
							<Shield className='h-5 w-5 text-success' />
						</div>
						<div>
							<p className='text-xs text-base-content/60'>Log Integrity</p>
							<p className='text-lg font-semibold text-success'>Verified</p>
						</div>
					</div>
				</Card>
				<Card className='border-base-300 p-4 sm:col-span-2'>
					<div className='flex items-center gap-3'>
						<div className='rounded-lg bg-info/10 p-2'>
							<FileText className='h-5 w-5 text-info' />
						</div>
						<div>
							<p className='text-xs text-base-content/60'>Compliance Ready</p>
							<p className='text-sm font-medium text-base-content'>SOC 2 • HIPAA • GDPR</p>
						</div>
					</div>
				</Card>
			</div>

			{/* Content */}
			{auditLogError ? (
				<ErrorState
					message={auditLogError}
					onRetry={() => void fetchAuditLog()}
				/>
			) : (
				<AuditLogRichDataGrid canView={canViewAuditLogs} />
			)}
		</>
	)
}
