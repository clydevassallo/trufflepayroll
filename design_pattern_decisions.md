that explains why you chose to use the design patterns that you did

# Design Patterns 

This document highlights the design patterns used in this project and the rationale behind using them.

## Contract Self Destruction

### About the pattern

The Contract Self Destruction pattern is used when the expected use of a contract is terminated. Using the selfdestruct() function, the contract refunds all remaining ether in the balance to a target address and reverts all future transaction. Using this pattern is an efficient way to extract money from a contract which should no longer be used as it costs less than other functions used to send ether. Since it frees up space on the blockchain, selfdestructing methods cost negative gas which is reduced from the total cost of the transaction. 

### Usecase

The OneTimeChannel contract is designed to be created whenever an employee punches in and destroyed whenever an employee punches out. On creation, the channel is filled with enough money to pay the employee for the maximum allowed session. In a typical case, upon punch out, ether is still available in the contract and should be returned to the Payroll contract. For this reason, the Contract Self Destruction Pattern was used to destroy the channel and clear funds whenever an employee punches out or a channel is timed out by the employer. Example:
```
function timeOutChannel() 
public onlyOwner {
    require (expirationDate <= now, "Channel timeout not yet elapsed");    
    selfdestruct(remainingBalanceWallet);
}
```

Ether sent to destroyed payment channels is lost so after calling destructive functions, the Payroll channel removes all references to the destroyed contracts. Example:
```
// Attempt to close the channel 
channels[employeeAddress].closeChannel(_hash, _signature, _value);
channels[employeeAddress] = OneTimeChannel(0);
```

## Withdrawal Pattern

### About the pattern

The Withdrawal Pattern is based around the principle of having recipients of payments pull their money out of the contract rather than having the contract push money out to its recipients. Commonly the transfer() function is used to send ether from a contract to a recipient. Whenever this function is called, if the recipient is another contract, its fallback/default function is called. If this function fails, the function calling the transfer() is reverted. Such contracts can be exploited by attackers to prevent payments to other recipients. 

With the Withdrawal Pattern, a failing payment to a recipient does not affect other payments, thus safeguarding against these attacks and making the contract more robust. 

### Use-case

In the developed Dapp, the withdrawal pattern was implemented on punch out. Employees initiate there own withdrawal when punching out by closing the payment channel and, if this withdrawal fails, other employees are not affected.

The owner of the payroll is also able to initiate withdrawals from the Payroll contract to extract funds if needed.
```
function withdrawFunds(uint amount) 
public onlyOwner {
    // Administrator of the payroll can withdraw funds
    require(amount <= address(this).balance, "Not enough money in Payroll");
    require(amount > 0, "Withdrawing 0 will have no effect");
    msg.sender.transfer(amount);
}
```

## Mapping Iterator Pattern

## About the pattern

The mapping iterator pattern provides a way through which one can iterate over the keys in a mapping to access its data. While convenient, iterating over mappings is expensive and should be avoided unless absolutely necessary.

## Use-case

The EmployeeContractStorage contract implements the mapping iterator pattern by storage an array of employee address and providing a function to get the employee address from the index. This pattern was implemented due to the fact that the contract was designed in a way to act as a store of data which can be potentially used by other contracts. While presently used, it is impossible to predict the ways new contracts will need to interact with this data and the cost of storing the keys array was considered an acceptible when compared to the cost of migrating all employee contract data if iterating on data is required in the future.

## Checks Effects Interactions Pattern

### About the pattern

This is a security pattern used to guard against reentrancy attacks which are further discussed in the avoiding_common_attacks document. Given the risks involved when calling unknown external addresses, this pattern states that effect should be applied before interactions rather then afterwards. In case of failed interaction, these effects will still be reverted and the contract state will remain intact. 

### Use-case

This pattern was used whenever calls to unknown external addresses were made. In the developed Dapp, such calls are typically done through the transfer() function of the closeChannel method initiated on punch out. In these cases, the employee was marked as punched out before closing the channel and the channel was marked as closed before initiating the transfer.