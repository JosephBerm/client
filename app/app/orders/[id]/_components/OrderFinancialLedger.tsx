/**
 * OrderFinancialLedger Component
 *
 * Unified financial ledger combining summary, payment actions, and history.
 * Designed for high-density workflows while preserving compliance details.
 *
 * @module app/orders/[id]/_components/OrderFinancialLedger
 */

'use client'

import { useMemo, useState } from 'react'

import { AlertCircle, Banknote, CheckCircle2, CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'

import { formatCurrency } from '@_shared'
import { parseDateSafe } from '@_lib/dates'

import { OrderStatus } from '@_classes/Enums'
import type Order from '@_classes/Order'

import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import {
	ManualPaymentModal,
	PaymentForm,
	PaymentHistoryTable,
	RefundModal,
	StripeProvider,
	useStripeConfigured,
} from '@_features/payments'
import { useOrderPayments, useOrderPaymentSummary } from '@_features/payments/hooks'
import { formatAmountCents, type PaymentDTO } from '@_features/payments/types'

import type { UseOrderPermissionsReturn } from './hooks/useOrderPermissions'
import { getOrderTotals } from './utils/orderTotals'

export interface OrderFinancialLedgerProps {
	order: Order
	permissions: UseOrderPermissionsReturn
	canPayByCard: boolean
	canRecordPayment: boolean
	canRefund: boolean
	className?: string
}

export function OrderFinancialLedger({
	order,
	permissions,
	canPayByCard,
	canRecordPayment,
	canRefund,
	className = '',
}: OrderFinancialLedgerProps) {
	if (!order.id) {
		return null
	}

	const totals = useMemo(() => getOrderTotals(order), [order])

	const [showCardPayment, setShowCardPayment] = useState(false)
	const [showManualPayment, setShowManualPayment] = useState(false)
	const [refundPayment, setRefundPayment] = useState<PaymentDTO | null>(null)

	const stripeConfigured = useStripeConfigured()

	const {
		data: payments,
		isLoading: paymentsLoading,
		error: paymentsError,
	} = useOrderPayments(order.id)

	const {
		data: summary,
		isLoading: summaryLoading,
		error: summaryError,
	} = useOrderPaymentSummary(order.id)

	const latestPayment = useMemo(() => getLatestPayment(payments ?? []), [payments])

	const remainingBalanceCents = summary?.remainingBalanceCents ?? Math.round(totals.grandTotal * 100)
	const isFullyPaid = summary?.isFullyPaid ?? order.status >= OrderStatus.Paid

	const balanceLabel = isFullyPaid ? 'Paid' : formatAmountCents(remainingBalanceCents, 'USD')

	const handlePaymentSuccess = (payment: PaymentDTO) => {
		toast.success(`Payment of ${formatAmountCents(payment.amountCents, payment.currency)} recorded successfully!`)
		setShowCardPayment(false)
		setShowManualPayment(false)
	}

	const handlePaymentError = (error: string) => {
		toast.error(error)
	}

	const handleRefundSuccess = () => {
		toast.success('Refund processed successfully!')
		setRefundPayment(null)
	}

	if (paymentsError || summaryError) {
		return (
			<div className={`alert alert-error ${className}`}>
				<AlertCircle className="h-4 w-4" />
				<span>Failed to load payment information. Please refresh the page.</span>
			</div>
		)
	}

	return (
		<Card className={`border border-base-200 bg-base-200/40 p-6 shadow-sm ${className}`}>
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h3 className="text-sm font-semibold uppercase text-base-content/60">Financial Ledger</h3>
					<p className="mt-1 text-xs text-base-content/60">
						Unified summary, payments, and history
					</p>
				</div>
				<Badge
					variant={isFullyPaid ? 'success' : 'warning'}
					badgeStyle="soft"
					className="flex items-center gap-2 px-3 py-2"
				>
					{isFullyPaid && <CheckCircle2 className="h-4 w-4" />}
					<span className="font-semibold">
						{isFullyPaid ? 'Balance Paid' : 'Balance Due'}: {balanceLabel}
					</span>
				</Badge>
			</div>

			<div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
				<div className="space-y-4">
					<div className="space-y-2 text-sm">
						<LedgerRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
						<LedgerRow label="Tax" value={formatCurrency(totals.tax)} />
						<LedgerRow label="Shipping" value={formatCurrency(totals.shipping)} />
						{totals.discount > 0 && (
							<LedgerRow
								label="Discount"
								value={`-${formatCurrency(totals.discount)}`}
								valueClassName="text-success"
							/>
						)}
						<div className="flex items-center justify-between border-t border-base-200 pt-2 text-base">
							<span className="font-semibold">Total</span>
							<span className="font-bold text-primary">{formatCurrency(totals.grandTotal)}</span>
						</div>
					</div>

					{permissions.isStaff && (
						<div className="space-y-2 text-sm">
							<h4 className="text-xs font-semibold uppercase text-base-content/60">
								Payment Details
							</h4>
							<LedgerRow label="Method" value={latestPayment?.methodDisplay ?? '—'} />
							<LedgerRow
								label="Reference"
								value={latestPayment?.referenceNumber ?? order.paymentReference ?? '—'}
								mono
							/>
						</div>
					)}
				</div>

				<div className="space-y-4">
					{summaryLoading ? (
						<div className="space-y-3">
							<div className="skeleton h-4 w-32" />
							<div className="skeleton h-8 w-40" />
						</div>
					) : (
						<div className="space-y-2 text-sm">
							<LedgerRow
								label="Paid"
								value={formatAmountCents(summary?.paidAmountCents ?? 0, 'USD')}
								valueClassName="text-success"
							/>
							{(summary?.refundedAmountCents ?? 0) > 0 && (
								<LedgerRow
									label="Refunded"
									value={`-${formatAmountCents(summary?.refundedAmountCents ?? 0, 'USD')}`}
									valueClassName="text-warning"
								/>
							)}
							<LedgerRow
								label="Remaining"
								value={formatAmountCents(remainingBalanceCents, 'USD')}
								valueClassName={isFullyPaid ? 'text-success' : 'text-error'}
							/>
						</div>
					)}

					{!isFullyPaid && (canPayByCard || canRecordPayment) && (
						<div className="flex flex-wrap gap-3">
							{canPayByCard && stripeConfigured && !showCardPayment && (
								<Button
									variant="primary"
									leftIcon={<CreditCard className="h-4 w-4" />}
									onClick={() => setShowCardPayment(true)}
								>
									Pay with Card
								</Button>
							)}

							{canRecordPayment && !showCardPayment && (
								<Button
									variant="outline"
									leftIcon={<Banknote className="h-4 w-4" />}
									onClick={() => setShowManualPayment(true)}
								>
									Record Manual Payment
								</Button>
							)}
						</div>
					)}
				</div>
			</div>

			<div className="mt-6 border-t border-base-200 pt-4">
				<div className="flex items-center justify-between">
					<h4 className="text-sm font-semibold text-base-content">Payment History</h4>
					{paymentsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
				</div>
				<div className="mt-3">
					<PaymentHistoryTable
						payments={payments ?? []}
						isLoading={paymentsLoading}
						onRefund={canRefund ? setRefundPayment : undefined}
					/>
				</div>
			</div>

			{showCardPayment && stripeConfigured && (
				<div className="mt-6 border-t border-base-200 pt-4">
					<StripeProvider>
						<PaymentForm
							orderId={order.id}
							amountCents={remainingBalanceCents}
							currency="USD"
							onSuccess={handlePaymentSuccess}
							onError={handlePaymentError}
							onCancel={() => setShowCardPayment(false)}
						/>
					</StripeProvider>
				</div>
			)}

			{canPayByCard && !stripeConfigured && (
				<div className="alert alert-warning mt-4">
					<AlertCircle className="h-4 w-4" />
					<span className="text-sm">
						Card payments are not available. Stripe is not configured.
					</span>
				</div>
			)}

			<ManualPaymentModal
				isOpen={showManualPayment}
				onClose={() => setShowManualPayment(false)}
				orderId={order.id}
				maxAmountCents={remainingBalanceCents}
				currency="USD"
				onSuccess={handlePaymentSuccess}
			/>

			<RefundModal
				isOpen={!!refundPayment}
				onClose={() => setRefundPayment(null)}
				payment={refundPayment}
				onSuccess={handleRefundSuccess}
			/>
		</Card>
	)
}

function LedgerRow({
	label,
	value,
	valueClassName = '',
	mono = false,
}: {
	label: string
	value: string
	valueClassName?: string
	mono?: boolean
}) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-base-content/70">{label}</span>
			<span className={`font-medium ${mono ? 'font-mono' : ''} ${valueClassName}`}>
				{value}
			</span>
		</div>
	)
}

function getLatestPayment(payments: PaymentDTO[]): PaymentDTO | undefined {
	if (payments.length === 0) {
		return undefined
	}
	return [...payments].sort((a, b) => {
		const dateA = parseDateSafe(a.completedAt ?? a.createdAt)?.getTime() ?? 0
		const dateB = parseDateSafe(b.completedAt ?? b.createdAt)?.getTime() ?? 0
		return dateB - dateA
	})[0]
}

export default OrderFinancialLedger
