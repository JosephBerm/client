'use client'

import { useEffect } from 'react'

import { realtimeSocketService } from '@_shared/services/realtime/realtimeSocketService'

export function useRealtimeSubscription<TPayload>(
	eventName: string,
	handler: (payload: TPayload) => void,
	enabled: boolean
) {
	useEffect(() => {
		if (!enabled) {
			return
		}

		realtimeSocketService.on(eventName, handler)

		return () => {
			realtimeSocketService.off(eventName, handler)
		}
	}, [enabled, eventName, handler])
}

