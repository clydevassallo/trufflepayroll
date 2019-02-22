# Truffle Payroll

Truffle Payroll is an HR payroll system running on Ethereum. 

At its current state, Truffle Payroll enables employers to:
 * Hire new employees
 * Manage funds in the payroll
 * Sign payments to employees, issueing a hash and signature which can be used to claim payments
 * Reclaim locked funds if an employee fails to punch out

As an employee registered with the system, one can:
 * Punch in 
 * Punch out using the given hash and signature

Future improvements:
 * Automatically issue hourly payments to punched in employees
 * Enabled employees to easily verify received hash and signature

## Getting Started

This section outlines how to get Truffle Payroll up and running on a local blockchain. In the rest of this document, the directory containing this README is referred to as the root directory.

### Prerequisites

The following software is required to build, test and run Truffle Payroll. The following versions of software are recommended as they have been tests to work with Truffle Payroll.

 * [Npm](https://www.npmjs.com/get-npm) v6.4.1
 * [Truffle](https://truffleframework.com/) v4.1.14
 * [Solc](https://www.npmjs.com/package/solc) v0.4.24
 * [Ganache](https://truffleframework.com/ganache) v1.3.0
 * [Metamask](https://metamask.io/) v5.3.0
 * [Web3](https://web3js.readthedocs.io/en/latest/) v0.20.6

### Installing Dependencies

 * Run 'npm install' in the root directory. This will download all dependencies for Truffle Payroll

### Compiling

 * Run 'truffle compile' in the root directory.

### Deploying 

 * Start Ganache. Running a local ethereum blockchain, for example on http://127.0.0.1:8545.
 * Ensure that the truffle-config.js has a deployment target corresponding to the local instance of the blockchain.
 * Run 'truffle migrate --network NETWORK_NAME'. Replace NETWORK_NAME with the corresponding target in the truffle-config file. If not specified, the migrate command will set the network name as development.

### Running the Tests

 * Run 'truffle test' in the root directory. Ensure the availability of at least 6 wallets, the 1st of which having at least 10 ETH available in the balance.
 
### Running the application

 * In the app folder, under the root directory, run 'npm run dev'. This will start the application on http://localhost:8080 by default.

### Using the application 

Below is a sample use-case of Truffle Payroll:

 1. Import the first account from ganache into Metamask. This account was used by default to deploy the smart contracts and represents the Employer or Payroll Administrator. 
 2. With the employer account active in MetaMask, go to the application url (default http://localhost:8080) and click on the 'Hire New Employee' button. Fill in the details of the form with the details of the desired employee. As an example, set the Wallet Address as the second account in Ganache, the Hourly Salary to 1 (1 ETH) and Max Hours per Day to 4.
 3. Click the submit button and confirm the transaction. 
 4. Click the 'Deposit Funds in Payroll' button and enter 5 (5 ETH) as the amount to deposit.
 5. Click the submit button and confirm the transaction. 
 6. Import the second account from ganache into Metamask. This account will represent the employee.
 7. With the employee account active in MetaMask, click on the 'Punch In' button and confirm the transaction. This will withdraw 4 ETH (1 ETH * 4 hours) from the Payroll account and open a Payment Channel with these funds. 
 8. With the employer account active in MetaMask, click on the 'Generate Hash and Signature' button. Enter the employee's wallet address and a payment value of 1 (1 ETH).
 9. Click the submit button and take note of the generated hash and signature. In a real world scenario, these are given to the employee on an out-of-band channel. 
 10. With the employee account active in MetaMask, click on the 'Punch Out' button. Enter the noted hash, signature and 1 (1 ETH) as a punch out value.
 11. Click the submit button and confirm the transaction. This will close the payment channel by selfdestructing the contract and send 1 ETH to the employee and the remaining 3 ETH to the Payroll contract.


**Note: A more detailed documentation of the project can be found in the 'doc' directory under the root folder. Videos showing the use of the application and a quick run through the code can be found under the 'videos' directory.**