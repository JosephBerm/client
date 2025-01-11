'use client'

import React, { useRef, ChangeEvent, ReactNode, KeyboardEvent } from 'react'

type inputMode = 'search' | 'email' | 'tel' | 'text' | 'url' | 'none' | 'numeric' | 'decimal' | undefined

type HTMLChildren = {
	children: ReactNode
}
declare module 'react' {
	interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
	  popovertarget?: string;
	  popovertargetaction?: 'hide' | 'show' | 'toggle';
	  popover?: 'auto' | 'manual';
	}
  }
export interface InputType {
	type: string
	value: string
	label?: string
	placeholder?: string
	icon?: string | HTMLChildren
	disabled?: boolean
	readOnly?: boolean
	autofocused?: boolean
	pattern?: string
	inputmode?: inputMode
	// Error: ?
	// Icon: ?
	// VALIDATION: ?
	maxLength?: number
	handleChange?: (value: ChangeEvent<HTMLInputElement>) => void
	handleBlur?: (value: ChangeEvent<HTMLInputElement>) => void
	handleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
	handleFocus?: () => void
	popovertarget?: string;
	className?: string
}

const InputTextBox: React.FC<InputType> = ({
	type,
	label,
	value,
	placeholder,
	icon,
	disabled,
	readOnly,
	autofocused,
	maxLength,
	inputmode,
	pattern,
	handleChange = () => {},
	handleBlur= () => {},
	handleFocus,
	handleKeyDown,
	popovertarget,
	className: cssClass,
}) => {
	const inputRef = useRef<HTMLInputElement>(null)

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
			<input
				ref={inputRef}
				autoFocus={autofocused}
				placeholder={placeholder}
				type={type}
				value={value}
				disabled={disabled}
				readOnly={readOnly}
				maxLength={maxLength}
				inputMode={inputmode}
				pattern={pattern}
				onChange={(e) => handleChange(e)}
				onBlur={handleBlur}
				onFocus={handleFocus}
				onKeyDown={handleKeyDown}
				popovertarget={popovertarget}
				className={`border-b border-gray-300`}
			/>

			{getIcon()}
		</div>
	)
}

export default InputTextBox
