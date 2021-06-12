const SHA256 = require('crypto-js/sha256')

const calculateHash = (data) => SHA256(JSON.stringify(data)).toString()

module.exports.calculateHash = calculateHash
