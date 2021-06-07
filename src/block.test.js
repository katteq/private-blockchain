const { Block } = require('./block')
const SHA256 = require('crypto-js/sha256')
const { calculateHash } = require('./calculateHash')

describe('block', () => {
  it('should create a new block', () => {
    const data = 'genesis block'
    const block = new Block(data)

    expect(block.hash).toBeDefined()
    expect(calculateHash(JSON.stringify(data))).toEqual(block.hash)
  })

  it('should validate the block and return true if it is not tampered', async () => {
    const data = 'block to validate'
    const block = new Block(data)

    await expect(block.validate()).resolves.toEqual(true)
  })

  it('should validate the block and return false if it is tampered', async () => {
    expect.assertions(2)
    const data = 'block to validate'
    const block = new Block(data)

    await expect(block.validate()).resolves.toEqual(true)

    block.hash = calculateHash(' changed data')

    await expect(block.validate()).rejects.toEqual(
      'The block has been tampered.',
    )
  })

  it('should return block data', async () => {
    expect.assertions(1)
    const data = 'block to validate'
    const block = new Block(data)
    // set previous block hash to test non genesis block scenario
    block.previousBlockHash = 'test'

    await expect(block.getBData()).resolves.toEqual('block to validate')
  })

  it('should return a block data', async () => {
    const data = {
      dec: "18° 52' 56.9",
      ra: '16h 29m 1.0s',
      story: 'Testing the story 1',
    }
    const block = new Block(data)

    block.previousBlockHash = 'test'

    await expect(block.getBData()).resolves.toEqual(data)
  })

  it('should reject for a genesis block data', async () => {
    expect.assertions(1)
    const data = 'genesis block'
    const block = new Block(data)

    await expect(block.getBData()).resolves.toEqual({})
  })
})
