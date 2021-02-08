import React from 'react';


function Input({ className, value, placeholder, type, name, onChange, brR, brL }) {
  const paddingClss = 'px-3 py-1 rounded-sm';
  // const colorClss = type === 'primary' ? 'bg-yellow-500' : 'bg-red-500';
  const clss = [className, 'border rounded-none', paddingClss].join(' ');
  const handleSubmit = (evt) => {
      evt.preventDefault();
      onChange && onChange(evt.target.value);
  }
  return (
    <input
      className={clss}
      name={name}
      placeholder={placeholder}
      type={type || 'text'}
      value={value || ''}
      onChange={handleSubmit}
    />
  );
}


export default Input;
