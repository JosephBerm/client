'use client'

import '@/styles/pages/store.css'
import React from 'react'
import ProductsList from '@/src/components/Store/ProductsList'

const Page = () => {
	return (
		<div className='Store'>
			<h2 className='page-title'>
				<strong>Store</strong>
			</h2>
			<ProductsList />
		</div>
	)
}

export default Page
