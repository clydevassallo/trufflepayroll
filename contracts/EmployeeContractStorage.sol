pragma solidity ^0.4.24;

contract EmployeeContractStorage {

    /* Data Definitions */ 

    struct EmployeeContract {
        bool exists;
        uint id;
        address incomeAccount;

        uint hourlySalary;
        
        uint maximumSalaryPerDay;
        uint maximumHoursPerDay;
    }

    /* Data Storage */ 

    // Employee Contract Id Counter
    uint employeeCounter;

    // Employee Contracts Storage

    mapping (uint => EmployeeContract) employeeContractsIdMap;
    mapping (address => uint) employeesToIdMap;

    /* Function Modifiers */

    modifier employeeContractExists(uint _id) {
        require(employeeContractsIdMap[_id].exists == true, "Employee does not exist");
        _;
    }

    /* Constructor */ 
    
    constructor() public {
        employeeCounter = 1; // Start at 1 to avoid default int
    }

    /* Functions */

    function createEmployeeContract(address _incomeAccount, uint _hourlySalary, uint _maximumSalaryPerDay, uint _maximumHoursPerDay) 
    public 
    returns (uint) {
        // Check that incomeAccount is unique (required for access control in employeeonly function for payroll) 
        require(employeesToIdMap[_incomeAccount] == 0, "Employee with this account already exists");

        // Set employeeId to the next employee counter
        uint employeeId = employeeCounter;

        // Populate Employee Contract structure in map
        employeeContractsIdMap[employeeId].exists = true;
        employeeContractsIdMap[employeeId].id = employeeId;
        employeeContractsIdMap[employeeId].incomeAccount = _incomeAccount;
        employeeContractsIdMap[employeeId].hourlySalary = _hourlySalary;
        employeeContractsIdMap[employeeId].maximumSalaryPerDay = _maximumSalaryPerDay;
        employeeContractsIdMap[employeeId].maximumHoursPerDay = _maximumHoursPerDay;

        // Add address to Employees to Id map
        employeesToIdMap[_incomeAccount] = employeeId;

        // Increment employee counter
        employeeCounter++;

        return employeeId;
    }

    function deleteEmployeeContract(uint _id) 
    public employeeContractExists(_id) {
        // Remove address from Employees to Id map
        address employeeAddress = employeeContractsIdMap[_id].incomeAccount;
        employeesToIdMap[employeeAddress] = 0;

        // Clear struct in mapping
        delete employeeContractsIdMap[_id];
    }

    function readEmployeeContractIncomeAccount(uint _id) 
    public employeeContractExists(_id)
    view 
    returns (address) {
        return employeeContractsIdMap[_id].incomeAccount;
    }

    function updateHourlySalary(uint _id, uint _hourlySalary)
    public employeeContractExists(_id) {
        employeeContractsIdMap[_id].hourlySalary = _hourlySalary;
    }

    function readEmployeeId(address _employeeAddress) 
    public 
    view
    returns (uint) {
        return employeesToIdMap[_employeeAddress];
    }

    function employeeExists(address _employeeAddress) 
    public 
    view 
    returns (bool) {
        uint employeeId = readEmployeeId(_employeeAddress);
        return employeeId > 0 && employeeContractsIdMap[employeeId].exists == true; // Added 2nd check for redundancy
    }

    function readMaximumSalaryPerDay(uint _id) 
    public employeeContractExists(_id)
    view
    returns (uint) {
        return employeeContractsIdMap[_id].maximumSalaryPerDay;
    }
}