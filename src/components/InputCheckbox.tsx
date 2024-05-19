import React, { FC, ChangeEvent, useMemo } from 'react'

export interface InputCheckboxProps {
	checked: boolean
	onChange: (checked: boolean) => void
	label: string
}

const InputCheckbox: FC<InputCheckboxProps> = ({ checked, onChange, label }) => {
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.checked)
	}

	const checkboxClassName = useMemo(() => {
		return `InputCheckbox${checked ? ' checked' : ''}`
	}, [checked])

	return (
		<div className={checkboxClassName}>
			<input type='checkbox' id={label} checked={checked} onChange={handleChange} />
			<label className='clickable' htmlFor={label}>
				{label}
			</label>
		</div>
	)
}

export default InputCheckbox
