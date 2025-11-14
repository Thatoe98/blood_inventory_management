'use client';

import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  maxDate?: Date;
  minDate?: Date;
  showYearDropdown?: boolean;
  showMonthDropdown?: boolean;
  dropdownMode?: 'scroll' | 'select';
  dateFormat?: string;
  className?: string;
  required?: boolean;
}

export default function DatePicker({
  selected,
  onChange,
  placeholderText,
  maxDate,
  minDate,
  showYearDropdown = true,
  showMonthDropdown = true,
  dropdownMode = 'select',
  dateFormat = 'yyyy-MM-dd',
  className = '',
  required = false,
}: DatePickerProps) {
  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      placeholderText={placeholderText}
      maxDate={maxDate}
      minDate={minDate}
      showYearDropdown={showYearDropdown}
      showMonthDropdown={showMonthDropdown}
      dropdownMode={dropdownMode}
      dateFormat={dateFormat}
      required={required}
      className={`w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent ${className}`}
      wrapperClassName="w-full"
      calendarClassName="shadow-lg"
      yearDropdownItemNumber={100}
      scrollableYearDropdown
    />
  );
}
