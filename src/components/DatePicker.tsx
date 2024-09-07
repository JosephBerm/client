import React, { useState } from 'react';
import ReactDatePicker, { DatePickerProps as ReactDatePickerProps } from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import "@/styles/components/DatePicker.css";


type DateValue = Date | null;
type DateRange = [DateValue, DateValue];
type LooseValue = DateValue | DateRange;

export interface DatePickerProps extends Omit<ReactDatePickerProps, 'onChange' | 'value'> {
    label: string;
    onChange: (date: Date | null) => void;
    value: Date | null;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, onChange, value, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const handleChange = (newValue: LooseValue) => {
        if (Array.isArray(newValue)) {
            // If it's a range, use the first date
            onChange(newValue[0]);
        } else {
            onChange(newValue);
        }
        setIsOpen(false); // Close the calendar after selection
    };

    return (
        <div className='date-picker-wrapper'>
            <label className='m-2'>{label}</label>
            <ReactDatePicker
                {...props}
                onChange={handleChange}
                value={value}
                isOpen={isOpen}
                onCalendarOpen={() => setIsOpen(true)}
                onCalendarClose={() => setIsOpen(false)}
                closeCalendar={true} // Ensure calendar closes on selection
            />
        </div>
    );
};

export default DatePicker;