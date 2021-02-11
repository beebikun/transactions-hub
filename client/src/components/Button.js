import React from 'react';


function Button({ className, onClick, children, disabled, type = "secondary"}) {
  const paddingClss = 'px-3 py-1 rounded-sm';
  const type2color = {
    primary: 'bg-red-400 text-red-50 hover:bg-gray-500',
    secondary: 'border-2 border-gray-300 bg-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400',
    red: 'bg-red-500 text-red-50 hover:bg-gray-500',
    green: 'bg-green-500 text-green-50 hover:bg-gray-500',
  };
  const colorClss = type2color[type] || type2color.secondary;
  const clss = [className, paddingClss, colorClss];
  if (disabled) {
    // disabled:some seems to be broken
    clss.push('opacity-50');
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clss.join(' ')}
    >
      {children}
    </button>
  );
}


export default Button;
