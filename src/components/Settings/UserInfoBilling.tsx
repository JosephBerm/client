import React from 'react';
import User from '@/classes/User'
import InputTextBox from '@/components/InputTextBox';
import { useAccountStore } from '@/src/stores/user'

function UserInfoBilling()
{
   	const { User: UserFromStore } = useAccountStore((state) => state)

	const onUserUpdate = (user: User) => {
		useAccountStore.setState({ User: user })
   }
   

   return (
      <section className='BillingInfo'>
         <h3 className='header'>Billing Information</h3>
         <InputTextBox 
            label='Full Name on Card'
            type='text'
            handleChange={ (e) => { } }
				value={ "" }/>

         </section>
   );
}

export default UserInfoBilling;