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

    constructor(init?: Partial<Order>) {
        Object.assign(this, init);
    }

}

export class OrderItem {
    id: number | null = null;
    productId: string | null = null;
    product: Product | null = null;
    quantity: number = 0;
    sellPrice: number = 0;
    buyPrice: number = 0;
    isSold: boolean = false;
    total: number = 0;

    constructor(init?: Partial<OrderItem>) {
        Object.assign(this, init);
    }
}