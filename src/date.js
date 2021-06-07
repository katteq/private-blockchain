const getCurrentTimestamp = () =>
  parseInt(new Date().getTime().toString().slice(0, -3))

module.exports = { getCurrentTimestamp }
