import { Product } from "./Product";
import Quote from "./Quote";

export default class Order {
    id: number | null = null;
    products: OrderItem[] = [];
    total: number = 0;
    dateCreated: Date | null = null;

    CreateFromQuote(quote: Quote) {
        this.products = quote.products.map((cartProduct) => {
            const orderItem = new OrderItem();
            orderItem.productId = cartProduct.productId;
            orderItem.quantity = cartProduct.quantity;
            orderItem.total = cartProduct.product?.price ?? 0 * cartProduct.quantity ?? 0;
            orderItem.product = new Product(cartProduct.product ?? {});
            return orderItem;
        });
        this.total = this.products.reduce((acc, item) => acc + item.total, 0);
    }
}

export class OrderItem {
    id: number | null = null;
    productId: string | null = null;
    product: Product | null = null;
    quantity: number = 0;
    total: number = 0;
}