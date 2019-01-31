var EmployeeContractStorage = artifacts.require('./EmployeeContractStorage.sol');
var truffleAssert = require('truffle-assertions');

contract('EmployeeContractStorage', function (accounts) {
    
    it('should do X', function() {
        var employeeContractStorage;
        var employeeCount;
        return EmployeeContractStorage
            .deployed()
            .then(function (instance) {
                employeeContractStorage = instance;
                return employeeContractStorage.getNumberOfEmployees.call();
            }).then(function (_employeeCount) {
                console.log('Employee count before = ' + _employeeCount);
                employeeCount = _employeeCount;

                // Given I create an employee contract for an account
                employeeContractStorage.createEmployeeContract(accounts[1], 100, 8);
            }).then(function () {
                // When I retrieve the employee count
                return employeeContractStorage.getNumberOfEmployees.call();    
            }).then(function (_employeeCount) {
                console.log('Employee count after = ' + _employeeCount);
                // Then the number of employees increased by 1
                assert.equal(Number(employeeCount) + 1, _employeeCount);
                employeeCount = _employeeCount;

                // When I retrieve the employee id for the same account
                return employeeContractStorage.readEmployeeId.call(accounts[1]);
            }).then(function(employeeId) {
                // Then the id is equal to the new employee count
                console.log('Employee id = ' + employeeId);
                console.log('Employee count = ' + employeeCount);
                assert.equal(Number(employeeCount), Number(employeeId), "Employee was not equal to the new employee count as expected because it was " + employeeId);

                // When I retrieve the hourly salary
                return employeeContractStorage.readHourlySalary.call(employeeId);
            }).then(function (hourlySalary) {
                // Then the hourly salary is as expected
                assert.equal(100, hourlySalary, "Hourly salary was not as expected but was " + hourlySalary);
            });

/*
    it('should do X events', function() {
        var employeeContractStorage;
        return EmployeeContractStorage
            .deployed()
            .then(function (instance) {
                employeeContractStorage = instance;
                console.log(employeeContractStorage.address);
                var employeeContractCreationEvent = employeeContractStorage.EmployeeContractCreation({},{fromBlock: 0, toBlock: 'latest'});

                employeeContractCreationEvent.watch(function(error, result){
                    if (!error)
                        {
                            console.log(result);
                            console.log(result.args.hourlySalary.toNumber());
                        } else {
                            console.log(error);
                        }
                }); 
                return employeeContractStorage.createEmployeeContract(accounts[1], 100, 8);
            }).then(function (employeeId) {
                
            });
           
            }).then(function () {
                console.log(employeeContractStorage.address);
                return employeeContractStorage.createEmployeeContract.call(accounts[2], 1000, 18);
            }).then(function (employeeId2) {
                assert.equal(6, employeeId2, "Employee was not saved in id 6 as expected because it was " + employeeId2);
            });
*/            
    });    
});