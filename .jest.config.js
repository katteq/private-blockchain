const { defaults } = require('jest-config')
module.exports = {
  roots: ['src'],
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'js'],
  setupFilesAfterEnv: ['./jest.setup.js'],
}
