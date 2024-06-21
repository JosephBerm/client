import React from 'react'
import InputNumber from '@/components/InputNumber'

interface QuantitySelectorProps {
	quantity: number
	handleDelete: () => void
	handleChange: (quantity: number) => void
}

function QuantitySelector({ quantity, handleDelete, handleChange }: QuantitySelectorProps) {
	return (
		<div className='QuantitySelector'>
			{!quantity && (
				<button className='delete' onClick={() => handleDelete()}>
					<i className='fas fa-trash' />
				</button>
			)}

			{quantity > 0 && (
				<button className='remove' onClick={() => handleChange(quantity - 1)}>
					<i className='fa-solid fa-arrow-down' />
				</button>
			)}
			{/* create component out of this called QuantitySelector */}
			{/* it would have a delete button on it. */}
			{/* left button will start as a trash if 1 is selected */}
			{/* middle would have the quantity in the input */}
			{/* right would have the increase by 1 button */}
			<InputNumber
				value={quantity?.toString()}
				handleChange={(e) => handleChange(parseInt(e.currentTarget.value))}
			/>
			<button className='primary' onClick={() => handleChange(quantity + 1)}>
				<i className='fa-solid fa-arrow-up' />
			</button>
		</div>
	)
}

export default QuantitySelector
