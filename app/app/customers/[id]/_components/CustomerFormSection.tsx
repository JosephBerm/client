/**
 * CustomerFormSection Component
 * 
 * Wraps the customer form in a card with appropriate heading.
 * Handles both create and edit modes.
 * 
 * **Modes:**
 * - Create: "Customer Information" heading
 * - Edit: "Edit Customer" heading
 * 
 * @see prd_customers.md - Customer Form
 * @module customers/components
 */

'use client'

import Company from '@_classes/Company'

import UpdateCustomerForm from '@_components/forms/UpdateCustomerForm'

/** Component props */
interface CustomerFormSectionProps {
	/** Customer entity */
	customer: Company
	/** Whether in create mode */
	isCreateMode: boolean
	/** Callback when customer is updated */
	onCustomerUpdate: (customer: Company) => void
}

/**
 * CustomerFormSection - Form wrapper with card styling.
 * Delegates form logic to UpdateCustomerForm.
 */
export function CustomerFormSection({
	customer,
	isCreateMode,
	onCustomerUpdate,
}: CustomerFormSectionProps) {
	return (
		<section className="card bg-base-100 border border-base-300 shadow-sm">
			<div className="card-body p-4 sm:p-6">
				<h3 className="text-lg font-semibold mb-4">
					{isCreateMode ? 'Customer Information' : 'Edit Customer'}
				</h3>
				<UpdateCustomerForm
					customer={customer}
					onUserUpdate={onCustomerUpdate}
				/>
			</div>
		</section>
	)
}

export default CustomerFormSection

