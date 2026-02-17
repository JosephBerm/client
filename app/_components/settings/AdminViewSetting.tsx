'use client'

import { Shield } from 'lucide-react'

import { useAdminView } from '@_shared'

import Toggle from '@_components/ui/Toggle'

/**
 * Admin View Setting Component
 *
 * Enables internal metadata visibility for privileged users.
 * This toggle is hidden for non-admin users.
 */
export default function AdminViewSetting() {
	const { isAdmin, isAdminViewActive, setAdminViewEnabled } = useAdminView()

	if (!isAdmin) {
		return null
	}

	return (
		<div className='flex items-center justify-between gap-4 py-4 px-4 sm:px-6'>
			<div className='flex-1 min-w-0'>
				<label
					htmlFor='admin-view-toggle'
					className='block text-sm md:text-base font-semibold text-base-content mb-1 md:mb-1.5'>
					<span className='inline-flex items-center gap-2'>
						<Shield
							className='h-4 w-4 text-info'
							aria-hidden='true'
						/>
						Admin View
					</span>
				</label>
				<p className='text-xs sm:text-sm text-base-content/70 leading-relaxed'>
					Show internal identifiers and operational metadata for admin workflows.
				</p>
			</div>
			<div className='shrink-0'>
				<Toggle
					id='admin-view-toggle'
					variant='info'
					size='sm'
					className='sm:toggle-md'
					checked={isAdminViewActive}
					onChange={(e) => setAdminViewEnabled(e.target.checked)}
					aria-label='Enable admin view'
				/>
			</div>
		</div>
	)
}
