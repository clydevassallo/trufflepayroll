var EmployeeContractStorage = artifacts.require('./EmployeeContractStorage.sol');

contract('EmployeeContractStorage', function (accounts) {
    
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
                console.log('Employee count before = ' + _employeeCount);
                employeeCount = _employeeCount;

                // Given I create an employee contract for an account
                return employeeContractStorage.createEmployeeContract(accounts[1], 100, 8);
            }).then(function () {
                // When I retrieve the employee count
                return employeeContractStorage.getNumberOfEmployees.call();    
            }).then(function (_employeeCount) {
                console.log('Employee count after = ' + _employeeCount);
                // Then the number of employees increased by 1
                assert.equal(Number(employeeCount) + 1, _employeeCount);
              
                // When I retrieve the hourly salary
                return employeeContractStorage.readSalaryPerSecond.call(accounts[1]);
            }).then(function (salaryPerSecond) {
                // Then the hourly salary is as expected
                assert.equal(100, salaryPerSecond, "Salary per second was not as expected but was " + salaryPerSecond);

                // When I retrieve the maximum hours per day
                return employeeContractStorage.readMaximumSecondsPerSession.call(accounts[1]);
            }).then(function (maximumSecondsPerSession) {
                // Then the hourly salary is as expected
                assert.equal(8, maximumSecondsPerSession, "Maximum Hours Per Day was not as expected but was " + maximumSecondsPerSession);
            });
    });
    
    


});