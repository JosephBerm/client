import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConnectionStatus, type IntegrationConnectionDTO } from '../../types'
import { IntegrationService } from '../IntegrationService'

const mockIntegrationsApi = vi.hoisted(() => ({
	getConnections: vi.fn(),
	getConnection: vi.fn(),
	updateConnectionSettings: vi.fn(),
	disconnect: vi.fn(),
	testConnection: vi.fn(),
	triggerSync: vi.fn(),
	getSyncStatus: vi.fn(),
	getSyncCheckpoints: vi.fn(),
	getEntityMappings: vi.fn(),
	getExternalId: vi.fn(),
	getSyncLogs: vi.fn(),
	getSyncLogDetail: vi.fn(),
	getDashboardSummary: vi.fn(),
	getStats: vi.fn(),
	getSettings: vi.fn(),
	updateSettings: vi.fn(),
	initiateQuickBooksConnection: vi.fn(),
	initiateNetSuiteConnection: vi.fn(),
	connectNetSuiteTBA: vi.fn(),
	getOutboxItems: vi.fn(),
	retryOutboxItem: vi.fn(),
	getInboxItems: vi.fn(),
}))

vi.mock('@_shared', () => ({
	API: {
		Integrations: mockIntegrationsApi,
	},
}))

function createConnection(): IntegrationConnectionDTO {
	return {
		id: '90000000-0000-0000-0000-000000000001',
		provider: 'QuickBooks',
		providerDisplayName: 'QuickBooks',
		status: ConnectionStatus.Connected,
		isActive: true,
		isConnected: true,
		isTokenExpired: false,
		needsReauthorization: false,
		autoSyncEnabled: true,
		syncCustomers: true,
		syncInvoices: true,
		syncPayments: true,
		syncProducts: true,
		createdAt: '2026-01-01T00:00:00Z',
	}
}

describe('IntegrationService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('unwraps wrapped connection payloads', async () => {
		const connection = createConnection()
		mockIntegrationsApi.getConnections.mockResolvedValue({
			status: 200,
			data: { payload: [connection] },
		})

		await expect(IntegrationService.getConnections()).resolves.toEqual([connection])
	})

	it('throws explicit errors instead of silently returning empty data', async () => {
		mockIntegrationsApi.getConnections.mockResolvedValue({
			status: 403,
			data: { message: 'Forbidden: integrations:read is required' },
		})

		await expect(IntegrationService.getConnections()).rejects.toThrow(
			'Forbidden: integrations:read is required (status: 403)'
		)
	})

	it('supports raw response shapes for connection tests', async () => {
		const responsePayload = { success: true, message: 'Connection verified' }
		mockIntegrationsApi.testConnection.mockResolvedValue({
			status: 200,
			data: responsePayload,
		})

		await expect(IntegrationService.testConnection('90000000-0000-0000-0000-000000000001')).resolves.toEqual(
			responsePayload
		)
	})

	it('returns null for mapping-not-found (404), but rethrows other failures', async () => {
		mockIntegrationsApi.getExternalId.mockResolvedValueOnce({
			status: 404,
			data: { message: 'mapping_not_found' },
		})

		await expect(IntegrationService.getExternalId('QuickBooks', 'Order', '123')).resolves.toBeNull()

		mockIntegrationsApi.getExternalId.mockResolvedValueOnce({
			status: 403,
			data: { message: 'Forbidden' },
		})

		await expect(IntegrationService.getExternalId('QuickBooks', 'Order', '123')).rejects.toThrow(
			'Forbidden (status: 403)'
		)
	})
})
