// web3.utils.toAscii works like: '"0x61...0"' (bytes32) returns string that looks like `a`
// but in reality still has length 32 and has not readable symbols inside.
export const hex2ascii = hexData => {
  if (!hexData) return '';
  // split to chunks by 2 sybmols
  const src = hexData && hexData.toString().replace(/^0x/, '').match(/.{1,2}/g);
  if (!src) {
    return '';
  }
  const ascii = src
      .reduce((bucket, h) => {
        const i = parseInt(h, 16);
        if (i === 0) {
          return bucket;
        }
        return bucket += String.fromCharCode(i);
      }, '');
  return ascii;
};
