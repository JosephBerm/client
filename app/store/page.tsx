'use client'

import '@/styles/pages/store.css'
import React from 'react'
import ProductsList from '@/components/Store/ProductsList'
import CategoriesMenu from '@/components/Store/CategoriesMenu'

const Page = () => {
	return (
		<div className='Store'>
			<h2 className='page-title'>
				<strong>Store</strong>
			</h2>
			<CategoriesMenu />
			<ProductsList />
		</div>
	)
}

export default Page
