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
 

**Note: A more detailed documentation of the project can be found in the 'doc' directory under the root folder.**