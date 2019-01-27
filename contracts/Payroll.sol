pragma solidity ^0.4.24;

import "./EmployeeContractStorage.sol";
import "./OneTimeChannel.sol";

import "zeppelin/contracts/ownership/Ownable.sol";

contract Payroll is Ownable {

    /* Data Definitions */  

    /* Data Storage */ 

    EmployeeContractStorage public employeeContractStorage;

    address owner;

    mapping (address => OneTimeChannel) channels;

    /* Function Modifiers */

    modifier onlyEmployee() {
        require(employeeContractStorage.employeeExists(msg.sender) == true, "Only employees can call this function");
        _;
    }

    /* Functions */       

    // Callable By Owner //

    function addFunds() 
    public onlyOwner payable {

    }

    function withdrawFunds() 
    public onlyOwner {
        // Add withdraw pattern
    }

    function releaseChannel(uint _employeeId) 
    public onlyOwner {
        address employee = employeeContractStorage.readEmployeeContractIncomeAccount(_employeeId);
        channels[employee].timeOutChannel();
    }

    // Callable By Employee //

    function punchIn() 
    public onlyEmployee {
        // Get employee id
        uint employeeId = employeeContractStorage.readEmployeeId(msg.sender);

        // Get Salary Per Hour 
        uint employeeSalaryPerHour = employeeContractStorage.readHourlySalary(employeeId);

        // Get Maximum Hours Per Day
        uint employeeMaximumHoursPerDay = employeeContractStorage.readMaximumHoursPerDay(employeeId);

        /*
            Tricky Part: 
             - Create a new channel in the map and transfer the maximum daily amount 
               from this contract to the channel. (timeout should be 1 day)
        */

        // Try to get hours till end of day?
        uint timeOutValue = 24 hours - (now / 24 hours);

        // Calculate maximum salary for day
        uint employeeMaximumSalaryPerDay = employeeSalaryPerHour * employeeMaximumHoursPerDay;

        channels[msg.sender] = OneTimeChannel((new OneTimeChannel).value(employeeMaximumSalaryPerDay)(address(this), msg.sender, timeOutValue));    
    }

    function punchOut(bytes32 _hash, bytes _signature) 
    public onlyEmployee {
        uint value = 10; // should this be the calculation based on rate?
        channels[msg.sender].closeChannel(_hash, _signature, value);
    }

    // default fn
    function() public {
        revert("Please use a valid method");
    }

}