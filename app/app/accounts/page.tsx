/**
 * Accounts Page
 * 
 * Admin page for managing user accounts in the system.
 * Provides CRUD operations and role management capabilities.
 * 
 * **Features:**
 * - Server-side paginated user list
 * - View, create, and delete accounts
 * - Role assignment (admin only)
 * 
 * **Next.js 16 Optimization:**
 * - Page is a Server Component (no 'use client' directive)
 * - Static elements rendered on server for better FCP
 * - Only interactive components (AccountsDataGrid) are Client Components
 * - Header actions use Link for navigation (no useRouter needed)
 * 
 * **Route**: /app/accounts
 * 
 * @module app/accounts/page
 */

import Link from 'next/link'

import { Plus } from 'lucide-react'

import { Routes } from '@_features/navigation'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { InternalPageHeader } from '../_components'

import { AccountsDataGrid } from './_components'

// ============================================================================
// PAGE COMPONENT (Server Component)
// ============================================================================

export default function AccountsPage() {
	return (
		<>
			<InternalPageHeader
				title="Accounts"
				description="Manage user accounts in the system"
				actions={
					<Link href={Routes.Accounts.create()}>
						<Button
							variant="primary"
							leftIcon={<Plus className="w-5 h-5" />}
						>
							Create Account
						</Button>
					</Link>
				}
			/>

			<Card>
				<div className="card-body">
					<AccountsDataGrid />
				</div>
			</Card>
		</>
	)
}
