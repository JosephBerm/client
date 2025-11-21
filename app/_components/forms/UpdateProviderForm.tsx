/**
 * UpdateProviderForm Component
 *
 * Form for creating and updating provider/supplier records.
 * Handles provider information, contact details, and business address.
 * Uses React Hook Form with Zod validation and DRY submission pattern.
 *
 * **Features:**
 * - Create and update modes (URL-based detection)
 * - Provider information fields (name, email, phone, etc.)
 * - Tax ID and website fields
 * - Nested address fields (street, city, state, zip, country)
 * - Zod validation with type safety
 * - useFormSubmit hook integration
 * - Responsive grid layout
 * - Loading states during submission
 * - Success callback with updated provider
 * - Toast notifications
 *
 * **Modes:**
 * - **Create Mode**: params.id === 'create', creates new provider
 * - **Update Mode**: params.id is provider ID, updates existing provider
 *
 * **Form Sections:**
 * - Provider Details: Name, email, phone
 * - Business Info: Tax ID, website
 * - Address: Street, city, state, zip, country
 *
 * **Use Cases:**
 * - Admin provider/supplier management
 * - Adding new medical supply providers
 * - Updating provider contact information
 * - Managing provider addresses
 *
 * @example
 * ```tsx
 * import UpdateProviderForm from '@_components/forms/UpdateProviderForm';
 * import Provider from '@_classes/Provider';
 *
 * // Create mode (at /app/providers/create)
 * function CreateProviderPage() {
 *   const newProvider = new Provider(); // Empty provider
 *
 *   return (
 *     <div className="container mx-auto p-6">
 *       <h1 className="text-2xl font-bold mb-6">Create New Provider</h1>
 *       <UpdateProviderForm
 *         provider={newProvider}
 *         onUpdate={(created) => {
 *           logger.info('Provider created', { providerId: created.id });
 *           router.push('/app/providers');
 *         }}
 *       />
 *     </div>
 *   );
 * }
 *
 * // Update mode (at /app/providers/[id])
 * function EditProviderPage() {
 *   const [provider, setProvider] = useState<Provider | null>(null);
 *
 *   useEffect(() => {
 *     fetchProvider(id).then(setProvider);
 *   }, [id]);
 *
 *   if (!provider) return <div>Loading...</div>;
 *
 *   return (
 *     <div className="container mx-auto p-6">
 *       <h1 className="text-2xl font-bold mb-6">Edit Provider</h1>
 *       <UpdateProviderForm
 *         provider={provider}
 *         onUpdate={(updated) => {
 *           setProvider(updated);
 *           logger.info('Provider updated', { providerId: updated.id });
 *         }}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * @module UpdateProviderForm
 */

'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { providerSchema, type ProviderFormData } from '@_core'
import { useFormSubmit } from '@_shared'
import FormInput from './FormInput'
import Button from '@_components/ui/Button'
import Provider from '@_classes/Provider'
import Address from '@_classes/common/Address'
import { API } from '@_shared'
import { useParams } from 'next/navigation'

/**
 * UpdateProviderForm component props interface.
 */
interface UpdateProviderFormProps {
	/**
	 * Provider object to populate form fields.
	 * For create mode, pass an empty Provider instance.
	 * For update mode, pass the existing provider to edit.
	 */
	provider: Provider

	/**
	 * Callback fired after successful provider create/update.
	 * Receives the created or updated provider object.
	 * @param provider - Created or updated provider entity
	 */
	onUpdate?: (provider: Provider) => void
}

/**
 * UpdateProviderForm Component
 *
 * Provider/supplier management form with create/update modes.
 * Handles complex provider entity construction while preserving class methods.
 *
 * **Default Values:**
 * - Pre-fills all fields from provider prop
 * - Handles nested address object (street, city, state, etc.)
 * - Provides empty strings for missing optional fields
 *
 * **Submission Logic:**
 * - Detects mode via URL params (params.id === 'create')
 * - Constructs new Provider entity to preserve class methods
 * - Creates new Address entity from nested form data
 * - Calls API.Providers.create or API.Providers.update based on mode
 * - Invokes onUpdate callback with result
 *
 * **Field Organization:**
 * - Provider name: Full width
 * - Email and phone: 2-column grid on desktop
 * - Tax ID and website: 2-column grid on desktop
 * - Address section: Separated with border-top
 * - Address fields: Mixed layout (street full width, others 2-column)
 * - Submit button: Right-aligned with dynamic text
 *
 * @param props - Component props including provider and onUpdate
 * @returns UpdateProviderForm component
 */
export default function UpdateProviderForm({ provider, onUpdate }: UpdateProviderFormProps) {
	const params = useParams()
	const isCreateMode = params?.id === 'create'

	const form = useForm<ProviderFormData>({
		resolver: zodResolver(providerSchema),
		defaultValues: {
			name: provider.name || '',
			email: provider.email || '',
			phone: provider.phone || '',
			taxId: provider.taxId || '',
			website: provider.website || '',
			address: provider.address || undefined,
		},
	})

	const { submit, isSubmitting } = useFormSubmit(
		async (data: ProviderFormData) => {
			const providerData = new Provider({
				...provider,
				name: data.name,
				email: data.email,
				phone: data.phone || '',
				taxId: data.taxId || '',
				website: data.website || '',
				address: data.address ? new Address(data.address) : provider.address,
			})
			return isCreateMode ? await API.Providers.create(providerData) : await API.Providers.update(providerData)
		},
		{
			successMessage: `Provider ${isCreateMode ? 'created' : 'updated'} successfully`,
			errorMessage: `Failed to ${isCreateMode ? 'create' : 'update'} provider`,
			onSuccess: (result) => {
				if (result) {
					onUpdate?.(new Provider(result))
				}
			},
		}
	)

	const handleSubmit = async (data: ProviderFormData) => {
		await submit(data)
	}

	return (
		<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
			<FormInput
				label="Provider Name"
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
					{isCreateMode ? 'Create Provider' : 'Update Provider'}
				</Button>
			</div>
		</form>
	)
}
