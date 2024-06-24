import React from 'react';
import ChangePasswordForm from '@/components/Settings/ChangePasswordForm'


function UserInfoPrivacy() {
   return (
      <section className='Security'>
         <h3>Security & Privacy</h3>   
			<ChangePasswordForm />
      </section>
   );
}

export default UserInfoPrivacy;