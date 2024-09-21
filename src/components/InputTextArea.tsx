'use client'

import React, { useRef, ChangeEvent, ReactNode } from 'react'

type inputMode = 'search' | 'email' | 'tel' | 'text' | 'url' | 'none' | 'numeric' | 'decimal' | undefined

type HTMLChildren = {
	children: ReactNode
}
export interface InputType {
	value: string
	label?: string
	placeholder?: string
	icon?: string | HTMLChildren
	disabled?: boolean
	readOnly?: boolean
	autofocused?: boolean
	inputmode?: inputMode
	maxLength?: number
	cols?: number
	rows?: number
	handleChange?: (value: ChangeEvent<HTMLTextAreaElement>) => void
	handleBlur?: (value: ChangeEvent<HTMLTextAreaElement>) => void
	handleFocus?: () => void
	className?: string
}

const InputTextArea: React.FC<InputType> = ({
	label,
	value,
	placeholder,
	icon,
	disabled,
	readOnly,
	autofocused,
	maxLength,
	inputmode,
	cols = 1,
	rows = 1,
	handleChange = () => {},
	handleBlur,
	handleFocus,
	className: cssClass,
}) => {
	const inputRef = useRef<HTMLTextAreaElement>(null)

	const focusInput = () => {
		if (inputRef.current) {
			inputRef.current.focus()
		}
	}

	const getIcon = () => {
		if (!icon) return <></>
		else if (typeof icon === 'string') {
			return (
				<div className='icon-container'>
					<i className={icon}></i>
				</div>
			)
		}

		return icon.children
	}

	const getComponentClass = () => {
		let className = 'InputTextBox flex flex-col'

		if (cssClass) className += ` ${cssClass}`
		if (disabled) className += ` disabled`

		return className
	}

	return (
		<div className={getComponentClass()}>
			{label ? (
				<label onClick={focusInput} className='m-2'>
					{label}
				</label>
			) : (
				<></>
			)}
			<textarea
				ref={inputRef}
				autoFocus={autofocused}
				placeholder={placeholder}
				value={value}
				disabled={disabled}
				readOnly={readOnly}
				maxLength={maxLength}
				inputMode={inputmode}
				cols={cols}
				rows={rows}
				onChange={(e) => handleChange(e)}
				onBlur={handleBlur}
				onFocus={handleFocus}
				className={`border-b border-gray-300`}
			/>

			{getIcon()}
		</div>
	)
}

export default InputTextArea
