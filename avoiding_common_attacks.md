# Vulnerabilities

This document outlines the vulnerabilities commonly exploited by attackers and the precautions taken in this Dapp to prevent them.

## 1. Reentrancy
### Cause of vulnerability

Contracts vulnerable to reentrancy attacks are characterised by updating the state guarding the contract __after__ a call to an external contract is made. 

Most commonly, this vulnerability occurs when contracts call a function to transfer ether to another address without setting the variable marking that the user has already without his funds beforehand. Since the send() function calls the fallback/default function of its recipient if it happens to be a contract, a malicious attacker would cause the vulnerable contract to call a callback function crafted to recursively call the vulnerable fuction. Another possible attack is to call the vulnerable function multiple times in a short timespan.

### Preventive measures taken

In the developed Dapp, Employees withdraw funds from the contract when they punch out. Internally, funds are transfered in the closeChannel() function of the payment channel.

The 1st guard against reentrancy was added in the Payroll() contract. The punchOut() function verifies that an employee is punched in at the start of the method (found in the getEmployeeMaxSalary() utility function):
```
require(employeePunchInTime[_employeeAddress] != 0, "Employee is not punched in");
```
The employee is then set as punched out before the closeChannel() function is called:
```
// Set employee punch in time to 0 to indicate punched out
employeePunchInTime[employeeAddress] = 0;

// Attempt to close the channel 
channels[employeeAddress].closeChannel(_hash, _signature, _value);
channels[employeeAddress] = OneTimeChannel(0);
```

The 2nd guard against reentrancy is in the closeChannel() function of the OneTimeChannel contract:
```
// Guard against reentrancy
require(isClosed == false, "Channel is already closed");
isClosed = true;

paymentReceiverWallet.transfer(value);
```

## 2. Integer Under/Overflow 
### Cause of vulnerability

In Solidity, integers have a specific range. When calculations cause the value of an integer to  exceed either the upper or lower end of this range, its value is set to the other end of the range and calculations continue from there.

Attackers can exploit such vulnerabilities by crafting inputs which cause variables to overflow or underflow. This can result is a variable tracking the attacker's balance in a vulnerable contract to be subtracted beyond 0 and set to the upper bounds of the integer range.

### Preventive measures taken

To prevent such vulnerabilities, in the Payroll contract, open-zeppelin's SafeMath library was used when conducting arithmetic operations on integers. This library internally uses logically assertions before returning the results to validate its inputs and outputs.

## 3. Dependency on Contract Balance

### Cause of vulnerability
### Preventive measures taken

## 
