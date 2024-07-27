import React, { useCallback } from 'react'
import User from '@/classes/User'
import InputTextBox from '@/components/InputTextBox'
import { useAccountStore } from '@/src/stores/user'
import Address from '@/classes/Address'

function UserInfoBilling() {
    const { User: UserFromStore, setUser } = useAccountStore((state) => ({
        User: state.User,
        setUser: state.setUser
    }))

    const onUserUpdate = useCallback((user: User) => {
        setUser(user)
    }, [setUser])

    const updateBillingDetails = useCallback((key: keyof Address, value: string) => {
        if (UserFromStore.customer) {
            // Create a new Address instance with updated billing details
            const updatedBillingAddress = new Address({ ...UserFromStore.customer.billingAddress, [key]: value })
            
            // Update the User object with the new billing address inside customer
            const updatedUser = new User({
                ...UserFromStore,
                customer: {
                    ...UserFromStore.customer,
                    billingAddress: updatedBillingAddress
                }
            })

            onUserUpdate(updatedUser)
        }
    }, [UserFromStore, onUserUpdate])

    return (
        <section className='BillingInfo'>
            <h3 className='header'>Billing Information</h3>
            <div className='FormContainer'>
                <InputTextBox
                    label='Address'
                    type='text'
                    handleChange={(e) => updateBillingDetails('addressOne', e.currentTarget.value)}
                    value={UserFromStore.customer?.billingAddress?.addressOne || ''}
                />
                <div className='gapped-fields'>
                    <InputTextBox
                        label='City'
                        type='text'
                        handleChange={(e) => updateBillingDetails('city', e.currentTarget.value)}
                        value={UserFromStore.customer?.billingAddress?.city || ''}
                    />
                    <InputTextBox
                        label='State'
                        type='text'
                        handleChange={(e) => updateBillingDetails('state', e.currentTarget.value)}
                        value={UserFromStore.customer?.billingAddress?.state || ''}
                    />
                </div>
                <div className='gapped-fields'>
                    <InputTextBox
                        label='Country'
                        type='text'
                        handleChange={(e) => updateBillingDetails('country', e.currentTarget.value)}
                        value={UserFromStore.customer?.billingAddress?.country || ''}
                    />
                    <InputTextBox
                        label='Zip Code'
                        type='text'
                        handleChange={(e) => updateBillingDetails('zipCode', e.currentTarget.value)}
                        value={UserFromStore.customer?.billingAddress?.zipCode || ''}
                    />
                </div>
            </div>
        </section>
    )
}

export default UserInfoBilling
