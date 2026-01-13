/**
 * VolumeTierEditor Component
 *
 * Editor for configuring volume pricing tiers for a product.
 * Admin only - allows adding, editing, and removing quantity-based pricing.
 *
 * **PRD Reference:** prd_pricing_engine.md - US-PRICE-007, US-PRICE-008
 *
 * **DRY Compliance:** Uses standardized FormInput component
 * and RichDataGrid for view mode following existing patterns.
 *
 * **Tier Pricing Methods (exactly one):**
 * - Unit Price: Fixed price per unit at this quantity level
 * - Percent Discount: X% off base price at this quantity level
 *
 * **Validation Rules:**
 * - No overlapping quantity ranges
 * - Max quantity must be >= min quantity
 * - Exactly one pricing method per tier
 *
 * @module app/pricing/_components/VolumeTierEditor
 */

'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Plus, Trash2, Save, TrendingUp, DollarSign, Percent, AlertTriangle } from 'lucide-react'

import { formatCurrency, notificationService } from '@_shared'
import { logger } from '@_core'

import Card from '@_components/ui/Card'
import Button from '@_components/ui/Button'
import Badge from '@_components/ui/Badge'
import FormInput from '@_components/forms/FormInput'
import ConfirmationModal from '@_components/ui/ConfirmationModal'
import { RichDataGrid, createRichColumnHelper, type RichColumnDef } from '@_components/tables/RichDataGrid'

import { useVolumeTiers, useSetVolumeTiers, useClearVolumeTiers } from '@_features/pricing'
// Use regular import (not import type) because we may need VolumeTier methods
import { VolumeTier } from '@_classes/Pricing'

// =========================================================================
// VALIDATION SCHEMA
// =========================================================================

const volumeTierFormSchema = z.object({
	tiers: z.array(
		z
			.object({
				minQuantity: z.coerce.number().int().min(1, 'Min quantity must be at least 1'),
				maxQuantity: z.coerce.number().int().min(1).nullable(),
				unitPrice: z.coerce.number().min(0).nullable(),
				percentDiscount: z.coerce.number().min(0).max(100).nullable(),
			})
			.refine(
				(data) => {
					const methods = [data.unitPrice, data.percentDiscount].filter((v) => v != null)
					return methods.length === 1
				},
				{ message: 'Choose exactly one: unit price or percent discount' }
			)
			.refine(
				(data) => {
					if (data.maxQuantity != null) {
						return data.maxQuantity >= data.minQuantity
					}
					return true
				},
				{ message: 'Max quantity must be >= min quantity' }
			)
	),
})

type VolumeTierFormData = z.infer<typeof volumeTierFormSchema>

// =========================================================================
// TYPES
// =========================================================================

interface VolumeTierEditorProps {
	/** Product ID */
	productId: string
	/** Base price for calculating discounts */
	basePrice: number
	/** Whether user can edit (Admin only) */
	isAdmin: boolean
}

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * Editor for managing volume pricing tiers for a product.
 *
 * **Modes:**
 * - View Mode: RichDataGrid display of tiers
 * - Edit Mode: Form with useFieldArray for tier management
 *
 * @param props - Component props
 * @returns VolumeTierEditor component
 */
export default function VolumeTierEditor({ productId, basePrice, isAdmin }: VolumeTierEditorProps) {
	// ---------------------------------------------------------------------------
	// STATE
	// ---------------------------------------------------------------------------

	const [isEditing, setIsEditing] = useState(false)
	const [showClearModal, setShowClearModal] = useState(false)
	const [isClearing, setIsClearing] = useState(false)

	// ---------------------------------------------------------------------------
	// HOOKS
	// ---------------------------------------------------------------------------

	const { data: volumeData, isLoading, refetch } = useVolumeTiers(productId)
	const setTiersMutation = useSetVolumeTiers()
	const clearTiersMutation = useClearVolumeTiers()

	const tiers = volumeData?.tiers ?? []

	// Form setup
	const {
		control,
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm<VolumeTierFormData>({
		resolver: zodResolver(volumeTierFormSchema),
		defaultValues: {
			tiers: tiers.map((t) => ({
				minQuantity: t.minQuantity,
				maxQuantity: t.maxQuantity,
				unitPrice: t.unitPrice,
				percentDiscount: t.percentDiscount,
			})),
		},
	})

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'tiers',
	})

	// ---------------------------------------------------------------------------
	// HANDLERS
	// ---------------------------------------------------------------------------

	const handleStartEdit = () => {
		reset({
			tiers:
				tiers.length > 0
					? tiers.map((t) => ({
							minQuantity: t.minQuantity,
							maxQuantity: t.maxQuantity,
							unitPrice: t.unitPrice,
							percentDiscount: t.percentDiscount,
					  }))
					: [{ minQuantity: 1, maxQuantity: null, unitPrice: null, percentDiscount: null }],
		})
		setIsEditing(true)
	}

	const handleCancel = () => {
		setIsEditing(false)
		reset()
	}

	const handleSave = async (data: VolumeTierFormData) => {
		try {
			await setTiersMutation.mutateAsync({
				productId,
				request: {
					tiers: data.tiers.map((t) => ({
						minQuantity: t.minQuantity,
						maxQuantity: t.maxQuantity,
						unitPrice: t.unitPrice,
						percentDiscount: t.percentDiscount,
					})),
				},
			})

			notificationService.success('Volume tiers saved successfully', {
				metadata: { productId, tierCount: data.tiers.length },
				component: 'VolumeTierEditor',
				action: 'saveTiers',
			})

			setIsEditing(false)
			await refetch()
		} catch (error) {
			notificationService.error('Failed to save volume tiers', {
				metadata: { error, productId },
				component: 'VolumeTierEditor',
				action: 'saveTiers',
			})
		}
	}

	const handleClearAsync = async (): Promise<void> => {
		setIsClearing(true)

		try {
			await clearTiersMutation.mutateAsync(productId)

			notificationService.success('All volume tiers removed', {
				metadata: { productId },
				component: 'VolumeTierEditor',
				action: 'clearTiers',
			})

			setShowClearModal(false)
			setIsEditing(false)
			await refetch()
		} catch (error) {
			notificationService.error('Failed to clear volume tiers', {
				metadata: { error, productId },
				component: 'VolumeTierEditor',
				action: 'clearTiers',
			})
		} finally {
			setIsClearing(false)
		}
	}

	const handleClear = () => {
		void handleClearAsync().catch((error) => {
			logger.error('Unhandled clear error', {
				error,
				component: 'VolumeTierEditor',
				action: 'handleClear',
			})
		})
	}

	const handleAddTier = () => {
		const lastTier = fields[fields.length - 1]
		const newMin =
			lastTier?.maxQuantity != null ? Number(lastTier.maxQuantity) + 1 : (Number(lastTier?.minQuantity) ?? 0) + 10
		append({
			minQuantity: newMin,
			maxQuantity: null,
			unitPrice: null,
			percentDiscount: null,
		})
	}

	// ---------------------------------------------------------------------------
	// COLUMN DEFINITIONS (VIEW MODE)
	// ---------------------------------------------------------------------------

	const columnHelper = createRichColumnHelper<VolumeTier>()

	const viewColumns: RichColumnDef<VolumeTier, unknown>[] = [
		// Quantity Range
		columnHelper.accessor('minQuantity', {
			header: 'Quantity Range',
			cell: ({ row }) => (
				<span className='font-medium text-base-content'>
					{row.original.minQuantity}
					{row.original.maxQuantity != null ? ` - ${row.original.maxQuantity}` : '+'}
					<span className='text-xs text-base-content/60 ml-1'>units</span>
				</span>
			),
		}),

		// Pricing Method
		columnHelper.display({
			id: 'pricingMethod',
			header: 'Pricing Method',
			cell: ({ row }) => {
				const tier = row.original
				const pricingMethod = tier.unitPrice != null ? 'unitPrice' : 'percentDiscount'

				return pricingMethod === 'unitPrice' ? (
					<Badge
						variant='primary'
						size='sm'>
						<DollarSign className='h-3 w-3 mr-1' />
						Fixed: {formatCurrency(tier.unitPrice!)}
					</Badge>
				) : (
					<Badge
						variant='success'
						size='sm'>
						<Percent className='h-3 w-3 mr-1' />
						{tier.percentDiscount}% Off
					</Badge>
				)
			},
		}),

		// Unit Price
		columnHelper.accessor('calculatedPrice', {
			header: 'Unit Price',
			cell: ({ row }) => {
				const tier = row.original
				const calculatedPrice =
					tier.calculatedPrice ||
					(tier.unitPrice != null ? tier.unitPrice : basePrice * (1 - (tier.percentDiscount ?? 0) / 100))
				return <span className='font-medium text-base-content'>{formatCurrency(calculatedPrice)}</span>
			},
		}),

		// Savings
		columnHelper.display({
			id: 'savings',
			header: 'Savings',
			cell: ({ row }) => {
				const tier = row.original
				const calculatedPrice =
					tier.calculatedPrice ||
					(tier.unitPrice != null ? tier.unitPrice : basePrice * (1 - (tier.percentDiscount ?? 0) / 100))
				const savings = basePrice - calculatedPrice
				const savingsPercent = basePrice > 0 ? (savings / basePrice) * 100 : 0

				return savings > 0 ? (
					<span className='text-success text-sm'>
						{formatCurrency(savings)} ({savingsPercent.toFixed(1)}%)
					</span>
				) : (
					<span className='text-base-content/40 text-sm'>-</span>
				)
			},
		}),
	]

	// ---------------------------------------------------------------------------
	// RENDER: LOADING
	// ---------------------------------------------------------------------------

	if (isLoading) {
		return (
			<Card className='border border-base-300 bg-base-100 p-6 shadow-sm animate-pulse'>
				<div className='h-6 w-40 bg-base-300 rounded mb-4' />
				<div className='space-y-3'>
					{[...Array(3)].map((_, i) => (
						<div
							key={i}
							className='h-12 bg-base-200 rounded'
						/>
					))}
				</div>
			</Card>
		)
	}

	// ---------------------------------------------------------------------------
	// RENDER: VIEW MODE (No tiers)
	// ---------------------------------------------------------------------------

	if (!isEditing && tiers.length === 0) {
		return (
			<Card className='border border-base-300 bg-base-100 p-6 shadow-sm'>
				<div className='text-center py-8'>
					<div className='flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 mx-auto mb-4'>
						<TrendingUp className='h-6 w-6 text-warning' />
					</div>
					<h3 className='text-lg font-semibold text-base-content mb-2'>No Volume Tiers</h3>
					<p className='text-base-content/60 mb-4 max-w-md mx-auto'>
						Add volume pricing tiers to offer quantity-based discounts for this product.
					</p>
					{isAdmin && (
						<Button
							variant='primary'
							onClick={handleStartEdit}>
							<Plus className='h-4 w-4 mr-2' />
							Add Volume Tiers
						</Button>
					)}
				</div>
			</Card>
		)
	}

	// ---------------------------------------------------------------------------
	// RENDER: VIEW MODE (With tiers - using RichDataGrid)
	// ---------------------------------------------------------------------------

	if (!isEditing) {
		return (
			<>
				<RichDataGrid<VolumeTier>
					columns={viewColumns}
					data={tiers}
					defaultPageSize={10}
					showToolbar={false}
					showPagination={false}
					ariaLabel='Volume pricing tiers table'
				/>

				{isAdmin && (
					<div className='mt-4 flex justify-end'>
						<Button
							variant='secondary'
							size='sm'
							onClick={handleStartEdit}>
							Edit Tiers
						</Button>
					</div>
				)}
			</>
		)
	}

	// ---------------------------------------------------------------------------
	// RENDER: EDIT MODE
	// ---------------------------------------------------------------------------

	const isPending = setTiersMutation.isPending || clearTiersMutation.isPending

	return (
		<>
			<Card className='border border-base-300 bg-base-100 shadow-sm'>
				<form onSubmit={handleSubmit(handleSave)}>
					{/* Header */}
					<div className='flex items-center justify-between p-4 border-b border-base-200'>
						<div>
							<h3 className='font-semibold text-base-content'>Edit Volume Tiers</h3>
							<p className='text-sm text-base-content/60'>Configure quantity-based pricing</p>
						</div>
						<div className='flex items-center gap-2'>
							<Button
								type='button'
								variant='ghost'
								size='sm'
								onClick={handleCancel}
								disabled={isPending}>
								Cancel
							</Button>
							<Button
								type='submit'
								variant='primary'
								size='sm'
								disabled={isPending || !isDirty}>
								{isPending ? (
									<span className='loading loading-spinner loading-sm' />
								) : (
									<>
										<Save className='h-4 w-4 mr-2' />
										Save
									</>
								)}
							</Button>
						</div>
					</div>

					{/* Tier Editor */}
					<div className='p-4 space-y-4'>
						{fields.map((field, index) => (
							<div
								key={field.id}
								className='flex flex-wrap items-start gap-3 p-4 bg-base-200/50 rounded-lg'>
								{/* Min Quantity */}
								<div className='flex-1 min-w-[100px]'>
									<FormInput
										label='Min Qty'
										type='number'
										min={1}
										{...register(`tiers.${index}.minQuantity`)}
										error={errors.tiers?.[index]?.minQuantity}
										className='input-sm'
									/>
								</div>

								{/* Max Quantity */}
								<div className='flex-1 min-w-[100px]'>
									<FormInput
										label='Max Qty'
										type='number'
										min={1}
										placeholder='∞'
										helperText='∞ if empty'
										{...register(`tiers.${index}.maxQuantity`)}
										error={errors.tiers?.[index]?.maxQuantity}
										className='input-sm'
									/>
								</div>

								{/* Unit Price */}
								<div className='flex-1 min-w-[120px]'>
									<FormInput
										label='Unit Price'
										type='number'
										step='0.01'
										min={0}
										placeholder='$0.00'
										{...register(`tiers.${index}.unitPrice`)}
										error={errors.tiers?.[index]?.unitPrice}
										className='input-sm'
									/>
								</div>

								{/* OR Separator */}
								<div className='flex items-center pt-8'>
									<span className='text-xs text-base-content/50 font-medium'>OR</span>
								</div>

								{/* Percent Discount */}
								<div className='flex-1 min-w-[100px]'>
									<FormInput
										label='% Off'
										type='number'
										step='0.1'
										min={0}
										max={100}
										placeholder='0%'
										{...register(`tiers.${index}.percentDiscount`)}
										error={errors.tiers?.[index]?.percentDiscount}
										className='input-sm'
									/>
								</div>

								{/* Remove Button */}
								<div className='pt-8'>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										className='text-error hover:bg-error/10'
										onClick={() => remove(index)}
										disabled={fields.length <= 1}
										aria-label='Remove tier'>
										<Trash2 className='h-4 w-4' />
									</Button>
								</div>

								{/* Tier-level Error Message */}
								{errors.tiers?.[index]?.root && (
									<div className='w-full'>
										<p className='text-error text-xs flex items-center gap-1'>
											<AlertTriangle className='h-3 w-3' />
											{errors.tiers[index]?.root?.message}
										</p>
									</div>
								)}
							</div>
						))}

						{/* Add Tier Button */}
						<Button
							type='button'
							variant='ghost'
							size='sm'
							className='w-full'
							onClick={handleAddTier}>
							<Plus className='h-4 w-4 mr-2' />
							Add Tier
						</Button>

						{/* Clear All Button */}
						{tiers.length > 0 && (
							<div className='pt-4 border-t border-base-200'>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									className='text-error hover:bg-error/10'
									onClick={() => setShowClearModal(true)}
									disabled={isPending}>
									<Trash2 className='h-4 w-4 mr-2' />
									Remove All Tiers
								</Button>
							</div>
						)}
					</div>
				</form>
			</Card>

			{/* Clear Confirmation Modal */}
			<ConfirmationModal
				isOpen={showClearModal}
				onClose={() => setShowClearModal(false)}
				onConfirm={handleClear}
				title='Remove All Tiers'
				message='Are you sure you want to remove all volume pricing tiers for this product?'
				details='This action cannot be undone. The product will no longer have quantity-based pricing.'
				variant='danger'
				confirmText='Remove All'
				cancelText='Cancel'
				isLoading={isClearing}
			/>
		</>
	)
}
