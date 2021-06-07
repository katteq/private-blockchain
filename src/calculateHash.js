const SHA256 = require('crypto-js/sha256')

const calculateHash = (data) => SHA256(SHA256(data)).toString()

module.exports.calculateHash = calculateHash
