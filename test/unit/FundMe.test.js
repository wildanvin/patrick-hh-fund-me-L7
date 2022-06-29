const { deployments, ethers, getNamedAccounts } = require('hardhat')
const { assert, expect } = require('chai')
const { developmentChains } = require('../../helper-hardhat-config')

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('FundMe', () => {
      let fundMe
      let deployer
      let mockV3Aggregator
      const sendValue = ethers.utils.parseEther('1') // 1ETH
      beforeEach(async () => {
        //deploy contract using hardhat deploy
        // const accounts = await ethers.getSigners()
        // const accountZero= accounts[0]

        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(['all'])
        fundMe = await ethers.getContract('FundMe', deployer)
        mockV3Aggregator = await ethers.getContract(
          'MockV3Aggregator',
          deployer
        )
      })
      describe('constructor', function () {
        it('sets the aggregator addresses correctly', async () => {
          const response = await fundMe.getPriceFeed()
          assert.equal(response, mockV3Aggregator.address)
        })
      })

      describe('fund', async () => {
        it("Fails if you don't send enough ETH", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            'You need to spend more ETH!'
          )
        })

        it('Updates the amount funded data structure', async () => {
          await fundMe.fund({ value: sendValue })
          const response = await fundMe.getAddressToAmountFunded(deployer)

          assert.equal(response.toString(), sendValue.toString())
        })

        it('Adds funder to array of funders', async () => {
          await fundMe.fund({ value: sendValue })
          const response = await fundMe.getFunder(0)
          assert.equal(response, deployer)
        })
      })

      describe('withdraw', async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue })
        })

        it('withdraw ETH from a single founder', async () => {
          //Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          //Act
          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          //Assert

          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })

        it('Allows to withdraw from multiple funders', async () => {
          //Arrange
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          //Act
          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          //Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )

          //Make sure the funders array is reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })

        it('Only allows the owner to withdraw', async function () {
          const accounts = await ethers.getSigners()
          const fundMeConnectedContract = await fundMe.connect(accounts[1])
          await expect(fundMeConnectedContract.withdraw()).to.be.revertedWith(
            'FundMe__NotOwner'
          )
        })

        it('cheaper withdraw...', async () => {
          //Arrange
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          //Act
          const transactionResponse = await fundMe.cheaperWithdraw()
          const transactionReceipt = await transactionResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          //Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )

          //Make sure the funders array is reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })
      })
    })
