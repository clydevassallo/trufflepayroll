pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/access/Whitelist.sol";

contract EmployeeContractStorage is Whitelist {

    /* Data Definitions */ 

    struct EmployeeContract {
        bool exists;
        uint hourlySalary;
        uint maximumHoursPerDay;
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
        uint maximumHoursPerDay
    );

    /* Constructor */ 
    
    constructor() public {
        employeeCounter = 0; 
    }

    /* Functions */

    function createEmployeeContract(address _incomeAccount, uint _hourlySalary, uint _maximumHoursPerDay) 
    public onlyIfSenderWhitelisted
    returns (uint) {

        // Check that incomeAccount is unique (required for access control in employeeonly function for payroll) 
        require(employeeContractsMap[_incomeAccount].exists == false, "Employee with this address already exists");

        // Populate Employee Contract structure in map
        employeeContractsMap[_incomeAccount].exists = true;
        employeeContractsMap[_incomeAccount].hourlySalary = _hourlySalary;
        employeeContractsMap[_incomeAccount].maximumHoursPerDay = _maximumHoursPerDay;

        // Increment employee counter
        employeeCounter++;

        // Fire event
        emit EmployeeContractCreation(msg.sender, _incomeAccount, employeeContractsMap[_incomeAccount].hourlySalary, employeeContractsMap[_incomeAccount].maximumHoursPerDay);

        return employeeCounter;
    }

    // Setter for Hourly Salary
    function updateHourlySalary(address _incomeAccount, uint _hourlySalary)
    public onlyIfSenderWhitelisted employeeContractExists(_incomeAccount) {
        employeeContractsMap[_incomeAccount].hourlySalary = _hourlySalary;
    }

    // Setter for Max Hours Per Day
    function updateMaximumHoursPerDay(address _employeeAddress, uint _maximumHoursPerDay)
    public onlyIfSenderWhitelisted employeeContractExists(_incomeAccount) {
        employeeContractsMap[_employeeAddress].maximumHoursPerDay = _maximumHoursPerDay;       
    }

    // Getter for Hourly Salary
    function readHourlySalary(address _employeeAddress) 
    public employeeContractExists(_employeeAddress)
    view
    returns (uint) {
        return employeeContractsMap[_employeeAddress].hourlySalary;
    }

    // Getter for Max Hours Per Day
    function readMaximumHoursPerDay(address _employeeAddress) 
    public employeeContractExists(_employeeAddress)
    view
    returns (uint) {
        return employeeContractsMap[_employeeAddress].maximumHoursPerDay;
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