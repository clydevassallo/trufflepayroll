var EmployeeContractStorage = artifacts.require('./EmployeeContractStorage.sol');

// https://truffleframework.com/docs/truffle/testing/testing-your-contracts#clean-room-environment
// ^ Should be at a clean state
contract('EmployeeContractStorage', function (accounts) {
    
    it('should not be accessible by accounts outside the whitelist', function() {
        let employeeContractStorage;
        return EmployeeContractStorage
            .deployed()
            .then(function(instance) {
                employeeContractStorage = instance;
                return employeeContractStorage.addAddressToWhitelist(accounts[0]);
            }).then(function () {
                return employeeContractStorage.createEmployeeContract(accounts[1], 100, 8, {from: accounts[3]});
            }).then(function () {
                assert.equal(true,false,"createEmployeeContract function should not be accessible outside the whitelist"); 
            }).catch(function () {
                assert.equal(true,true);
            });
    });

    it('should be accessible by accounts inside the whitelist', function() {
        let employeeContractStorage;
        return EmployeeContractStorage
            .deployed()
            .then(function(instance) {
                employeeContractStorage = instance;
                return employeeContractStorage.addAddressToWhitelist(accounts[0]);
            }).then(function () {
                return employeeContractStorage.createEmployeeContract(accounts[1], 100, 8, {from: accounts[0]});
            }).then(function () {
                assert.equal(true,true);
            }).catch(function () {
                assert.equal(true,false,"createEmployeeContract function should be accessible inside the whitelist"); 
            });
    });

    it('should create the employee as specified', function() {
        let employeeContractStorage;
        let employeeCount;
        let employeeId;
        return EmployeeContractStorage
            .deployed()
            .then(function(instance) {
                employeeContractStorage = instance;
                return employeeContractStorage.addAddressToWhitelist(accounts[0]);
            }).then(function () {
                return employeeContractStorage.getNumberOfEmployees.call();
            }).then(function (_employeeCount) {
                employeeCount = _employeeCount;

                // Given I create an employee contract for an account
                return employeeContractStorage.createEmployeeContract(accounts[2], 100, 8);
            }).then(function () {
                // When I retrieve the employee count
                return employeeContractStorage.getNumberOfEmployees.call();    
            }).then(function (_employeeCount) {
                // Then the number of employees increased by 1
                assert.equal(Number(employeeCount) + 1, _employeeCount);
              
                // When I retrieve the hourly salary
                return employeeContractStorage.readSalaryPerSecond.call(accounts[2]);
            }).then(function (salaryPerSecond) {
                // Then the hourly salary is as expected
                assert.equal(100, salaryPerSecond, "Salary per second was not as expected but was " + salaryPerSecond);

                // When I retrieve the maximum hours per day
                return employeeContractStorage.readMaximumSecondsPerSession.call(accounts[2]);
            }).then(function (maximumSecondsPerSession) {
                // Then the hourly salary is as expected
                assert.equal(8, maximumSecondsPerSession, "Maximum Hours Per Day was not as expected but was " + maximumSecondsPerSession);
            });
    });

    it('should not allow the creation of duplicate employees', function() {
        let employeeContractStorage;
        return EmployeeContractStorage
            .deployed()
            .then(function(instance) {
                employeeContractStorage = instance;
                return employeeContractStorage.addAddressToWhitelist(accounts[0]);
            }).then(function () {
                return employeeContractStorage.createEmployeeContract(accounts[3], 100, 8, {from: accounts[0]});
            }).then(function () {
                return employeeContractStorage.createEmployeeContract(accounts[3], 100, 8, {from: accounts[0]});
            }).then(function () {
                assert.equal(true,false,"Duplicate employee creation should have failed."); 
            }).catch(function () {
                assert.equal(true,true);
            });
    });

    it('should update the salary correctly', function() {
        let employeeContractStorage;
        return EmployeeContractStorage
            .deployed()
            .then(function(instance) {
                employeeContractStorage = instance;
                return employeeContractStorage.addAddressToWhitelist(accounts[0]);
            }).then(function () {
                return employeeContractStorage.createEmployeeContract(accounts[4], 100, 8, {from: accounts[0]});
            }).then(function () {
                return employeeContractStorage.updateSalaryPerSecond(accounts[4], 200, {from: accounts[0]});
            }).then(function() {
                return employeeContractStorage.readSalaryPerSecond.call(accounts[4]);
            }).then(function (salaryPerSecond) {
                assert.equal(200, salaryPerSecond, "Salary per second was not as expected but was " + salaryPerSecond);
            });
    });
    
    


});