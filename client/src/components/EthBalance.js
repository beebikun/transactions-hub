import React, { useState, useEffect } from 'react';

const ETH = 10 ** 18;
const MIN_ETH = 10 ** 14;

const EthBalance = ({ n = 0 }) => {
  const [converted, setConverted] = useState('0 ETH');
  useEffect(() => {
    if (n > MIN_ETH) {
      setConverted(`${(n / ETH).toFixed(4)} ETH`);
    }
    else {
      setConverted(`${n} WEI`);
    }
  }, [n]);
  return converted;
};

export default EthBalance;
