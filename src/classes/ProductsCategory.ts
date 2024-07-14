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
