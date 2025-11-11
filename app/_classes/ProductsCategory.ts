// RichConstructor decorator not needed in modern Next.js

export default class ProductsCategory {
	id: number = -99
	name?: string
	parentCategoryId?: number
	parentCategory?: ProductsCategory | null
	subCategories: ProductsCategory[] = []

	constructor(partial?: Partial<ProductsCategory>) {
		if (partial) Object.assign(this, partial)
	}
}
export function sanitizeCategoriesList(categories: ProductsCategory[]): ProductsCategory[] {
	const categoriesMap = new Map<number, ProductsCategory>()

	// First, map all categories by their id
	categories.forEach((category) => {
		categoriesMap.set(category.id, category)
	})

	// Then, update the subCategories and parentCategory references
	categories.forEach((category) => {
		if (category.parentCategoryId !== null && category.parentCategoryId !== undefined) {
			const parentCategory = categoriesMap.get(category.parentCategoryId)
			if (parentCategory) {
				parentCategory.subCategories.push(category)
				category.parentCategory = parentCategory
			}
		}
	})

	// Finally, filter out subcategories from the main list
	const sanitizedCategories: ProductsCategory[] = []
	categories.forEach((category) => {
		if (category.parentCategoryId === null || category.parentCategoryId === undefined) {
			sanitizedCategories.push(category)
		}
	})

	return sanitizedCategories
}
