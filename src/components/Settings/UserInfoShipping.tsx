import React from 'react'
import User from '@/classes/User'
import InputTextBox from '@/components/InputTextBox'
import { useAccountStore } from '@/src/stores/user'
import Address from '@/classes/Address'

function UserInfoShipping() {
	const { User: UserFromStore } = useAccountStore((state) => state)

	const onUserUpdate = (user: User) => {
		useAccountStore.setState({ User: user })
	}

	const updateShippingDetails = (key: keyof Address, value: string) =>
	{
		
	}
	
	return (
		<section className='ShippingInfo'>
			<h3 className='header'>Shipping Information</h3>
			<InputTextBox
				label='Country'
				type='text'
				handleChange={ (e) => updateShippingDetails('country', e.currentTarget.value) }
				value={ UserFromStore.shippingDetails.country }
			/>
			<InputTextBox
				label='Address'
				type='text'
				handleChange={ (e) => updateShippingDetails('shippingAddress', e.currentTarget.value) }
				value={ UserFromStore.shippingDetails.shippingAddress }
			/>
			<InputTextBox
				label='City'
				type='text'
				handleChange={ (e) => updateShippingDetails('city', e.currentTarget.value) }
				value={ UserFromStore.shippingDetails.city }
			/>
			<InputTextBox
				label='State'
				type='text'
				handleChange={ (e) => updateShippingDetails('state', e.currentTarget.value) }
				value={ UserFromStore.shippingDetails.state }
			/>
			<InputTextBox
				label='Zip Code'
				type='text'
				handleChange={ (e) => updateShippingDetails('zipCode', e.currentTarget.value) }
				value={ UserFromStore.shippingDetails.zipCode }
			/>
		</section>
	)
}

export default UserInfoShipping
