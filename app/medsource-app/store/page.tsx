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

const Page = () => {
	const route = useRouter()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [PagedResultData, setPagedResultData] = useState<PagedResult<Product>>(new PagedResult<Product>())

	const columns: TableColumn<Product>[] = [
		{
			name: 'name',
			label: 'Name',
		},
		{
			name: 'description',
			label: 'Description',
		},
		{
			name: 'category',
			label: 'Category',
		},
		{
			name: 'price',
			label: 'Price',
		},
		{
			key: 'delete',
			label: 'Actions',
			content: (product) => (
				<div className="flex gap-5">
					<button>
						<Link href={`store/${product.id}`}>Edit</Link>
					</button>
					<button className='delete' onClick={() => deleteProduct(product.id!)}>
						Archive
					</button>	
				</div>
			),
		},
	]

	const retrieveProducts = async () => {
		try {
			setIsLoading(true)
			//const { data: res } = await API.Store.Products.getList<Product[]>()
			const searchCriteria = new GenericSearchFilter()
			const {data: res } = await API.Store.Products.search(searchCriteria)

			if (!res.payload || res.statusCode !== 200) {
				toast.error(res.message)
				return
			}
			setPagedResultData(res.payload)
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

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

	useEffect(() => {
		retrieveProducts()
	}, [])

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
				{!isLoading && !PagedResultData.data.length ? (
					<h3>No Items found for this search...</h3>
				) : (
					<ServerTable<Product>
						columns={columns}
						methodToQuery = {API.Store.Products.search}
					/>
				)}
			</div>
		</div>
	)
}

export default Page
