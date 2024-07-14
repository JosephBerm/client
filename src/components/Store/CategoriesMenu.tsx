import React, { useEffect, useState } from 'react'
import API from '@/services/api'
import { toast } from 'react-toastify'
import ProductsCategory from '@/src/classes/ProductsCategory'

function CategoriesMenu() {
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [categories, setCategories] = useState<ProductsCategory[]>([])

	const fetchCategories = async () => {
		try {
			const { data: response } = await API.Store.Products.getAllCategories()

			if (!response.payload || response.statusCode !== 200) {
				return toast.error(response.message)
			}
			setCategories(response.payload)
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}
	useEffect(() => {
		fetchCategories()
	}, [])
	return (
		<div className='CategoriesMenu'>
			<ul className='menu'>
				{categories.map((category) => (
					<li key={category.id}>
						{category.name}
						<br />
					</li>
				))}
			</ul>
		</div>
	)
}

export default CategoriesMenu
