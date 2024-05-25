import React, { useRef, useEffect, useState, ChangeEvent } from 'react'
import FormDropdown from '@/components/FormDropdown'
import API from '@/services/api'
import { HttpService } from '@/services/httpService'
import { GenericSearchFilter } from '@/classes/Base/GenericSearchFilter'
import { PagedResult } from '../classes/Base/PagedResult'

type InputFetchDropdownProps<T> = {
    name: keyof T
    display: ((item: T) => string)
    value: ((item: T) => any),
    endpoint: string
    label?: string
    placeholder?: string,
    searchBy: keyof T
}

function FormFetchDropdown<T = any>(p: InputFetchDropdownProps<T>) {
    const [options, setOptions] = useState<T[]>([])
    const [searchValue, setSearchValue] = useState("") // Change the type to string
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [timeoutTime, setTimeoutTime] = useState(0)

    useEffect(() => {
        setTimeoutTime(500)
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        typingTimeoutRef.current = setTimeout( async() => {
            const searchResults = new GenericSearchFilter()
            searchResults.add(p.searchBy.toString(), searchValue)

            const response = await HttpService.post<PagedResult<T>>(p.endpoint, searchResults)

            if(!response.data.payload?.data) return 
            const listOfCustomers = response.data.payload?.data;

            setOptions(listOfCustomers) 
        }, timeoutTime)

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
        }
    }, [p.endpoint, searchValue])

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => { // Change the event type
        setSearchValue(event.target.value) // Change the event type
    }

    return (
        <div>
            <input type="text" value={searchValue} onChange={handleSearchChange} placeholder="Search" /> {/* Change the type to string */}
            <FormDropdown<T>
                name={p.name}
                value={p.value} // Convert the value prop to a string
                display={p.display}
                options={options}
                placeholder={p.placeholder}
                label={p.label || ''} // Add a default value for the label prop
            />
        </div>
    )
}

export default FormFetchDropdown
