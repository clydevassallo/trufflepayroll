pragma solidity ^0.4.24;

contract EmployeeContractStorage {

    struct EmployeeContract {
        bool exists;
        uint id;
        address incomeAccount;

        uint hourlySalary;
        
        uint maximumSalaryPerDay;
        uint maximumHoursPerDay;
    }

    // Employee Contract Id Counter
    uint employeeCounter;

    // Employee Contracts Storage
    mapping (uint => EmployeeContract) employeeContractsIdMap;

    function addEmployeeContract(address _incomeAccount, uint _hourlySalary, uint _maximumSalaryPerDay, uint _maximumHoursPerDay) 
    public returns (uint) {

        // Set employeeId to the next employee counter
        uint employeeId = employeeCounter;

        // Populate Employee Contract structure in map
        employeeContractsIdMap[employeeId].exists = true;
        employeeContractsIdMap[employeeId].id = employeeId;
        employeeContractsIdMap[employeeId].incomeAccount = _incomeAccount;
        employeeContractsIdMap[employeeId].hourlySalary = _hourlySalary;
        employeeContractsIdMap[employeeId].maximumSalaryPerDay = _maximumSalaryPerDay;
        employeeContractsIdMap[employeeId].maximumHoursPerDay = _maximumHoursPerDay;

        // Increment employee counter
        employeeCounter++;

        return employeeId;
    }

    function removeEmployeeContract(uint id) 
    public {
        // Clear struct in mapping
        delete employeeContractsIdMap[id];
    }

    function getEmployeeContractIncomeAccount(uint id) 
    public view returns (address) {
        require(employeeContractsIdMap[id].exists == true, "Employee does not exists");

        return employeeContractsIdMap[id].incomeAccount;
    }

}