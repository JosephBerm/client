/**
 * UpdateCustomerForm Component
 *
 * Form for creating and updating customer/company records.
 * Handles company information, contact details, business classification,
 * status management, and address management.
 * Uses React Hook Form with Zod validation and DRY submission pattern.
 *
 * **Features:**
 * - Create and update modes (URL-based detection)
 * - Company information fields (name, email, phone, etc.)
 * - Business classification (typeOfBusiness enum)
 * - Customer status management (active, suspended, etc.)
 * - Tax ID and website fields
 * - Nested address fields (primary, shipping, billing)
 * - Internal notes (staff only - not visible to customers)
 * - Zod validation with type safety
 * - useFormSubmit hook integration
 * - Responsive grid layout
 * - Loading states during submission
 * - Success callback with updated company
 * - Toast notifications
 *
 * **Modes:**
 * - **Create Mode**: params.id === 'create', creates new customer
 * - **Update Mode**: params.id is customer ID, updates existing customer
 *
 * **Form Sections:**
 * - Company Details: Name, email, phone
 * - Business Classification: Type of business, status
 * - Business Info: Tax ID, website, identifier
 * - Primary Address: Street, city, state, zip, country
 * - Internal Notes: Staff-only notes (sales reps+ only)
 *
 * **RBAC Considerations:**
 * - Customers: Can edit basic contact info only
 * - SalesRep: Can edit most fields, cannot change status/sales rep
 * - SalesManager+: Full access including status and sales rep changes
 *
 * @see prd_customers.md - Customer Management PRD
 * @module UpdateCustomerForm
 */

'use client'

import React, { useCallback, useEffect } from 'react'

import { useParams } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'

import { useAuthStore } from '@_features/auth'
import { 
	CUSTOMER_STATUS_OPTIONS, 
	BUSINESS_TYPE_OPTIONS 
} from '@_features/customers'

import { customerSchema, logger, type CustomerFormData } from '@_core'

import { useFormSubmit, API } from '@_shared'

import Address from '@_classes/common/Address'
import Company from '@_classes/Company'
import { AccountRole, CustomerStatus, TypeOfBusiness } from '@_classes/Enums'

import Button from '@_components/ui/Button'

import FormInput from './FormInput'
import FormSelect from './FormSelect'



/**
 * UpdateCustomerForm component props interface.
 */
interface UpdateCustomerFormProps {
	/**
	 * Customer/company object to populate form fields.
	 * For create mode, pass an empty Company instance.
	 * For update mode, pass the existing customer to edit.
	 */
	customer: Company

	/**
	 * Callback fired after successful customer create/update.
	 * Receives the created or updated company object.
	 * @param customer - Created or updated company entity
	 */
	onUserUpdate?: (customer: Company) => void
	
	/**
	 * Whether to show internal-only fields (notes, status changes).
	 * Default: true for sales reps+, hidden for customers.
	 */
	showInternalFields?: boolean
}

/**
 * UpdateCustomerForm Component
 *
 * Customer/company management form with create/update modes.
 * Handles complex company entity construction while preserving class methods.
 *
 * **Default Values:**
 * - Pre-fills all fields from customer prop
 * - Handles nested address object (street, city, state, etc.)
 * - Provides empty strings for missing optional fields
 * - Business type and status have sensible defaults
 *
 * **Submission Logic:**
 * - Detects mode via URL params (params.id === 'create')
 * - Constructs new Company entity to preserve class methods
 * - Creates new Address entity from nested form data
 * - Calls API.Customers.create or API.Customers.update based on mode
 * - Invokes onUserUpdate callback with result
 *
 * **Field Organization:**
 * - Company name: Full width
 * - Email and phone: 2-column grid on desktop
 * - Business type and status: 2-column grid on desktop (SalesRep+)
 * - Tax ID and website: 2-column grid on desktop
 * - Address section: Separated with border-top
 * - Internal notes: Full width textarea (SalesRep+ only)
 * - Submit button: Right-aligned with dynamic text
 *
 * @param props - Component props including customer and onUserUpdate
 * @returns UpdateCustomerForm component
 */
export default function UpdateCustomerForm({ 
	customer, 
	onUserUpdate,
	showInternalFields: showInternalFieldsProp,
}: UpdateCustomerFormProps) {
	const params = useParams()
	const isCreateMode = params?.id === 'create'
	
	// Get current user for RBAC
	// Use roleLevel directly from plain JSON object (Zustand doesn't deserialize to User class)
	const currentUser = useAuthStore((state) => state.user)
	const userRole = currentUser?.roleLevel ?? AccountRole.Customer
	
	// Determine if internal fields should be shown
	// SalesRep+ can see internal fields, customers cannot
	const isSalesRepOrAbove = userRole >= AccountRole.SalesRep
	const showInternalFields = showInternalFieldsProp ?? isSalesRepOrAbove
	
	// Only SalesManager+ can change status
	const canChangeStatus = userRole >= AccountRole.SalesManager

	const form = useForm<CustomerFormData>({
		resolver: zodResolver(customerSchema),
		defaultValues: {
			name: customer.name || '',
			email: customer.email || '',
			phone: customer.phone || '',
			taxId: customer.taxId || '',
			website: customer.website || '',
			identifier: customer.identifier || '',
			typeOfBusiness: customer.typeOfBusiness ?? TypeOfBusiness.Other,
			status: customer.status ?? CustomerStatus.Active,
			primarySalesRepId: customer.primarySalesRepId ?? null,
			address: customer.address || undefined,
			shippingAddress: customer.shippingAddress || undefined,
			billingAddress: customer.billingAddress || undefined,
			internalNotes: customer.internalNotes ?? '',
		},
	})

	// Reset form when customer data changes (async loading)
	// Use customer.id as the primary dependency to avoid infinite loops
	useEffect(() => {
		// Reset form when customer data loads
		form.reset({
			name: customer.name || '',
			email: customer.email || '',
			phone: customer.phone || '',
			taxId: customer.taxId || '',
			website: customer.website || '',
			identifier: customer.identifier || '',
			typeOfBusiness: customer.typeOfBusiness ?? TypeOfBusiness.Other,
			status: customer.status ?? CustomerStatus.Active,
			primarySalesRepId: customer.primarySalesRepId ?? null,
			address: customer.address || undefined,
			shippingAddress: customer.shippingAddress || undefined,
			billingAddress: customer.billingAddress || undefined,
			internalNotes: customer.internalNotes ?? '',
		})
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [customer.id, customer.name, customer.email])

	/* eslint-disable react-hooks/exhaustive-deps -- useFormSubmit is a custom hook that intentionally captures current closure values */
	const { submit, isSubmitting } = useFormSubmit(
		async (data: CustomerFormData) => {
			const customerData = new Company({
				...customer,
				name: data.name,
				email: data.email,
				phone: data.phone ?? '',
				taxId: data.taxId ?? '',
				website: data.website ?? '',
				identifier: data.identifier ?? '',
				typeOfBusiness: data.typeOfBusiness ?? customer.typeOfBusiness,
				// Only include status if user has permission to change it
				status: canChangeStatus ? (data.status ?? customer.status) : customer.status,
				// Sales rep assignment only changes if user has permission
				primarySalesRepId: canChangeStatus 
					? (data.primarySalesRepId ?? customer.primarySalesRepId)
					: customer.primarySalesRepId,
				address: data.address ? new Address(data.address) : customer.address,
				shippingAddress: data.shippingAddress 
					? new Address(data.shippingAddress) 
					: customer.shippingAddress,
				billingAddress: data.billingAddress 
					? new Address(data.billingAddress) 
					: customer.billingAddress,
			})
			
			// Add internal notes if the user can see them
			if (showInternalFields && data.internalNotes !== undefined) {
				customerData.internalNotes = data.internalNotes
			}
			
			return isCreateMode ? API.Customers.create(customerData) : API.Customers.update(customerData)
		},
		{
			successMessage: `Customer ${isCreateMode ? 'created' : 'updated'} successfully`,
			errorMessage: `Failed to ${isCreateMode ? 'create' : 'update'} customer`,
			onSuccess: (result) => {
				if (result) {
					onUserUpdate?.(new Company(result))
				}
			},
		}
	)
	/* eslint-enable react-hooks/exhaustive-deps */

	/**
	 * Form submission handler for React Hook Form.
	 * Wraps async handler to satisfy ESLint's no-misused-promises rule.
	 * React Hook Form supports async handlers, but we need to handle the Promise explicitly.
	 * 
	 * FAANG Pattern: Extract event handlers from JSX for separation of concerns.
	 */
	const handleSubmit = useCallback((data: CustomerFormData): void => {
		void submit(data).catch((error) => {
			// Error already handled in submit function, but catch any unhandled rejections
			logger.error('Unhandled form submission error', {
				error,
				component: 'UpdateCustomerForm',
				action: 'handleSubmit',
			})
		})
	}, [submit])

	/**
	 * Form onSubmit handler that properly handles React Hook Form's Promise return.
	 * Extracted from JSX for clean code and separation of concerns.
	 * 
	 * FAANG Pattern: Use useCallback for stable event handlers to prevent unnecessary re-renders.
	 */
	const onFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
		const submitHandler = form.handleSubmit(handleSubmit)
		const result = submitHandler(e)
		// React Hook Form's handleSubmit may return a Promise if handler is async
		// Handle it explicitly to satisfy ESLint's no-misused-promises rule
		if (result instanceof Promise) {
			void result.catch((error) => {
				logger.error('Unhandled form submission error', {
					error,
					component: 'UpdateCustomerForm',
					action: 'onFormSubmit',
				})
			})
		}
	}, [form, handleSubmit])

	return (
		<form onSubmit={onFormSubmit} className="space-y-6">
			{/* Company Name */}
			<FormInput
				label="Company Name"
				{...form.register('name')}
				error={form.formState.errors.name}
				disabled={isSubmitting}
				required
			/>

			{/* Contact Information */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormInput
					label="Email"
					type="email"
					{...form.register('email')}
					error={form.formState.errors.email}
					disabled={isSubmitting}
					required
				/>
				<FormInput
					label="Phone"
					type="tel"
					{...form.register('phone')}
					error={form.formState.errors.phone}
					disabled={isSubmitting}
				/>
			</div>

			{/* Business Classification (SalesRep+ only) */}
			{showInternalFields && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Controller
						name="typeOfBusiness"
						control={form.control}
						render={({ field }) => (
							<FormSelect
								label="Business Type"
								options={BUSINESS_TYPE_OPTIONS}
								value={field.value ?? ''}
								onChange={(e) => field.onChange(Number(e.target.value))}
								disabled={isSubmitting}
								placeholder="Select business type"
							/>
						)}
					/>
					<Controller
						name="status"
						control={form.control}
						render={({ field }) => (
							<FormSelect
								label="Status"
								options={CUSTOMER_STATUS_OPTIONS}
								value={field.value ?? ''}
								onChange={(e) => field.onChange(Number(e.target.value))}
								disabled={isSubmitting || !canChangeStatus}
								placeholder="Select status"
								helperText={!canChangeStatus ? 'Contact a manager to change status' : undefined}
							/>
						)}
					/>
				</div>
			)}

			{/* Business Information */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormInput
					label="Tax ID"
					{...form.register('taxId')}
					error={form.formState.errors.taxId}
					disabled={isSubmitting}
					placeholder="EIN or Tax ID"
				/>
				<FormInput
					label="Website"
					type="url"
					{...form.register('website')}
					error={form.formState.errors.website}
					disabled={isSubmitting}
					placeholder="https://example.com"
				/>
			</div>

			{/* Identifier (optional) */}
			{showInternalFields && (
				<FormInput
					label="Customer Identifier"
					{...form.register('identifier')}
					error={form.formState.errors.identifier}
					disabled={isSubmitting}
					placeholder="Internal reference ID (optional)"
					helperText="Custom identifier for internal tracking"
				/>
			)}

			{/* Primary Address */}
			<div className="border-t pt-6">
				<h3 className="text-lg font-semibold mb-4">Primary Address</h3>
				<div className="space-y-4">
					<FormInput
						label="Street"
						{...form.register('address.street')}
						error={form.formState.errors.address?.street}
						disabled={isSubmitting}
					/>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							label="City"
							{...form.register('address.city')}
							error={form.formState.errors.address?.city}
							disabled={isSubmitting}
						/>
						<FormInput
							label="State/Province"
							{...form.register('address.state')}
							error={form.formState.errors.address?.state}
							disabled={isSubmitting}
						/>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							label="ZIP/Postal Code"
							{...form.register('address.zipCode')}
							error={form.formState.errors.address?.zipCode}
							disabled={isSubmitting}
						/>
						<FormInput
							label="Country"
							{...form.register('address.country')}
							error={form.formState.errors.address?.country}
							disabled={isSubmitting}
						/>
					</div>
				</div>
			</div>

			{/* Internal Notes (SalesRep+ only) */}
			{showInternalFields && (
				<div className="border-t pt-6">
					<h3 className="text-lg font-semibold mb-2">Internal Notes</h3>
					<p className="text-sm text-base-content/60 mb-4">
						Notes visible only to staff members, not customers.
					</p>
					<textarea
						{...form.register('internalNotes')}
						className="textarea textarea-bordered w-full h-32"
						placeholder="Add internal notes about this customer..."
						disabled={isSubmitting}
					/>
					{form.formState.errors.internalNotes && (
						<p className="text-error text-sm mt-1">
							{form.formState.errors.internalNotes.message}
						</p>
					)}
				</div>
			)}

			{/* Submit Button */}
			<div className="flex justify-end">
				<Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
					{isCreateMode ? 'Create Customer' : 'Update Customer'}
				</Button>
			</div>
		</form>
	)
}
