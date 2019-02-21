pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/access/Whitelist.sol";

contract EmployeeContractStorage is Whitelist {

    /* Data Definitions */ 

    struct EmployeeContract {
        bool exists;
        uint salaryPerSecond;
        uint maximumSecondsPerSession;
    }

    /* Data Storage */ 

    // Employee Contract Id Counter
    uint employeeCounter;

    // Employee Contracts Storage

    mapping (address => EmployeeContract) employeeContractsMap;

    /* Function Modifiers */
    modifier onlyIfSenderWhitelisted() {
        require(hasRole(msg.sender, ROLE_WHITELISTED), "Sender is not whitelisted!");
        _;
    }

    modifier employeeContractExists(address _address) {
        require(employeeContractsMap[_address].exists == true, "Employee does not exist");
        _;
    }

    /* Events */

    event EmployeeContractCreation (
        address indexed _from,
        address incomeAccount,
        uint salaryPerSecond,
        uint maximumSecondsPerSession
    );

    /* Constructor */ 
    
    constructor() public {
        employeeCounter = 0; 
    }

    /* Functions */

    function createEmployeeContract(address _incomeAccount, uint _salaryPerSecond, uint _maximumSecondsPerSession) 
    public onlyIfSenderWhitelisted
    returns (uint) {

        // Check that incomeAccount is unique (required for access control in employeeonly function for payroll) 
        require(employeeContractsMap[_incomeAccount].exists == false, "Employee with this address already exists");

        // Populate Employee Contract structure in map
        employeeContractsMap[_incomeAccount].exists = true;
        employeeContractsMap[_incomeAccount].salaryPerSecond = _salaryPerSecond;
        employeeContractsMap[_incomeAccount].maximumSecondsPerSession = _maximumSecondsPerSession;

        // Increment employee counter
        employeeCounter++;

        // Fire event
        emit EmployeeContractCreation(msg.sender, _incomeAccount, employeeContractsMap[_incomeAccount].salaryPerSecond, employeeContractsMap[_incomeAccount].maximumSecondsPerSession);

        return employeeCounter;
    }

    // Setter for Salary Per Second
    function updateSalaryPerSecond(address _employeeAddress, uint _salaryPerSecond)
    public onlyIfSenderWhitelisted employeeContractExists(_employeeAddress) {
        employeeContractsMap[_employeeAddress].salaryPerSecond = _salaryPerSecond;
    }

    // Setter for Max Second Per Session
    function updateMaximumSecondsPerSession(address _employeeAddress, uint _maximumSecondsPerSession)
    public onlyIfSenderWhitelisted employeeContractExists(_employeeAddress) {
        employeeContractsMap[_employeeAddress].maximumSecondsPerSession = _maximumSecondsPerSession;       
    }

    // Getter for Salary Per Second
    function readSalaryPerSecond(address _employeeAddress) 
    public employeeContractExists(_employeeAddress)
    view
    returns (uint) {
        return employeeContractsMap[_employeeAddress].salaryPerSecond;
    }

    // Getter for Max Seconds Per Session
    function readMaximumSecondsPerSession(address _employeeAddress) 
    public employeeContractExists(_employeeAddress)
    view
    returns (uint) {
        return employeeContractsMap[_employeeAddress].maximumSecondsPerSession;
    }

    function getNumberOfEmployees() 
    public view 
    returns (uint) {
        return employeeCounter;
    }

    function employeeExists(address _employeeAddress) 
    public 
    view 
    returns (bool) {
        return employeeContractsMap[_employeeAddress].exists == true; // Added 2nd check for redundancy
    }

}