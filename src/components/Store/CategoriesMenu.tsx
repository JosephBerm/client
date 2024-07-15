import React, { useEffect, useState } from 'react'
import API from '@/services/api'
import { toast } from 'react-toastify'
import ProductsCategory, { sanitizeCategoriesList } from '@/classes/ProductsCategory'
import TreeSelect from '../TreeSelect'

function CategoriesMenu() {
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [categories, setCategories] = useState<ProductsCategory[]>([])
	const [selectedCategories, setSelectedCategories] = useState<ProductsCategory[]>([])

	const fetchCategories = async () => {
		try {
			const { data: response } = await API.Store.Products.getAllCategories()

			if (!response.payload || response.statusCode !== 200) {
				return toast.error(response.message)
			}
			const sanitizedCategories: ProductsCategory[] = sanitizeCategoriesList(response.payload)
			setCategories(sanitizedCategories)
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	const handleCategorySelection = (toggledCategory: ProductsCategory) => {
		setSelectedCategories((prevSelectedItems) => {
			const alreadySelected = prevSelectedItems.some((item) => item.id === toggledCategory.id)
			if (alreadySelected) {
				return prevSelectedItems.filter((item) => item.id !== toggledCategory.id)
			}

			//add it to the end of the selected array
			return [...prevSelectedItems, toggledCategory]
		})
	}
	useEffect(() => {
		fetchCategories()
	}, [])

	return (
		<div className='CategoriesMenu'>
			<TreeSelect<ProductsCategory>
				list={categories}
				label='name'
				childKey='subCategories'
				onItemSelected={handleCategorySelection}
			/>
		</div>
	)
}

export default CategoriesMenu
