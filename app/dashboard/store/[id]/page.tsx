'use client'
import React from 'react'
import ProductsForm from '@/src/components/Store/ProductsForm'

import Link from 'next/link'

const page = () => {
	return (
		<div className='creation-container'>
			<div className='mb-6'>
				<Link href='/dashboard/store'>Back to store</Link>
			</div>
			<h3>Create a product</h3>
			<ProductsForm />
		</div>
	)
}

export default page
