import React from "react";
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('ptBR', ptBR);

const DatePicker = ({ selectedDate, onChange }) => {
  return (
    <ReactDatePicker 
      name='date'
      selected={selectedDate} 
      onChange={onChange}
      dateFormat='dd/MM/yyyy'
      locale="ptBR"
    />
  );
};

export default DatePicker;
