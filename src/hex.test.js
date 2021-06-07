const { hexEncode, hexDecode } = require('./hex')
const { stars } = require('./mockedData')

describe('hex', () => {
  it('should encode an object with unicode characters correctly', () => {
    const [star] = stars

    const encoded = hexEncode(JSON.stringify(star))
    expect(JSON.parse(hexDecode(encoded))).toEqual(star)
  })
})
