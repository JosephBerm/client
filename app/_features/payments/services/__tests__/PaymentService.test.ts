import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PaymentService } from '../PaymentService'

import type { PaymentSummary } from '../../types'

const mockPaymentsApi = vi.hoisted(() => ({
	createPaymentIntent: vi.fn(),
	confirmPaymentIntent: vi.fn(),
	recordManualPayment: vi.fn(),
	get: vi.fn(),
	getByOrderId: vi.fn(),
	getOrderSummary: vi.fn(),
	getByCustomerId: vi.fn(),
	search: vi.fn(),
	refund: vi.fn(),
	PaymentMethods: {
		getAll: vi.fn(),
		setDefault: vi.fn(),
		delete: vi.fn(),
	},
	CustomerSettings: {
		get: vi.fn(),
		update: vi.fn(),
	},
}))

vi.mock('@_shared', () => ({
	API: {
		Payments: mockPaymentsApi,
	},
}))

function createSummary(orderId: string): PaymentSummary {
	return {
		orderId,
		totalAmountCents: 89990,
		paidAmountCents: 0,
		refundedAmountCents: 0,
		remainingBalanceCents: 89990,
		totalAmount: 899.9,
		paidAmount: 0,
		refundedAmount: 0,
		remainingBalance: 899.9,
		isFullyPaid: false,
		paymentCount: 0,
	}
}

describe('PaymentService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('returns payment summary when backend responds with raw JSON payload', async () => {
		const orderId = '40000000-0000-0000-0000-000000000004'
		const summary = createSummary(orderId)

		mockPaymentsApi.getOrderSummary.mockResolvedValue({
			status: 200,
			data: summary,
		})

		await expect(PaymentService.getOrderPaymentSummary(orderId)).resolves.toEqual(summary)
	})

	it('returns payment summary when backend responds with payload envelope', async () => {
		const orderId = '40000000-0000-0000-0000-000000000004'
		const summary = createSummary(orderId)

		mockPaymentsApi.getOrderSummary.mockResolvedValue({
			status: 200,
			data: {
				statusCode: 200,
				message: 'ok',
				payload: summary,
			},
		})

		await expect(PaymentService.getOrderPaymentSummary(orderId)).resolves.toEqual(summary)
	})

	it('throws actionable error on non-2xx responses instead of returning undefined', async () => {
		mockPaymentsApi.getOrderSummary.mockResolvedValue({
			status: 403,
			data: {
				message: 'Forbidden: missing payments:read permission',
			},
		})

		await expect(
			PaymentService.getOrderPaymentSummary('40000000-0000-0000-0000-000000000004')
		).rejects.toThrow('Forbidden: missing payments:read permission (status: 403)')
	})

	it('throws when a successful response has an empty body', async () => {
		mockPaymentsApi.getOrderSummary.mockResolvedValue({
			status: 200,
			data: undefined,
		})

		await expect(
			PaymentService.getOrderPaymentSummary('40000000-0000-0000-0000-000000000004')
		).rejects.toThrow('Failed to load order payment summary: empty response')
	})

	it('returns an empty array for list endpoints when payload is null', async () => {
		mockPaymentsApi.getByOrderId.mockResolvedValue({
			status: 200,
			data: {
				payload: null,
			},
		})

		await expect(
			PaymentService.getByOrderId('40000000-0000-0000-0000-000000000004')
		).resolves.toEqual([])
	})

	it('throws for mutation endpoints when server responds with error status', async () => {
		mockPaymentsApi.PaymentMethods.setDefault.mockResolvedValue({
			status: 500,
			data: {
				detail: 'Database unavailable',
			},
		})

		await expect(
			PaymentService.setDefaultPaymentMethod(123, '20000000-0000-0000-0000-000000000123')
		).rejects.toThrow('Database unavailable (status: 500)')
	})
})
