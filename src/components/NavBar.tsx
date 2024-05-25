'use client'

import React, { useState, useEffect } from 'react'

import SecuredNavBar from '@/components/Navigation/SecuredNavBar'
import PublicNavBar from '@/components/Navigation/PublicNavBar'
import CustomerNavBar from '@/components/Navigation/CustomerNavBar'
import { AccountRole, UserType } from '@/classes/Enums'
import { useAccountStore } from '@/src/stores/user'

function NavBar() {
	const User = useAccountStore((state) => state.User)

	// Set the navbar based on the role. 
	// We might want to render different navbars based on the user's location, or other factors.
	switch(User.role)	{
		case AccountRole.Admin: 	return <SecuredNavBar />; 
		case AccountRole.Customer:	return <SecuredNavBar />;
		default: 					return <PublicNavBar />;
	}

}

export default NavBar
