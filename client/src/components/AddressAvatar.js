import React from 'react';
import Blockies from 'react-blockies';


function AddressAvatar({ className, addr }) {
  return <Blockies
    seed={addr || '0x00'}
    spotColor="rgba(236, 72, 153)"
    color="rgba(59, 130, 246)"
    bgColor="rgba(209, 213, 219)"
    className={['rounded-sm', className || ''].join(' ')}
  />
}


export default AddressAvatar;
