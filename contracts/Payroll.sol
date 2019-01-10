pragma solidity ^0.4.24;

import "./EmployeeContractStorage.sol";
import "./Channel.sol";

import "zeppelin/contracts/ownership/Ownable.sol";
import "zeppelin/contracts/DayLimit.sol";

contract Payroll is Ownable, DayLimit {

    /* Data Definitions */  

    /* Data Storage */ 

    EmployeeContractStorage public employeeContractStorage;

    address owner;

    mapping (address => Channel) channels;

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
    public onlyEmployee limitedDaily(1) {
        // Get employee id
        uint employeeId = employeeContractStorage.readEmployeeId(msg.sender);

        // Get Maximum Salary Per Day
        uint employeeMaximumSalaryPerDay = employeeContractStorage.readMaximumSalaryPerDay(employeeId);

        /*
            Tricky Part: 
             - Create a new channel in the map and transfer the maximum daily amount 
               from this contract to the channel. (timeout should be 1 day)
        */

        // Try to get hours till end of day?
        uint timeOutValue = 24 hours - (now / 24 hours);

        channels[msg.sender] = (new Channel).value(employeeMaximumSalaryPerDay);
        channels[msg.sender].openChannel(msg.sender, address(this), timeOutValue);
    }

    function punchOut(bytes32 h, uint8 v, bytes32 r, bytes32 s) 
    public onlyEmployee limitedDaily(1) {
        uint value = 10; // should this be the calculation based on rate?
        channels[msg.sender].closeChannel(h, v, r, s, value);
    }

    // default fn
    function() public {
        revert("Please use a valid method");
    }

}