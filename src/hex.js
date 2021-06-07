/** hex2ascii library fails to convert the unicode characters,
 * for example, the star celsius char.
 * The following small library provides the alternative solution that supports encoding and decoding
 * the unicode characters correctly.
 */
const hexEncode = (value) => {
  let hex
  let result = ''

  for (let i = 0; i < value.length; i++) {
    hex = value.charCodeAt(i).toString(16)
    result += ('000' + hex).slice(-4)
  }

  return result
}

const hexDecode = (value) => {
  const hexes = value.match(/.{1,4}/g) || []
  let back = ''

  for (let j = 0; j < hexes.length; j++) {
    back += String.fromCharCode(parseInt(hexes[j], 16))
  }

  return back
}

module.exports = {
  hexEncode,
  hexDecode,
}
