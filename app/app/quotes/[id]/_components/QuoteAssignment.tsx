/**
 * QuoteAssignment Component
 * 
 * **Story:** Who is responsible for this quote? - Assignment tracking
 * Allows SalesManager+ to assign/reassign quotes to Sales Reps.
 * 
 * **Reuses:**
 * - useFormSubmit (existing hook - DRY form submission)
 * - PermissionGuard (existing component - conditional rendering)
 * - Select, Button, Card (existing UI components)
 * - useQuoteAssignment hook (our custom hook)
 * 
 * **Features:**
 * - Display current assignment (Sales Rep)
 * - Dropdown to select Sales Rep (SalesManager+)
 * - Unassign button (SalesManager+ only)
 * - Shows assignment date (if available)
 * 
 * **Permission Logic:**
 * - SalesManager+: Can assign/unassign Sales Reps
 * - SalesRep and below: Cannot assign (permissions.canAssign = false)
 * 
 * @module app/quotes/[id]/_components/QuoteAssignment
 */

'use client'

import { useEffect, useMemo, useState } from 'react'

import { User, UserX, Clock } from 'lucide-react'

import { formatDate } from '@_lib/dates'

import { transformUsersToSelectOptions, getUserDisplayName, usePermissions } from '@_shared'

import {
	PermissionGuard,
	Resources,
	Actions,
} from '@_components/common/guards'
import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import Select from '@_components/ui/Select'

import { useQuoteAssignment } from './hooks/useQuoteAssignment'

import type { UseQuotePermissionsReturn } from './hooks/useQuotePermissions'
import type { QuoteComponentProps } from './types'

/**
 * QuoteAssignment Component Props
 */
export interface QuoteAssignmentProps extends QuoteComponentProps {
	/** Permission flags for the current user and quote context */
	permissions: UseQuotePermissionsReturn
	/** Callback to refresh quote data after assignment */
	onRefresh?: () => Promise<void>
}

/**
 * QuoteAssignment Component
 * 
 * Displays current assignment and allows SalesManager+ to assign/reassign quotes.
 * Uses PermissionGuard for conditional rendering (DRY).
 * 
 * @param props - Component props
 * @returns QuoteAssignment component
 */
export default function QuoteAssignment({ quote, permissions, onRefresh }: QuoteAssignmentProps) {
	const { user } = usePermissions()
	
	const {
		salesReps,
		salesManagers,
		isLoadingSalesTeam,
		salesTeamError,
		handleAssign,
		handleUnassign,
		isProcessing,
		assignedSalesRep,
	} = useQuoteAssignment(quote, permissions, onRefresh)

	const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>(quote?.assignedSalesRepId ?? '')

	useEffect(() => {
		setSelectedAssigneeId(quote?.assignedSalesRepId ?? '')
	}, [quote?.assignedSalesRepId])

	// Create select options (must be before early returns - React Hook rules)
	const salesRepOptions = useMemo(
		() => transformUsersToSelectOptions(salesReps, false),
		[salesReps]
	)
	const salesManagerOptions = useMemo(
		() => transformUsersToSelectOptions(salesManagers, false),
		[salesManagers]
	)

	// Early return if no quote
	if (!quote) {
		return null
	}

	// Sales Rep: Show read-only assignment info (no controls)
	// Use permissions.context.isAssignedQuote from useQuotePermissions which
	// compares quote.assignedSalesRepId directly with user.id (doesn't require
	// fetching the sales team list)
	if (!permissions.canAssign) {
		// Sales Rep can see their assignment but cannot change it
		return (
			<Card className="border border-base-300 bg-base-100 p-6 shadow-sm animate-elegant-reveal">
				<div className="flex items-center gap-3 mb-6">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<User className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-base-content">Quote Assignment</h3>
						<p className="text-sm text-base-content/60 mt-0.5">Your assignment information</p>
					</div>
				</div>

				{permissions.context.isAssignedQuote && (
					<div className="p-4 rounded-lg bg-linear-to-br from-success/10 to-success/5 border border-success/20">
						<div className="flex items-start gap-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20 shrink-0">
								<User className="h-4 w-4 text-success" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-xs font-semibold uppercase tracking-wide text-base-content/60 mb-0.5">
									Assigned To You
								</p>
								<p className="text-sm font-semibold text-base-content">
									{user?.name?.getFullName?.() ?? user?.email ?? 'You'}
								</p>
								{quote.assignedAt && (
									<div className="flex items-center gap-2 mt-2">
										<Clock className="h-3.5 w-3.5 text-base-content/50" />
										<span className="text-xs text-base-content/60">
											Assigned {formatDate(quote.assignedAt, 'short')}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{!permissions.context.isAssignedQuote && (
					<div className="p-4 rounded-lg bg-base-200/50 border border-base-200">
						<p className="text-sm text-base-content/60">This quote is not assigned to you.</p>
					</div>
				)}
			</Card>
		)
	}

	// Handle assignee selection change (manager or rep)
	const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newAssigneeId = e.target.value

		// Ignore empty/placeholder selection
		if (!newAssigneeId) {
			return
		}

		setSelectedAssigneeId(newAssigneeId)

		if (newAssigneeId !== quote?.assignedSalesRepId) {
			void handleAssign(newAssigneeId)
		}
	}

	// Format assignment date
	const formattedAssignmentDate = quote.assignedAt
		? formatDate(quote.assignedAt, 'short')
		: null

	return (
		<PermissionGuard resource={Resources.Quotes} action={Actions.Assign}>
			<Card className="border border-base-300 bg-base-100 p-6 shadow-sm animate-elegant-reveal">
				{/* Header */}
				<div className="flex items-center gap-3 mb-6">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<User className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-base-content">Sales Rep Assignment</h3>
						<p className="text-sm text-base-content/60 mt-0.5">Assign quote to a sales manager or representative</p>
					</div>
				</div>

				{/* Current Assignment Display */}
				{assignedSalesRep && (
					<div className="mb-6 p-4 rounded-lg bg-linear-to-br from-success/10 to-success/5 border border-success/20">
						<div className="flex items-start justify-between gap-4">
							<div className="flex items-start gap-3 flex-1">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20 shrink-0">
									<User className="h-5 w-5 text-success" />
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
											Currently Assigned To
										</span>
										<Badge variant="success" size="sm">
											Assigned
										</Badge>
									</div>
									<p className="text-base font-semibold text-base-content">
										{getUserDisplayName(assignedSalesRep)}
									</p>
									{formattedAssignmentDate && (
										<div className="flex items-center gap-2 mt-2">
											<Clock className="h-3.5 w-3.5 text-base-content/50" />
											<span className="text-xs text-base-content/60">Assigned {formattedAssignmentDate}</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Assignment Controls */}
				<div className="space-y-4">
					<div className="grid gap-4 lg:grid-cols-2">
						{/* Sales Manager Selection (oversight/escalation) */}
						<div>
							<label htmlFor="sales-manager-select" className="block text-sm font-medium text-base-content/80 mb-2">
								Assign Sales Manager (optional)
							</label>
							<Select
								id="sales-manager-select"
								value={selectedAssigneeId}
								onChange={handleAssigneeChange}
								options={salesManagerOptions}
								placeholder="Select a sales manager..."
								disabled={isProcessing || isLoadingSalesTeam}
								loading={isLoadingSalesTeam}
								error={!!salesTeamError}
								width="full"
								aria-label="Select sales manager to assign quote"
							/>
							{!isLoadingSalesTeam && !salesTeamError && salesManagers.length === 0 && (
								<div className="mt-2 p-3 rounded-lg bg-base-200/50 border border-base-200">
									<p className="text-sm text-base-content/60">No sales managers available</p>
								</div>
							)}
						</div>

						{/* Sales Rep Selection */}
						<div>
							<label htmlFor="sales-rep-select" className="block text-sm font-medium text-base-content/80 mb-2">
								{assignedSalesRep ? 'Reassign Sales Rep to:' : 'Assign Sales Rep to:'}
							</label>
							<Select
								id="sales-rep-select"
								value={selectedAssigneeId}
								onChange={handleAssigneeChange}
								options={salesRepOptions}
								placeholder="Select a sales rep..."
								disabled={isProcessing || isLoadingSalesTeam}
								loading={isLoadingSalesTeam}
								error={!!salesTeamError}
								width="full"
								aria-label="Select sales rep to assign quote"
							/>
							{!isLoadingSalesTeam && !salesTeamError && salesReps.length === 0 && (
								<div className="mt-2 p-3 rounded-lg bg-base-200/50 border border-base-200">
									<p className="text-sm text-base-content/60">No sales reps available</p>
								</div>
							)}
						</div>
					</div>

					{salesTeamError && (
						<div className="p-3 rounded-lg bg-error/10 border border-error/20">
							<p className="text-sm text-error">{salesTeamError}</p>
						</div>
					)}

					{/* Unassign Button */}
					{assignedSalesRep && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => void handleUnassign()}
							disabled={isProcessing}
							loading={isProcessing}
							className="w-full hover:bg-error/10 hover:text-error hover:border-error/20"
						>
							<UserX className="h-4 w-4 mr-2" />
							Unassign Sales Rep
						</Button>
					)}
				</div>
			</Card>
		</PermissionGuard>
	)
}
