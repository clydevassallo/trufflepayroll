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

    mapping (uint => bool) isEmployeePunchedIn;

    event HiredEmployee (
        address indexed from,
        uint employeeId
    );

    event PunchOut (
        address indexed from,
        bytes32 _hash,
        bytes signature,
        uint value
    );

    /* Function Modifiers */

    modifier onlyEmployee() {
        require(getEmployeeContractStorage().employeeExists(msg.sender) == true, "Only employees can call this function");
        _;
    }

    modifier externalStorageSet() {
        require(address(employeeContractStorage) != address(0), "Initialize the employee storage before calling this function");
        _;
    }

    /* Constructor */
    constructor(address _employeeContractStorageAddress) 
    public {
        setEmployeeContractStorage(_employeeContractStorageAddress);
    }
    

    /* Functions */       

    // Callable By Owner //

    function setEmployeeContractStorage(address _employeeContractStorageAddress) 
    public onlyOwner {
        employeeContractStorage = EmployeeContractStorage(_employeeContractStorageAddress);
    }

    function addFunds() 
    public onlyOwner payable {
        // Emit event with balance update
    }

    function withdrawFunds() 
    public onlyOwner {
        // Add withdraw pattern
    }

    function getBalance() 
    public view onlyOwner
    returns (uint) {
        return this.balance;
    }

    function releaseChannel(uint _employeeId) 
    public onlyOwner {
        require (address(channels[employee]) != address(0));
        
        // Set employee as punched out, should be redundant but ensure that the state is not corrupted
        if (isEmployeePunchedIn[_employeeId]) {
            isEmployeePunchedIn[_employeeId] = false;
        }

        address employee = getEmployeeContractStorage().readEmployeeContractIncomeAccount(_employeeId);
        channels[employee].timeOutChannel();
        channels[employee] = OneTimeChannel(0);
    }

    function hireEmployee(address _incomeAccount, uint _hourlySalary, uint _maximumHoursPerDay)
    public onlyOwner 
    returns (uint) {
        uint employeeId = getEmployeeContractStorage().createEmployeeContract(_incomeAccount, _hourlySalary, _maximumHoursPerDay);
        emit HiredEmployee(msg.sender, employeeId);
        // raise event
        return employeeId;
    }

    function countEmployees()
    public view onlyOwner
    returns (uint) {
        return getEmployeeContractStorage().getNumberOfEmployees();
    }

    function isEmployed(address _employeeAddress) 
    public view onlyOwner 
    returns (bool) {
        return getEmployeeContractStorage().employeeExists(_employeeAddress);
    }

    function getEmployeeChannelAddress(address _employeeAddress) 
    public view onlyOwner
    returns (address) {
        address channelAddress = address(channels[_employeeAddress]);
        return channelAddress;
    }

    // Callable By Employee //

    function punchIn() 
    public {
        // Get employee id
        uint employeeId = getEmployeeContractStorage().readEmployeeId(msg.sender);

        // Ensure employee is not punched in and punch in
        require(isEmployeePunchedIn[employeeId] == false);
        isEmployeePunchedIn[employeeId] = true;

        // Ensure a channel does not already exist for this employee
        require(channels[msg.sender] == OneTimeChannel(0), "A channel already exists. Probably a punch out was missed. Ask employer to timeout the channel.");

        // Get Salary Per Hour 
        uint employeeSalaryPerHour = getEmployeeContractStorage().readHourlySalary(employeeId);

        // Get Maximum Hours Per Day
        uint employeeMaximumHoursPerDay = getEmployeeContractStorage().readMaximumHoursPerDay(employeeId);

        /*
            Tricky Part: 
             - Create a new channel in the map and transfer the maximum daily amount 
               from this contract to the channel. (timeout should be 1 day)
        */

        // Try to get hours till end of day?
        uint timeOutValue = 24 hours - (now / 24 hours);

        // Calculate maximum salary for day
        uint employeeMaximumSalaryPerDay = employeeSalaryPerHour * employeeMaximumHoursPerDay;

        // Open the payment channel
        channels[msg.sender] = OneTimeChannel((new OneTimeChannel).value(employeeMaximumSalaryPerDay)(owner, address(this), msg.sender, timeOutValue));    
    }

    function punchOut(bytes32 _hash, bytes _signature, uint _value) 
    public onlyEmployee {
        // Get employee id
        uint employeeId = getEmployeeContractStorage().readEmployeeId(msg.sender);

        // Ensure employee is punched in and punch out
        require(isEmployeePunchedIn[employeeId] == true);
        isEmployeePunchedIn[employeeId] = false;

        emit PunchOut(msg.sender, _hash, _signature, _value);

        channels[msg.sender].closeChannel(_hash, _signature, _value);
        channels[msg.sender] = OneTimeChannel(0);
    }

    function isPunchedIn() 
    public view 
    returns (bool) {
        uint employeeId = getEmployeeContractStorage().readEmployeeId(msg.sender);
        return isEmployeePunchedIn[employeeId];
    }

    function getEmployeeId() 
    public view
    returns (uint) {
        uint employeeId = getEmployeeContractStorage().readEmployeeId(msg.sender);
        return employeeId;
    }

    /* Private functions */

    function getEmployeeContractStorage() 
    private view externalStorageSet
    returns (EmployeeContractStorage) {
        return employeeContractStorage;
    }

    // default fn
    function() public {
        revert("Please use a valid method");
    }

}