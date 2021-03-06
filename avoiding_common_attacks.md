# Vulnerabilities

This section outlines the vulnerabilities commonly exploited by attackers and the precautions taken in this Dapp to prevent them.

## 1. Reentrancy
### Cause of vulnerability

Contracts vulnerable to reentrancy attacks are characterised by updating the state guarding the contract __after__ a call to an external contract is made. 

Most commonly, this vulnerability occurs when contracts call a function to transfer ether to another address without setting the variable marking that the user has already without his funds beforehand. Since the transfer() function calls the fallback/default function of its recipient if it happens to be a contract, a malicious attacker would cause the vulnerable contract to call a callback function crafted to recursively call the vulnerable fuction. Another possible attack is to call the vulnerable function multiple times in a short timespan.

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

Some contracts base their logic on the value of their balance with the assumption that it was only changed in an expected way. However, attackers can manipulate the balance of contracts, by sending money into the contract if the fallback/default function is not protected. Even if such a function is protected, attackers can manipulate this balance by exploiting the fact that the selfdestruct() method does not call the fallback/defualt function or its recipient and still send ether to the targetted contract.

### Preventive measures taken

When writing this Dapp, it was always assumed that the balance of the contracts was modifiable by attackers. With this in mind, no critical logic was based on the exact value of the contracts' balances. If an attacker was to send money to this Dapp's contract, the money would be added to the contract's balance without affecting it's behavior in unpredicted ways.

## 4. Block Timestamp Manipulation

### Cause of vulnerability and preventive measures taken

Due to its decentralized nature, in Ethereum there is no single system clock which can act as a single source of truth for the current time. Within limits attackers can manipulate the block's timestamp (aliased as _now_) and exploit logic which relies on it's randomness or accurateness. Being a payroll system, this Dapp relies on time to compute the salary of employees. Care was taken to avoid assuming that the value for _now_ is accurate or truly random. The research into this topic is further explain in the supporting documentation.

# Security best practices

Other security measures taken to ensure that the Dapp is not compromised by malicious users.

## Functions' Visibility

When determining the visibility of functions, explicit was chosen over implicit to ensure that each function is visible in the expected way. Also, a 'least visible' principle was adhered to, assigning functions the most restrictive visibilty available without compromising the functionality of the Dapp.

## Access Control

All exposed functions in the Dapp were guarded with function modifiers ensuring that the caller is allowed to called the specified function. Administration functions in the Payroll contract can only be called by the Payroll owner (the creator of the contract). This was implemented using openzeppelin's Ownable contract. On the other hand, the punchIn and punchOut functions were guarded using a custom function modifier which ensures that the caller is an employee. This is done by comparing the contract address to the employees mapping found in the EmployeeContractStorage. 

The functions in the EmployeeContractStorage contract are protected through a whitelist. The contract was designed to storage data on contracts with employees are can potentially be accessed by other contracts in the future, whether they are newer versions of the Payroll contract or new contracts operating on this data. Using openzepplin's Whitelist contract, the owner of the storage contract (its creator) can add new contracts requiring access to the whitelist. Upon deployment, the Payroll contract is added automatically to this whitelist.

Lastly, the Payroll contract created new OneTimeChannel contracts and is the owner contract allowed to interact with them being their owner. With such an access control system, the responsiblity of differentiating which channel functions can be called by the administrator and which can be called by the employee was delegated to the Payroll contract.