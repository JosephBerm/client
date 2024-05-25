import React, { useRef } from 'react'
import { Field, ErrorMessage, useFormikContext } from 'formik'

type inputMode = 'search' | 'email' | 'tel' | 'text' | 'url' | 'none' | 'numeric' | 'decimal' | undefined

export interface InputType<T> {
    name: keyof T
    display: ((item: T) => string)
    value: ((item: T) => any),
    options: T[]
    type?: string
    label: string
    placeholder?: string
    disabled?: boolean
    readOnly?: boolean
    autofocused?: boolean
    pattern?: string
    inputmode?: inputMode

    // Error: ?
    // Icon: ?
    // VALIDATION: ?
    // why do we need validation here? we can handle that in the validate() function inside the Formik element wrapping this component. Inside the validate method, when whatever condition is false, you would do something like form.error.username = "Invalid username because..."
    maxLength?: number
    cssClass?: string
    rows?: number
}

const FormDropdown: <T>(props: InputType<T>) => JSX.Element = ({
    type = 'text',
    label,
    value,
    name,
    placeholder,
    disabled,
    readOnly,
    display,
    autofocused,
    maxLength,
    inputmode,
    pattern,
    cssClass,
    rows,
    options
}) => {
    const getComponentClass = () => {
        let className = 'InputTextBox'

        if (cssClass) className += ` ${cssClass}`

        return className
    }

    const formikContext = useFormikContext()

    return (
        <div className={`${getComponentClass()} flex flex-col items-center relative`}>
            <label>{label}</label>
            <Field
                as="select"
                name={name}
                autoFocus={autofocused}
                placeholder={placeholder}
                type={type}
                value={((formikContext.values as Record<string, any>)[name as string] ?? "")}
                disabled={disabled}
                readOnly={readOnly}
                maxLength={maxLength}
                inputMode={inputmode}
                pattern={pattern}
                className='border-b border-gray-300'
                rows={type === "textarea" && rows ? rows : 4} // Add this line to set the number of rows for textarea
            >
                <option value={undefined}>Select an option</option> {/* Add this line to display a blank option */}
                {options.map(option => (
                    <option key={value(option)} value={value(option)}>{display(option)}</option>
                ))}
            </Field>

            <div className='error-message-container'>
                <ErrorMessage name={name as string} component='span' className='error-message two-line-limit' />
            </div>
        </div>
    )
}

export default FormDropdown
