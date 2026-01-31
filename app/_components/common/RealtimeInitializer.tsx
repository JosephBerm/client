'use client'

import { useEffect } from 'react'

import { logger } from '@_core'
import { useAuthStore } from '@_features/auth'
import { useRealtimeEvents } from '@_shared/hooks'
import { realtimeSocketService } from '@_shared/services/realtime/realtimeSocketService'
import { useTenant } from '@_shared'

const REALTIME_FEATURE_FLAG = 'realtime-sockets'

export default function RealtimeInitializer() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
	const isAuthLoading = useAuthStore((state) => state.isLoading)
	const { uiConfig } = useTenant()

	const isFeatureEnabled = uiConfig?.enabledFeatures?.includes(REALTIME_FEATURE_FLAG) ?? false
	const shouldConnect = !isAuthLoading && isAuthenticated && isFeatureEnabled

	useRealtimeEvents({ enabled: shouldConnect })

	useEffect(() => {
		if (!shouldConnect) {
			void realtimeSocketService.disconnect()
			return
		}

		let isActive = true

		realtimeSocketService.connect().catch((error) => {
			if (!isActive) {
				return
			}
			logger.warn('Realtime socket connection failed', { error })
		})

		return () => {
			isActive = false
			void realtimeSocketService.disconnect()
		}
	}, [shouldConnect])

	return null
}

