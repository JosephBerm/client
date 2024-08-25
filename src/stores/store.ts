import { create } from 'zustand'
import { Product, IProduct, CartProduct } from '@/classes/Product'

type State = {
	Cart: CartProduct[]
}


type Actions = {
    addProduct: (product: CartProduct) => void,
    removeProduct: (product: CartProduct) => void,
    setCart: (cart: CartProduct[]) => void,
    isInCart: (id: string) => boolean
}

const useCartStore = create<State & Actions>((set, get) => ({
    Cart: [],
    addProduct: (product: CartProduct) => {
        const existingProduct = get().Cart.find((p) => p.product?.id === product.product?.id);
        if (existingProduct) {
            set((state) => ({
                Cart: state.Cart.map((p) =>
                    p.product?.id === product.product?.id ? { ...p, quantity: p.quantity + product.quantity } : p
                ),
            }));
        } else {
            set((state) => ({ Cart: [...state.Cart, product] }));
        }
        localStorage.setItem('cart', JSON.stringify(get().Cart));
    },
    removeProduct: (cartItem: CartProduct) => {
        set((state) => ({
            Cart: state.Cart.filter((c) => c.product?.id !== cartItem.product?.id),
        }));
        localStorage.setItem('cart', JSON.stringify(get().Cart));
    },
    setCart: (cart: CartProduct[]) => {
        set((state) => ({ Cart: cart }));
        localStorage.setItem('cart', JSON.stringify(get().Cart));
    },
    isInCart: (id: string) => {
        return get().Cart.some((c) => c.product?.id === id);
    }
}));

export { useCartStore }
