# Lesson 7 in Patrick's course

- In this lesson we go deeper into configuring hardhat. Basically hardhat is a swiss army knife to deploy contracts.
  You can add a helper-config file where you set the addresses of certain contracts that you want to use. In this example is for the price agregators of different networks.

- You can also deploy mock contracts when testing locally. A Chainlink aggregator wont be available when testing locally so you deploy a mock contract to test.

- We configure the hadhat-deploy plugin and create a deploy folder

- This command is usefull for running just one test yarn hardhat test --grep "amount funded"
  "amount funded" is some text in the description of the test

- You can add tags to deploy scripts so is easier to select what you want to deploy

- Learn about the Arrange -> Act -> Assert pattern for testing

- Storage and memory data structure are explained in order to save gas. Cool stuff!
