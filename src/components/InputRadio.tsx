import classNames from 'classnames'
import React from 'react'

type InputRadioProps = {
	value: boolean
	handleToggleSelection?: () => void
}
function InputRadio({ value, handleToggleSelection }: InputRadioProps) {
	const handleClick = () => {
		if (handleToggleSelection) handleToggleSelection()
	}
	return (
		<div className='InputRadio clickable' onClick={handleClick}>
			<div className={classNames({ selected: true, hidden: !value })} />
		</div>
	)
}

export default InputRadio
