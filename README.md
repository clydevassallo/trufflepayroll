# Truffle Payroll

Truffle Payroll is an HR payroll system running on Ethereum. The main aim of the system is to reduce the risk for employees when it comes to getting paid for their work. With traditional payroll systems, employees are paid on a monthly basis without any strong guarantee that the employer will pay in full and on time. These systems are characterised by 2 limitations that Truffle Payroll aims to address: 

 1. Employees give value to their employer on a daily basis, however, they are paid only paid after a whole month of work. Ideally, employees are paid constantly as they give value to their employers. The frequency on payment would also reduce the risk to which employees are exposed in terms of not getting paid.
 2. Employees are forced to trust that the employer has enough money to pay their salary.

In order to overcome these limitations, Truffle Payroll provides a way by which employees can be paid daily according to the amount of hours worked. On punch in, the maximum possible salary for the day is withdrawn from the employer's Payroll contract and stored in a Payment Channel contract. For every hour worked, the employee is issued a hash and signature from the employer. On punch out, the employee will use the latest pair of hash and signature received to claim the owed funds for the day, depending on the number of hours worked. When a punch out is successful, the Payment Channel is closed and the contract selfdestructed, returing the rest of the funds, if any, to the Payroll contract.

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

### Installing Dependencies

 * Run 'npm install' in the root directory. This will download all dependencies for Truffle Payroll

### Compiling

 * Run 'truffle compile' in the root directory.

### Deploying 

 * Start Ganache. Running a local ethereum blockchain, for example on http://127.0.0.1:8545.
 * Ensure that the truffle-config.js has a deployment target corresponding to the local instance of the blockchain.
 * Run 'truffle migrate --network NETWORK_NAME'. Replace NETWORK_NAME with the corresponding target in the truffle-config file. If not specified, the migrate command will set the network name as development.

### Running the Tests

 * Run 'truffle test' in the root directory.
 
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


**Note: A more detailed documentation of the project can be found in the 'doc' directory under the root folder.**