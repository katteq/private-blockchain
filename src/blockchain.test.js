const { Blockchain } = require('./blockchain')
const { Block } = require('./block')
const bitcoinMessage = require('bitcoinjs-message')
const bitcoin = require('bitcoinjs-lib')
const { toTimestamp, getCurrentTimestamp } = require('./date')
const { calculateHash } = require('./calculateHash')
const {
  testAddress1,
  testAddress2,
  testAddress3,
  signMessage,
  stars,
} = require('./mockedData')

jest.mock('./date', () => ({
  ...jest.requireActual('./date'),
  getCurrentTimestamp: jest.fn(),
}))

describe('blockchain', () => {
  beforeEach(() => {
    getCurrentTimestamp.mockImplementation(() => 1623055197)
  })

  it('should initialize a new blockchain with a genesis block and add a second block', async () => {
    const blockchain = await new Blockchain()

    expect(blockchain.chain.length).toBe(1)
    expect(blockchain.height).toBe(0)

    const genesisBlock = blockchain.chain[0]

    expect(genesisBlock.previousBlockHash).toBeNull()
    expect(genesisBlock.getBData()).resolves.toEqual({})

    const addedBlock1 = await blockchain._addBlock(new Block('Block 1'))

    expect(addedBlock1.previousBlockHash).toBe(genesisBlock.hash)
    expect(addedBlock1.height).toBe(1)
    expect(blockchain.height).toBe(1)

    const addedBlock2 = await blockchain._addBlock(new Block('Block 2'))

    expect(addedBlock2.previousBlockHash).toBe(addedBlock1.hash)
    expect(addedBlock2.height).toBe(2)
    expect(blockchain.height).toBe(2)

    const addedBlock3 = await blockchain._addBlock(new Block('Block 3'))

    expect(addedBlock3.previousBlockHash).toBe(addedBlock2.hash)
    expect(addedBlock3.height).toBe(3)
    expect(blockchain.height).toBe(3)
  })

  it('should request message ownership verification', async () => {
    const blockchain = await new Blockchain()
    const message = await blockchain.requestMessageOwnershipVerification(
      'testAddress',
    )
    expect(message).toBe('testAddress:1623055197:starRegistry')
  })

  it('should submit a new star', async () => {
    const blockchain = await new Blockchain()
    const address = testAddress1.address
    const message = await blockchain.requestMessageOwnershipVerification(
      address,
    )
    const signature = signMessage(message, testAddress1.privateKey)
    const star = stars[0]
    const block = await blockchain.submitStar(address, message, signature, star)

    expect(blockchain.height).toBe(1)
    await expect(block.getBData(block)).resolves.toEqual({
      owner: address,
      star,
    })
  })

  it('should throw during an attemp to add a new star with a timelapse more than 5 minutes', async () => {
    const blockchain = await new Blockchain()

    /** Testnet Wallet address */
    const address = testAddress1.address
    const message = await blockchain.requestMessageOwnershipVerification(
      address,
    )
    const signature = signMessage(message, testAddress1.privateKey)
    const star = stars[0]
    getCurrentTimestamp.mockClear()
    getCurrentTimestamp.mockImplementation(() => 1623005751073)

    await expect(
      blockchain.submitStar(address, message, signature, star),
    ).rejects.toBe('Timelapse is more than 5 minutes.')
  })

  it('should throw during an attemp to add a new star with an invalid wallet address', async () => {
    const blockchain = await new Blockchain()
    /** Testnet Wallet address */
    const address = testAddress2.address
    const message = await blockchain.requestMessageOwnershipVerification(
      address,
    )
    const signature = signMessage(message, testAddress1.privateKey)
    const star = stars[0]
    await expect(
      blockchain.submitStar(address, message, signature, star),
    ).rejects.toBe('Message verification failed.')
  })

  it('should search block by hash', async () => {
    const blockchain = await new Blockchain()

    const bl1 = new Block('data1')
    const bl2 = new Block('data2')
    const bl3 = new Block('data3')

    blockchain._addBlock(bl1)
    blockchain._addBlock(bl2)
    blockchain._addBlock(bl3)

    expect(blockchain.height).toBe(3)

    const search1 = await blockchain.getBlockByHash(bl3.hash)

    expect(search1.hash).toEqual(bl3.hash)
  })

  it('should reject if hash argument is undefined', async () => {
    const blockchain = await new Blockchain()

    const bl1 = new Block('data1')
    const bl2 = new Block('data2')
    const bl3 = new Block('data3')

    blockchain._addBlock(bl1)
    blockchain._addBlock(bl2)
    blockchain._addBlock(bl3)

    expect(blockchain.height).toBe(3)

    await expect(blockchain.getBlockByHash()).rejects.toEqual(
      'Hash is not defined.',
    )
  })

  it('should get stars by a wallet address', async () => {
    const blockchain = await new Blockchain()
    const message = await blockchain.requestMessageOwnershipVerification(
      testAddress1.address,
    )
    const signature = signMessage(message, testAddress1.privateKey)
    const [star1, star2, star3, star4, star5] = stars
    await blockchain.submitStar(testAddress1.address, message, signature, star1)
    await blockchain.submitStar(testAddress1.address, message, signature, star2)

    const message2 = await blockchain.requestMessageOwnershipVerification(
      testAddress2.address,
    )
    const signature2 = signMessage(message2, testAddress2.privateKey)
    await blockchain.submitStar(
      testAddress2.address,
      message2,
      signature2,
      star4,
    )
    await blockchain.submitStar(
      testAddress2.address,
      message2,
      signature2,
      star5,
    )
    await blockchain.submitStar(testAddress1.address, message, signature, star3)

    const blocks = await blockchain.getStarsByWalletAddress(
      testAddress1.address,
    )

    expect(blocks.length).toBe(3)
    const expectedStars = [
      { owner: testAddress1.address, star: star1 },
      { owner: testAddress1.address, star: star2 },
      { owner: testAddress1.address, star: star3 },
    ]
    expect(blocks).toEqual(expectedStars)
  })

  it('should reject the attempt to search for the stars by the undefined address', async () => {
    const blockchain = await new Blockchain()

    await expect(blockchain.getStarsByWalletAddress()).rejects.toBe(
      'Address must be provided',
    )
  })

  it('should validate blockchain', async () => {
    const blockchain = await new Blockchain()
    const message = await blockchain.requestMessageOwnershipVerification(
      testAddress1.address,
    )
    const signature = signMessage(message, testAddress1.privateKey)
    const [star1, star2, star3] = stars

    await blockchain.submitStar(testAddress1.address, message, signature, star1)
    await blockchain.submitStar(testAddress1.address, message, signature, star2)
    await blockchain.submitStar(testAddress1.address, message, signature, star3)

    const blocks = await blockchain.getStarsByWalletAddress(
      testAddress1.address,
    )

    await expect(blockchain.validateChain()).resolves.toEqual([])
  })

  it('should validate blockchain and return error log if one block data is tampered', async () => {
    const blockchain = await new Blockchain()
    const message = await blockchain.requestMessageOwnershipVerification(
      testAddress1.address,
    )
    const signature = signMessage(message, testAddress1.privateKey)
    const [star1, star2, star3] = stars

    await blockchain.submitStar(testAddress1.address, message, signature, star1)
    await blockchain.submitStar(testAddress1.address, message, signature, star2)
    await blockchain.submitStar(testAddress1.address, message, signature, star3)

    expect(blockchain.validateChain()).resolves.toEqual([])

    const blocks = await blockchain.getStarsByWalletAddress(
      testAddress1.address,
    )

    const foreignHash = calculateHash('changed data')
    /** Simulate block data tampering */
    const correctHash = blockchain.chain[1].hash
    blockchain.chain[1].hash = foreignHash

    await expect(blockchain.validateChain()).resolves.toEqual([
      {
        error: 'The block has been tampered.',
        hash: foreignHash,
        previousHash: blockchain.chain[1].previousBlockHash,
      },
      {
        error: 'Invalid block previous hash',
        hash: blockchain.chain[2].hash,
        previousHash: blockchain.chain[2].previousBlockHash,
      },
    ])
  })

  it('should get block by height', async () => {
    const blockchain = new Blockchain()

    await expect(blockchain.getBlockByHeight(0)).resolves.toEqual(
      blockchain.chain[0],
    )

    const bl1 = new Block('data1')
    const bl2 = new Block('data2')
    const bl3 = new Block('data3')

    blockchain._addBlock(bl1)
    blockchain._addBlock(bl2)
    blockchain._addBlock(bl3)

    expect(blockchain.height).toBe(3)

    await expect(blockchain.getBlockByHeight(1)).resolves.toEqual(bl1)
    await expect(blockchain.getBlockByHeight(2)).resolves.toEqual(bl2)
    await expect(blockchain.getBlockByHeight(3)).resolves.toEqual(bl3)

    await expect(blockchain.getBlockByHeight(4)).resolves.toBeNull()
  })
})
