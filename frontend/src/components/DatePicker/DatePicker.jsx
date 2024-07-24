// DatePicker.jsx
import React from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';

const DatePicker = ({ value, onChange, className }) => {
  return (
    <Flatpickr
      className={className} // Passa a classe recebida como props
      value={value}
      onChange={onChange}
      options={{
        dateFormat: 'd/m/Y',
        locale: Portuguese
      }}
    />
  );
};

export default DatePicker;
