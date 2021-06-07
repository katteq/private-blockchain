const bitcoinMessage = require('bitcoinjs-message')
const bitcoin = require('bitcoinjs-lib')

const testAddress1 = {
  address: '16wgJrasyXyhaUQFztBtJSc1WiJwYvFW4a',
  privateKey: 'L4LDE1MeNVKSsxM74g4rB3SfRV4aoUeSk2XPGRwiVmemEtxtsABF',
}

const testAddress2 = {
  address: '1Lw7kgTRYvuXfYXkcnSGYxjiUjLJ1YA3tm',
  privateKey: 'Kwo1hbZiqpujimyc3MotXF2uTAgFjxBKZA5mvhtCD9ZUnBKGF1Rz',
}

const testAddress3 = {
  address: '12jkyEKQY8cwARyHcNraVAJ6xj2CbKQU1c',
  privateKey: 'KxfjebkSMuqPtFsBFUP2PJUPHTMbuqD5RZ7CfyBBfd9jWnGjjVkp',
}

const signMessage = (message, privateKey) => {
  const keyPair = bitcoin.ECPair.fromWIF(privateKey)
  return bitcoinMessage.sign(
    message,
    keyPair.d.toBuffer(32),
    keyPair.compressed,
  )
}

const stars = [
  { dec: "18° 52' 56.9", ra: '16h 29m 1.0s', story: 'Testing the story 1' },
  { dec: "28° 52' 56.9", ra: '11h 29m 1.0s', story: 'Testing the story 2' },
  { dec: "38° 52' 56.9", ra: '12h 29m 1.0s', story: 'Testing the story 3' },
  { dec: "48° 52' 56.9", ra: '13h 29m 1.0s', story: 'Testing the story 4' },
  { dec: "58° 52' 56.9", ra: '14h 29m 1.0s', story: 'Testing the story 5' },
]

module.exports = {
  testAddress1,
  testAddress2,
  testAddress3,
  stars,
  signMessage,
}
