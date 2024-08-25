import React, { useCallback } from 'react'
import User from '@/classes/User'
import InputTextBox from '@/components/InputTextBox'
import { useAccountStore } from '@/src/stores/user'
import Address from '@/classes/common/Address'

function UserInfoShipping() {
    const { User: UserFromStore, setUser } = useAccountStore((state) => ({
        User: state.User,
        setUser: state.setUser
    }))

    const onUserUpdate = useCallback((user: User) => {
        setUser(user)
    }, [setUser])

    const updateShippingDetails = useCallback((key: keyof Address, value: string) => {
        if (UserFromStore.customer) {
            // Update shipping address in the customer object
            const updatedShippingDetails = new Address({ ...UserFromStore.customer.shippingAddress, [key]: value })

            // Create a new user object with the updated customer and shipping address
            const updatedUser = new User({
                ...UserFromStore,
                customer: {
                    ...UserFromStore.customer,
                    shippingAddress: updatedShippingDetails
                }
            })

            onUserUpdate(updatedUser)
        }
    }, [UserFromStore, onUserUpdate])

    return (
        <section className='ShippingInfo'>
            <h3 className='header'>Shipping Information</h3>
            <div className='FormContainer'>
                <InputTextBox
                    label='Address'
                    type='text'
                    handleChange={(e) => updateShippingDetails('addressOne', e.currentTarget.value)}
                    value={UserFromStore.customer?.shippingAddress?.addressOne ?? ""}
                />
                <div className='gapped-fields'>
                    <InputTextBox
                        label='City'
                        type='text'
                        handleChange={(e) => updateShippingDetails('city', e.currentTarget.value)}
                        value={UserFromStore.customer?.shippingAddress?.city ?? "" }
                    />
                    <InputTextBox
                        label='State'
                        type='text'
                        handleChange={(e) => updateShippingDetails('state', e.currentTarget.value)}
                        value={UserFromStore.customer?.shippingAddress?.state?? ""}
                    />
                </div>
                <div className='gapped-fields'>
                    <InputTextBox
                        label='Country'
                        type='text'
                        handleChange={(e) => updateShippingDetails('country', e.currentTarget.value)}
                        value={UserFromStore.customer?.shippingAddress?.country ?? ""}
                    />
                    <InputTextBox
                        label='Zip Code'
                        type='text'
                        handleChange={(e) => updateShippingDetails('zipCode', e.currentTarget.value)}
                        value={UserFromStore.customer?.shippingAddress?.zipCode ?? ""}
                    />
                </div>
            </div>
        </section>
    )
}

export default UserInfoShipping
