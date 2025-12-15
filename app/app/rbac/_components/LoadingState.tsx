/**
 * Loading State Component
 * 
 * Reusable loading state component for RBAC pages.
 * 
 * @module RBAC LoadingState
 */

import { Loader2 } from 'lucide-react'
import Card from '@_components/ui/Card'

interface LoadingStateProps {
	message?: string
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
	return (
		<Card className="p-8 text-center">
			<Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
			<p className="mt-4 text-base-content/60">{message}</p>
		</Card>
	)
}
