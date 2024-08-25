'use client'

import React, { useState, useEffect } from 'react'
import { SortColumn, TableColumn } from '@/interfaces/Table'
import { useRouter } from 'next/navigation'
import { Product } from '@/classes/Product'
import { toast } from 'react-toastify'
import _ from 'lodash'

import Link from 'next/link'
import API from '@/services/api'
import ServerTable from '@/src/common/ServerTable'
import IsBusyLoading from '@/components/isBusyLoading'
import { GenericSearchFilter } from '@/src/classes/Base/GenericSearchFilter'
import { PagedResult } from '@/src/classes/Base/PagedResult'
import Routes from '@/src/services/routes'
import Pill from '@/src/components/Pill'
import ProductsCategory from '@/src/classes/ProductsCategory'

const searchCriteria = new GenericSearchFilter({
	sortBy: 'CreatedAt',
	sortOrder: 'desc',
	includes: ['Categories'],
})

const Page = () => {
	const route = useRouter()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [PagedResultData, setPagedResultData] = useState<PagedResult<Product>>(new PagedResult<Product>())

	const columns: TableColumn<Product>[] = [
		{
			key: 'product',
			label: 'Product Name',
			content: (product) => (
				<Link className='product-name' href={`${Routes.Product.location}/${product.id}`}>
					{product.name}
				</Link>
			),
		},
		{
			key: 'description',
			label: 'Description',
			content: (product) => <div className='three-line-limit'>{product.description}</div>,
		},
		{
			key: 'category',
			label: 'Category',
			content: (product) => {
				console.log('product', product)

				return (
					<div className='flex gap-2'>
						{product.categories?.map((category: ProductsCategory) => (
							<Pill key={category.id} text={category.name?? ""} variant='info' />
						))}
					</div>
				)
			},
		},
		{
			key: 'delete',
			label: 'Actions',
			content: (product) => (
				<div className='flex gap-5'>
					<button
						onClick={() => route.push(`${Routes.InternalAppRoute}/${Routes.Store.location}/${product.id}`)}>
						Edit
					</button>
					<button className='delete' onClick={() => deleteProduct(product.id!)}>
						Archive
					</button>
				</div>
			),
		},
	]

	// const retrieveProducts = async () => {
	// 	try {
	// 		setIsLoading(true)
	// 		//const { data: res } = await API.Store.Products.getList<Product[]>()
	// 		const searchCriteria = new GenericSearchFilter()
	// 		searchCriteria.includes.push("Categories")
	// 		const { data: res } = await API.Store.Products.search(searchCriteria)

	// 		if (!res.payload || res.statusCode !== 200) {
	// 			toast.error(res.message)
	// 			return
	// 		}
	// 		setPagedResultData(res.payload)
	// 	} catch (err: any) {
	// 		toast.error(err.message)
	// 	} finally {
	// 		setIsLoading(false)
	// 	}
	// }

	const deleteProduct = async (productId: string) => {
		try {
			setIsLoading(true)
			const { data: res } = await API.Store.Products.delete<string>(productId)
			if (res.statusCode !== 200) {
				toast.error(res.message)
				return
			} else {
				toast.success(res.message)
			}
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='page-container store-page'>
			<div className='page-header'>
				<h2 className='page-title'>Products</h2>
				<button className='mt-7' onClick={() => route.push('store/create')}>
					Create Product
				</button>
			</div>
			<div className='products-container'>
				<IsBusyLoading isBusy={isLoading} />
				<ServerTable<Product> columns={columns} methodToQuery={API.Store.Products.search} searchCriteria={searchCriteria} />
				
			</div>
		</div>
	)
}

export default Page
