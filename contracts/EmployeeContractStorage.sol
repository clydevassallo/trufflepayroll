pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/access/Whitelist.sol";

contract EmployeeContractStorage is Whitelist {

    /* Data Definitions */ 

    struct EmployeeContract {
        bool exists;
        uint hourlySalary;
        uint maximumHoursPerSession;
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
        uint hourlySalary,
        uint maximumHoursPerSession
    );

    /* Constructor */ 
    
    constructor() public {
        employeeCounter = 0; 
    }

    /* Functions */

    function createEmployeeContract(address _incomeAccount, uint _hourlySalary, uint _maximumHoursPerSession) 
    public onlyIfSenderWhitelisted
    returns (uint) {

        // Check that incomeAccount is unique (required for access control in employeeonly function for payroll) 
        require(employeeContractsMap[_incomeAccount].exists == false, "Employee with this address already exists");

        // Populate Employee Contract structure in map
        employeeContractsMap[_incomeAccount].exists = true;
        employeeContractsMap[_incomeAccount].hourlySalary = _hourlySalary;
        employeeContractsMap[_incomeAccount].maximumHoursPerSession = _maximumHoursPerSession;

        // Increment employee counter
        employeeCounter++;

        // Fire event
        emit EmployeeContractCreation(msg.sender, _incomeAccount, employeeContractsMap[_incomeAccount].hourlySalary, employeeContractsMap[_incomeAccount].maximumHoursPerSession);

        return employeeCounter;
    }

    // Setter for Hourly Salary
    function updateHourlySalary(address _employeeAddress, uint _hourlySalary)
    public onlyIfSenderWhitelisted employeeContractExists(_employeeAddress) {
        employeeContractsMap[_employeeAddress].hourlySalary = _hourlySalary;
    }

    // Setter for Max Hours Per Session
    function updateMaximumHoursPerSession(address _employeeAddress, uint _maximumHoursPerSession)
    public onlyIfSenderWhitelisted employeeContractExists(_employeeAddress) {
        employeeContractsMap[_employeeAddress].maximumHoursPerSession = _maximumHoursPerSession;       
    }

    // Getter for Hourly Salary
    function readHourlySalary(address _employeeAddress) 
    public employeeContractExists(_employeeAddress)
    view
    returns (uint) {
        return employeeContractsMap[_employeeAddress].hourlySalary;
    }

    // Getter for Max Hours Per Session
    function readMaximumHoursPerSession(address _employeeAddress) 
    public employeeContractExists(_employeeAddress)
    view
    returns (uint) {
        return employeeContractsMap[_employeeAddress].maximumHoursPerSession;
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