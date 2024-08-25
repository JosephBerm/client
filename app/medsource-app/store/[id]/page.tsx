'use client'
import React from 'react'
import AddEditForm from '@/components/Store/Products/AddEditForm'

import Link from 'next/link'
import Routes from '@/services/routes'

const page = () => {
	return (
		<div className='store-page'>
			<div className='header mb-6'>
				<Link className='flex items-center' href={`${Routes.InternalAppRoute}/${Routes.Store.location}`}>
					<i className='fa-solid fa-chevron-left mx-4' />
					Back to store
				</Link>
			</div>
			<div className='creation-container'>
				<h2 id='page-header-text'>Create a product</h2>
				<AddEditForm />
			</div>
		</div>
	)
}

export default page
