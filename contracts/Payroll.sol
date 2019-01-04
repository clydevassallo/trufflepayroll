pragma solidity ^0.4.24;

import "./EmployeeContractStorage.sol";

contract Payroll {

    /* Data Definitions */  

    /* Data Storage */ 

    EmployeeContractStorage public employeeContraceStorage;

    address owner;

    /* Function Modifiers */

    modifier onlyEmployee() {
        require(employeeContraceStorage.employeeExists(msg.sender) == true, "Only employees can call this function");
        _;
    }

    /* Functions */       

    // Callable By Owner

    function addFunds() {

    }

    // Callable By Employee

    function punchIn() 
    public onlyEmployee {
        
    }

    function punchOut() 
    public onlyEmployee {
        
    }

}