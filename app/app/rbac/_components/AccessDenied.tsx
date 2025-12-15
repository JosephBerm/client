/**
 * Access Denied Component
 * 
 * Reusable component for displaying access denied messages.
 * Used across RBAC pages when user lacks admin permissions.
 * 
 * @module RBAC AccessDenied
 */

import { Shield } from 'lucide-react'
import Card from '@_components/ui/Card'
import { InternalPageHeader } from '../../_components'

interface AccessDeniedProps {
	title?: string
	description?: string
}

export default function AccessDenied({
	title = 'Access Denied',
	description = 'Administrator access required.',
}: AccessDeniedProps) {
	return (
		<>
			<InternalPageHeader title={title} description={description} />
			<Card className="border-error/30 bg-error/5 p-8 text-center">
				<Shield className="w-12 h-12 text-error mx-auto mb-4" />
				<h3 className="text-lg font-semibold text-error">Access Restricted</h3>
				<p className="mt-2 text-base-content/70">
					This page is only accessible to administrators.
				</p>
			</Card>
		</>
	)
}
