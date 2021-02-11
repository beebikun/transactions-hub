import { useState, useEffect } from 'react';


const Address = ({ addr }) => {
  if (!addr) {
    addr = '0x0000000000000000000000000000000000000000';
  }
  const [shorten, setShorten] = useState('');
  useEffect(() => {
    setShorten(addr.substr(0, 6) + '...' + addr.substr(-4));
  }, [addr]);
  return shorten;
};

export default Address;
