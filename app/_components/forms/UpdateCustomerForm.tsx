/**
 * UpdateCustomerForm Component
 *
 * Form for creating and updating customer/company records.
 * Handles company information, contact details, and business address.
 * Uses React Hook Form with Zod validation and DRY submission pattern.
 *
 * **Features:**
 * - Create and update modes (URL-based detection)
 * - Company information fields (name, email, phone, etc.)
 * - Tax ID and website fields
 * - Nested address fields (street, city, state, zip, country)
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
 * - Business Info: Tax ID, website
 * - Address: Street, city, state, zip, country
 *
 * **Use Cases:**
 * - Admin customer management
 * - Adding new customer companies
 * - Updating customer contact information
 * - Managing customer addresses
 *
 * @example
 * ```tsx
 * import UpdateCustomerForm from '@_components/forms/UpdateCustomerForm';
 * import Company from '@_classes/Company';
 *
 * // Create mode (at /app/customers/create)
 * function CreateCustomerPage() {
 *   const newCustomer = new Company(); // Empty customer
 *
 *   return (
 *     <div className="container mx-auto p-6">
 *       <h1 className="text-2xl font-bold mb-6">Create New Customer</h1>
 *       <UpdateCustomerForm
 *         customer={newCustomer}
 *         onUserUpdate={(created) => {
 *           logger.info('Customer created', { customerId: created.id });
 *           router.push('/app/customers');
 *         }}
 *       />
 *     </div>
 *   );
 * }
 *
 * // Update mode (at /app/customers/[id])
 * function EditCustomerPage() {
 *   const [customer, setCustomer] = useState<Company | null>(null);
 *
 *   useEffect(() => {
 *     fetchCustomer(id).then(setCustomer);
 *   }, [id]);
 *
 *   if (!customer) return <div>Loading...</div>;
 *
 *   return (
 *     <div className="container mx-auto p-6">
 *       <h1 className="text-2xl font-bold mb-6">Edit Customer</h1>
 *       <UpdateCustomerForm
 *         customer={customer}
 *         onUserUpdate={(updated) => {
 *           setCustomer(updated);
 *           logger.info('Customer updated', { customerId: updated.id });
 *         }}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * @module UpdateCustomerForm
 */

'use client'

import React, { useCallback, useEffect } from 'react'

import { useParams } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { customerSchema, logger, type CustomerFormData } from '@_core'

import { useFormSubmit , API } from '@_shared'

import Address from '@_classes/common/Address'
import Company from '@_classes/Company'

import Button from '@_components/ui/Button'

import FormInput from './FormInput'



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
 * - Tax ID and website: 2-column grid on desktop
 * - Address section: Separated with border-top
 * - Address fields: Mixed layout (street full width, others 2-column)
 * - Submit button: Right-aligned with dynamic text
 *
 * @param props - Component props including customer and onUserUpdate
 * @returns UpdateCustomerForm component
 */
export default function UpdateCustomerForm({ customer, onUserUpdate }: UpdateCustomerFormProps) {
	const params = useParams()
	const isCreateMode = params?.id === 'create'

	const form = useForm<CustomerFormData>({
		resolver: zodResolver(customerSchema),
		defaultValues: {
			name: customer.name || '',
			email: customer.email || '',
			phone: customer.phone || '',
			taxId: customer.taxId || '',
			website: customer.website || '',
			address: customer.address || undefined,
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
			address: customer.address || undefined,
		})
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [customer.id, customer.name, customer.email])

	const { submit, isSubmitting } = useFormSubmit(
		async (data: CustomerFormData) => {
			const customerData = new Company({
				...customer,
				name: data.name,
				email: data.email,
				phone: data.phone ?? '',
				taxId: data.taxId ?? '',
				website: data.website ?? '',
				address: data.address ? new Address(data.address) : customer.address,
			})
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
			<FormInput
				label="Company Name"
				{...form.register('name')}
				error={form.formState.errors.name}
				disabled={isSubmitting}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormInput
					label="Email"
					type="email"
					{...form.register('email')}
					error={form.formState.errors.email}
					disabled={isSubmitting}
				/>
				<FormInput
					label="Phone"
					type="tel"
					{...form.register('phone')}
					error={form.formState.errors.phone}
					disabled={isSubmitting}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormInput
					label="Tax ID"
					{...form.register('taxId')}
					error={form.formState.errors.taxId}
					disabled={isSubmitting}
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

			<div className="border-t pt-6">
				<h3 className="text-lg font-semibold mb-4">Address</h3>
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

			<div className="flex justify-end">
				<Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
					{isCreateMode ? 'Create Customer' : 'Update Customer'}
				</Button>
			</div>
		</form>
	)
}
