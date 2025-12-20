/**
 * QuoteActions Component
 * 
 * **Story:** What can I do with this quote? - Permission-based action buttons
 * Context-aware action buttons based on quote status and user permissions.
 * 
 * **Reuses:**
 * - useFormSubmit (existing hook - DRY form submission)
 * - PermissionGuard (existing component - conditional rendering)
 * - Button, Card (existing UI components)
 * - useQuoteActions hook (our custom hook)
 * 
 * **Status-Based Actions:**
 * - Unread → "Mark as Read" (SalesRep+)
 * - Read → "Approve" or "Reject" (SalesRep+)
 * - Approved → "Send to Customer" or "Convert to Order" (SalesRep+)
 * - Converted → "View Order" (all roles)
 * 
 * @module app/quotes/[id]/_components/QuoteActions
 */

'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { AlertTriangle, CheckCircle, XCircle, Send, ShoppingCart, Eye } from 'lucide-react'

import { Routes } from '@_features/navigation'

import type Quote from '@_classes/Quote'
import { QuoteStatus } from '@_classes/Enums'

import { PermissionGuard, Resources, Actions } from '@_components/common/guards'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import Modal from '@_components/ui/Modal'

import { useQuoteActions } from './hooks/useQuoteActions'
import { useQuotePricing } from './hooks/useQuotePricing'
import type { UseQuotePermissionsReturn } from './hooks/useQuotePermissions'
import type { QuoteComponentProps } from './types'

/**
 * QuoteActions Component Props
 */
export interface QuoteActionsProps extends QuoteComponentProps {
	/** Permission flags for the current user and quote context */
	permissions: UseQuotePermissionsReturn
	/** Callback to refresh quote data after actions */
	onRefresh?: () => Promise<void>
}

/**
 * QuoteActions Component
 * 
 * Displays context-aware action buttons based on quote status and user permissions.
 * Uses PermissionGuard for conditional rendering (DRY).
 * 
 * @param props - Component props
 * @returns QuoteActions component
 */
export default function QuoteActions({ quote, permissions, onRefresh }: QuoteActionsProps) {
	const router = useRouter()
	const { handleMarkAsRead, handleApprove, handleReject, handleSendToCustomer, handleConvertToOrder, isProcessing } =
		useQuoteActions(quote, permissions, onRefresh)
	
	// Quote pricing validation - checks if all products have customer price
	// @see prd_quotes_pricing.md - US-QP-004
	const { canSendToCustomer } = useQuotePricing(quote, onRefresh)
	const hasPricing = canSendToCustomer(quote)

	// Confirmation dialog state
	const [showRejectConfirm, setShowRejectConfirm] = useState(false)
	const [showConvertConfirm, setShowConvertConfirm] = useState(false)

	// Early return if no quote
	if (!quote) return null

	// Customer sees no actions (read-only)
	if (!permissions.canUpdate) {
		return (
			<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
				<Button variant="ghost" onClick={() => router.push(Routes.Quotes.location)}>
					Back to Quotes
				</Button>
			</Card>
		)
	}

	// Wrapper handlers with confirmation dialogs
	const handleRejectWithConfirm = () => {
		setShowRejectConfirm(true)
	}

	const handleRejectConfirmed = async () => {
		setShowRejectConfirm(false)
		await handleReject()
	}

	const handleConvertWithConfirm = () => {
		setShowConvertConfirm(true)
	}

	const handleConvertConfirmed = async () => {
		setShowConvertConfirm(false)
		await handleConvertToOrder()
	}

	return (
		<>
			<Card className="border border-base-300 bg-base-100 p-6 shadow-sm animate-elegant-reveal">
				{/* Header */}
				<div className="flex items-center gap-3 mb-6">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<CheckCircle className="h-5 w-5 text-primary" />
					</div>
					<h3 className="text-lg font-semibold text-base-content">Actions</h3>
				</div>

				{/* Primary Actions (Status-Based) */}
				<div className="space-y-3 mb-6">
					{/* Unread → Mark as Read */}
					{quote.status === QuoteStatus.Unread && permissions.canMarkAsRead && (
						<PermissionGuard resource={Resources.Quotes} action={Actions.Update}>
							<Button
								variant="primary"
								onClick={handleMarkAsRead}
								disabled={isProcessing}
								loading={isProcessing}
								className="w-full"
							>
								<CheckCircle className="h-4 w-4 mr-2" />
								Mark as Read (Take Ownership)
							</Button>
						</PermissionGuard>
					)}

					{/* Read → Approve or Reject */}
					{quote.status === QuoteStatus.Read && (
						<>
							{permissions.canApprove && (
								<PermissionGuard resource={Resources.Quotes} action={Actions.Approve}>
									<div className="tooltip w-full" data-tip={!hasPricing ? 'Set customer prices for all products first' : ''}>
										<Button
											variant="primary"
											onClick={handleApprove}
											disabled={isProcessing || !hasPricing}
											loading={isProcessing}
											className="w-full"
										>
											<CheckCircle className="h-4 w-4 mr-2" />
											Approve Quote
										</Button>
									</div>
									{!hasPricing && (
										<p className="text-xs text-warning mt-1 flex items-center gap-1">
											<AlertTriangle className="h-3 w-3" />
											Complete pricing for all products to approve
										</p>
									)}
								</PermissionGuard>
							)}
							{permissions.canReject && (
								<Button
									variant="error"
									onClick={handleRejectWithConfirm}
									disabled={isProcessing}
									className="w-full"
								>
									<XCircle className="h-4 w-4 mr-2" />
									Reject Quote
								</Button>
							)}
						</>
					)}

					{/* Approved → Send to Customer or Convert to Order */}
					{quote.status === QuoteStatus.Approved && (
						<>
							{permissions.canUpdate && (
								<Button
									variant="primary"
									onClick={handleSendToCustomer}
									disabled={isProcessing}
									loading={isProcessing}
									className="w-full"
								>
									<Send className="h-4 w-4 mr-2" />
									Send Quote to Customer
								</Button>
							)}
							{permissions.canConvert && (
								<PermissionGuard resource={Resources.Orders} action={Actions.Create}>
									<Button
										variant="primary"
										onClick={handleConvertWithConfirm}
										disabled={isProcessing}
										loading={isProcessing}
										className="w-full"
									>
										<ShoppingCart className="h-4 w-4 mr-2" />
										Convert to Order
									</Button>
								</PermissionGuard>
							)}
						</>
					)}

					{/* Converted → View Order */}
					{quote.status === QuoteStatus.Converted && (
						<Button
							variant="primary"
							onClick={() => {
								// Navigate to order if we have the order ID
								// For now, just show message (order ID not in quote entity yet)
								router.push(Routes.Orders.location)
							}}
							className="w-full"
						>
							<Eye className="h-4 w-4 mr-2" />
							View Orders
						</Button>
					)}
				</div>

				{/* Navigation */}
				<div className="border-t border-base-200 pt-4 mt-6">
					<Button 
						variant="ghost" 
						onClick={() => router.push(Routes.Quotes.location)} 
						className="w-full hover:bg-base-200"
					>
						Back to Quotes
					</Button>
				</div>
			</Card>

			{/* Reject Confirmation Dialog */}
			<Modal
				isOpen={showRejectConfirm}
				onClose={() => setShowRejectConfirm(false)}
				title="Reject Quote"
				size="md"
			>
				<div className="space-y-4">
					<div className="flex items-start gap-3">
						<AlertTriangle className="h-5 w-5 text-error mt-0.5 shrink-0" />
						<div>
							<p className="text-base-content font-medium mb-1">Are you sure you want to reject this quote?</p>
							<p className="text-sm text-base-content/70">
								This action cannot be undone. The quote will be marked as rejected and the customer will be notified.
							</p>
						</div>
					</div>
					<div className="flex gap-3 justify-end">
						<Button variant="ghost" onClick={() => setShowRejectConfirm(false)}>
							Cancel
						</Button>
						<Button variant="error" onClick={handleRejectConfirmed} disabled={isProcessing} loading={isProcessing}>
							Reject Quote
						</Button>
					</div>
				</div>
			</Modal>

			{/* Convert to Order Confirmation Dialog */}
			<Modal
				isOpen={showConvertConfirm}
				onClose={() => setShowConvertConfirm(false)}
				title="Convert to Order"
				size="md"
			>
				<div className="space-y-4">
					<div className="flex items-start gap-3">
						<ShoppingCart className="h-5 w-5 text-primary mt-0.5 shrink-0" />
						<div>
							<p className="text-base-content font-medium mb-1">Convert this quote to an order?</p>
							<p className="text-sm text-base-content/70">
								This will create a new order from this quote. You will be redirected to the order detail page once the
								order is created.
							</p>
						</div>
					</div>
					<div className="flex gap-3 justify-end">
						<Button variant="ghost" onClick={() => setShowConvertConfirm(false)}>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={handleConvertConfirmed}
							disabled={isProcessing}
							loading={isProcessing}
						>
							Convert to Order
						</Button>
					</div>
				</div>
			</Modal>
		</>
	)
}

