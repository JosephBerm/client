import React from 'react'
import ChangePasswordForm from '@/src/components/Settings/ChangePasswordForm';
import UpdateProfileForm from '@/src/components/Settings/UpdateProfileForm';

const Page = () => {
  return (
    <div className='justify-center flex-column'>

        <UpdateProfileForm/>
        <ChangePasswordForm/>

    </div>
  )
}

export default Page