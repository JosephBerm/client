import React from 'react'
import { IProduct } from '@/src/classes/Product';
import { CartProduct } from '@/src/classes/Product';
import { useCartStore } from '@/src/stores/store';
import InputNumber from '@/components/InputNumber';



const ProductCard = ({product}: {product: IProduct}) => {

    const addProductToCart = useCartStore((state) => state.addProduct)
    const removeProductFromCart = useCartStore((state) => state.removeProduct)

    const [QuantityToAdd, setQuantityToAdd] = React.useState<number>(0)

    const productQuantity = useCartStore((state) => state.Cart.filter((c) => c.product.id === product.id).length)

    const handleAddProductToCart = () => {
        var Quantity = QuantityToAdd > 0 ? QuantityToAdd : 1
        addProductToCart(new CartProduct(product, Quantity))
        setQuantityToAdd(0)
    }

    const handleRemoveProductFromCart = () => {
        removeProductFromCart(new CartProduct(product, QuantityToAdd))
        setQuantityToAdd(0)
    }

    return (
        <div className='product-card-container'>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            {/* <p>{product.price}</p> */}

            <div className='product-card-button-container'>
                <button onClick={() => setQuantityToAdd(prev => prev > 0 ? prev - 1 : prev )} disabled={QuantityToAdd <= 0}>
                    <i className="fa-solid fa-minus"></i>
                </button>
                <InputNumber value={QuantityToAdd.toString()} label={""} handleChange={(e: string) => setQuantityToAdd(parseInt(e))} />
                <button onClick={() => setQuantityToAdd(prev => prev + 1 )}>
                    <i className="fa-solid fa-plus"></i>
                </button>
            </div>

            <button onClick={handleAddProductToCart} style={{marginTop: 25}}>Add to Cart</button>
        </div>
    )
}

export default ProductCard