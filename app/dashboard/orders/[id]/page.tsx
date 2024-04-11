import Order, { OrderItem } from '@/src/classes/Order'
import { Product } from '@/src/classes/Product'
import OrdersPage from '@/src/components/Orders/OrdersPage'
import API from '@/src/services/api'

const Page = async (context: any) => {
	const getOrder = async () => {
		try {
			const { data } = await API.Orders.get<Order>(parseInt(context.params.id as string))
			if (data.payload) return data.payload
		} catch (err) {
			console.error(err)
		}
	}

	const getProducts = async () => {
		try {
			const { data } = await API.Store.Products.getList<Product[]>()
			if ( data.payload) return data.payload;
		} catch (err) {
			console.error(err)
		}
	}

	const order = await getOrder();
	const products = await getProducts();
	
	return (
		<div className='EditQuoteForm'>
			<OrdersPage products={products!} order = {order!}/>
		</div>
	)
}

export default Page
