'use client'

import { useEffect } from 'react'
import useDropdownStore from '../stores/useDropdownStore'

const DropdownProvider = ({ children }: { children: React.ReactNode }) => {
	dropdowns: useDropdownStore((state) => state.dropdowns)

	const initializeListener = useDropdownStore((state) => state.initializeListener)
	useEffect(() => {
		const cleanup = initializeListener()
		return () => cleanup()
	}, [initializeListener])

	return <>{children}</>
}

export default DropdownProvider
