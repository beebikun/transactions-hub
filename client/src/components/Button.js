import React from 'react';


function Button({ className, onClick, children, disabled, type = "secondary"}) {
  const paddingClss = 'px-3 py-1 rounded-sm';
  const colorClss = type === 'primary' ?
    'bg-red-400 text-red-50 hover:bg-gray-500' :
    'border-2 border-gray-300 bg-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400';
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
