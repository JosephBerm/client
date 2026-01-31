/**
 * PriceListForm Component
 *
 * Form for creating and editing price lists.
 * Uses Zod validation and standardized form components.
 *
 * **PRD Reference:** prd_pricing_engine.md - US-PRICE-004
 *
 * **DRY Compliance:** Uses standardized FormInput, FormTextArea, FormCheckbox
 * components following existing patterns in UpdateCustomerForm, ProductForm, etc.
 *
 * **Fields:**
 * - Name (required)
 * - Description (optional)
 * - Priority (1-1000, lower = higher priority)
 * - Active status
 * - Valid From date (optional)
 * - Valid Until date (optional)
 *
 * @module app/pricing/_components/PriceListForm
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Save, X } from 'lucide-react'

import { createPriceListSchema, type CreatePriceListFormData } from '@_core/validation'

import Card from '@_components/ui/Card'
import Button from '@_components/ui/Button'
import FormInput from '@_components/forms/FormInput'
import FormTextArea from '@_components/forms/FormTextArea'
import FormCheckbox from '@_components/forms/FormCheckbox'
import FormSection from '@_components/forms/FormSection'

import { useCreatePriceList, useUpdatePriceList } from '@_features/pricing'
import type { PriceList } from '@_classes/Pricing'

// =========================================================================
// TYPES
// =========================================================================

interface PriceListFormProps {
	/** Existing price list for editing (null for create) */
	priceList?: PriceList | null
	/** Callback on successful save */
	onSuccess?: (priceListId: string) => void
	/** Callback on cancel */
	onCancel?: () => void
}

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * Form for creating or editing a price list.
 *
 * Uses standardized form components for consistent UI/UX:
 * - FormInput: Handles labels, errors, required indicators
 * - FormTextArea: Multi-line input with proper styling
 * - FormCheckbox: Toggle with label and helper text
 *
 * @param props - Component props
 * @returns PriceListForm component
 */
export default function PriceListForm({ priceList, onSuccess, onCancel }: PriceListFormProps) {
	const isEditing = !!priceList

	// Mutations
	const createMutation = useCreatePriceList()
	const updateMutation = useUpdatePriceList()

	// Form setup with Zod validation
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<CreatePriceListFormData>({
		resolver: zodResolver(createPriceListSchema),
		defaultValues: {
			name: priceList?.name ?? '',
			description: priceList?.description ?? '',
			priority: priceList?.priority ?? 100,
			isActive: priceList?.isActive ?? true,
			validFrom: priceList?.validFrom ?? undefined,
			validUntil: priceList?.validUntil ?? undefined,
		},
	})

	// Form submission
	const onSubmit = async (data: CreatePriceListFormData) => {
		try {
			if (isEditing && priceList) {
				const result = await updateMutation.mutateAsync({
					id: priceList.id,
					data: {
						name: data.name,
						description: data.description,
						priority: data.priority,
						isActive: data.isActive,
						validFrom: data.validFrom,
						validUntil: data.validUntil,
					},
				})
				onSuccess?.(result.id)
			} else {
				const result = await createMutation.mutateAsync({
					name: data.name,
					description: data.description,
					priority: data.priority,
					isActive: data.isActive,
					validFrom: data.validFrom,
					validUntil: data.validUntil,
				})
				onSuccess?.(result.id)
			}
		} catch (err) {
			// Error handled by mutation
		}
	}

	const isPending = createMutation.isPending || updateMutation.isPending

	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{/* Basic Information Section */}
				<FormSection
					title="Basic Information"
					description="Set the name and description for this price list"
				>
					{/* Name */}
					<FormInput
						label="Name"
						placeholder="e.g., Hospital System Contract 2026"
						{...register('name')}
						error={errors.name}
						required
					/>

					{/* Description */}
					<FormTextArea
						label="Description"
						placeholder="Optional description for this price list..."
						helperText="Describe the purpose of this price list (e.g., target customers, discount type)"
						rows={3}
						{...register('description')}
						error={errors.description}
					/>
				</FormSection>

				{/* Priority and Status Section */}
				<FormSection
					title="Priority & Status"
					description="Configure how this price list is applied"
				>
					<div className="grid gap-4 md:grid-cols-2">
						{/* Priority */}
						<FormInput
							label="Priority"
							type="number"
							min={1}
							max={1000}
							helperText="Lower number = higher priority. When multiple lists apply, lower wins."
							{...register('priority', { valueAsNumber: true })}
							error={errors.priority}
						/>

						{/* Active Status */}
						<div className="flex flex-col justify-end">
							<FormCheckbox
								label="Active"
								helperText="Only active price lists are applied to pricing calculations"
								{...register('isActive')}
								error={errors.isActive}
							/>
						</div>
					</div>
				</FormSection>

				{/* Validity Period Section */}
				<FormSection
					title="Validity Period"
					description="Optionally limit when this price list is active"
				>
					<div className="grid gap-4 md:grid-cols-2">
						{/* Valid From */}
						<FormInput
							label="Valid From"
							type="date"
							helperText="Leave empty for no start date restriction"
							{...register('validFrom', {
								setValueAs: (v) => (v ? new Date(v) : null),
							})}
							error={errors.validFrom}
						/>

						{/* Valid Until */}
						<FormInput
							label="Valid Until"
							type="date"
							helperText="Leave empty for no end date restriction"
							{...register('validUntil', {
								setValueAs: (v) => (v ? new Date(v) : null),
							})}
							error={errors.validUntil}
						/>
					</div>
				</FormSection>

				{/* Form Actions */}
				<div className="flex items-center justify-end gap-3 pt-4 border-t border-base-200">
					<Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
						<X className="h-4 w-4 mr-2" />
						Cancel
					</Button>
					<Button type="submit" variant="primary" disabled={isPending || isSubmitting}>
						{isPending ? (
							<>
								<span className="loading loading-spinner loading-sm mr-2" />
								{isEditing ? 'Saving...' : 'Creating...'}
							</>
						) : (
							<>
								<Save className="h-4 w-4 mr-2" />
								{isEditing ? 'Save Changes' : 'Create Price List'}
							</>
						)}
					</Button>
				</div>
			</form>
		</Card>
	)
}
