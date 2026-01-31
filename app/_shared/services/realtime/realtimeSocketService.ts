import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'

import { logger } from '@_core'

export type RealtimeConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

type ReconnectHandler = (connectionId?: string) => void
type ConnectionStateHandler = (state: RealtimeConnectionState) => void

class RealtimeSocketService {
	private connection: HubConnection | null = null
	private stateHandlers = new Set<ConnectionStateHandler>()
	private reconnectHandlers = new Set<ReconnectHandler>()
	private pendingHandlers = new Map<string, Set<(payload: unknown) => void>>()
	private state: RealtimeConnectionState = 'disconnected'

	getState(): RealtimeConnectionState {
		return this.state
	}

	onStateChange(handler: ConnectionStateHandler): () => void {
		this.stateHandlers.add(handler)
		return () => this.stateHandlers.delete(handler)
	}

	onReconnected(handler: ReconnectHandler): () => void {
		this.reconnectHandlers.add(handler)
		return () => this.reconnectHandlers.delete(handler)
	}

	on<TPayload>(eventName: string, handler: (payload: TPayload) => void): void {
		if (!this.pendingHandlers.has(eventName)) {
			this.pendingHandlers.set(eventName, new Set())
		}

		this.pendingHandlers.get(eventName)!.add(handler as (payload: unknown) => void)
		this.connection?.on(eventName, handler)
	}

	off<TPayload>(eventName: string, handler: (payload: TPayload) => void): void {
		this.pendingHandlers.get(eventName)?.delete(handler as (payload: unknown) => void)
		this.connection?.off(eventName, handler)
	}

	async connect(): Promise<void> {
		if (this.connection?.state === HubConnectionState.Connected) {
			return
		}

		if (!this.connection) {
			this.connection = new HubConnectionBuilder()
				.withUrl('/hubs/realtime', { withCredentials: true })
				.withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
				.configureLogging(LogLevel.Warning)
				.build()

			this.connection.onreconnecting(() => {
				this.updateState('reconnecting')
			})

			this.connection.onreconnected((connectionId) => {
				this.updateState('connected')
				this.reconnectHandlers.forEach((handler) => handler(connectionId))
			})

			this.connection.onclose(() => {
				this.updateState('disconnected')
			})

			this.pendingHandlers.forEach((handlers, eventName) => {
				handlers.forEach((handler) => {
					this.connection?.on(eventName, handler)
				})
			})
		}

		if (this.connection.state === HubConnectionState.Connecting) {
			return
		}

		try {
			this.updateState('connecting')
			await this.connection.start()
			this.updateState('connected')
		} catch (error) {
			this.updateState('disconnected')
			logger.warn('Realtime socket connection failed', { error })
			throw error
		}
	}

	async disconnect(): Promise<void> {
		if (!this.connection) {
			return
		}

		try {
			await this.connection.stop()
		} finally {
			this.updateState('disconnected')
		}
	}

	private updateState(state: RealtimeConnectionState) {
		this.state = state
		this.stateHandlers.forEach((handler) => handler(state))
	}
}

export const realtimeSocketService = new RealtimeSocketService()

