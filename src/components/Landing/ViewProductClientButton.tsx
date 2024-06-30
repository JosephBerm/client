'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

const ViewProductClientButton = () => {
	const route = useRouter()
	return (
		<button className='view-all-products-button' onClick={() => route.push('/products')}>
			View All Products
		</button>
	)
}

export default ViewProductClientButton
