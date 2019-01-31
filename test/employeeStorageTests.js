var EmployeeContractStorage = artifacts.require('./EmployeeContractStorage.sol');

contract('EmployeeContractStorage', function (accounts) {
    it('should do X', function() {
        var employeeContractStorage;
        return EmployeeContractStorage
            .deployed()
            .then(function (instance) {
                employeeContractStorage = instance;
                console.log(employeeContractStorage.address);
                return employeeContractStorage.createEmployeeContract.call(accounts[1], 100, 8);
            }).then(function (employeeId) {
                assert.equal(5, employeeId, "Employee was not saved in id 5 as expected because it was " + employeeId);
                console.log('id is ok');
                return employeeContractStorage.readHourlySalary.call(employeeId);
            }).then(function (hourlySalary) {
                console.log('testing hourly salary');
                assert.equal(100, hourlySalary, "Hourly salary was not as expected but was " + hourlySalary);
            });    
/*                
            }).then(function () {
                console.log(employeeContractStorage.address);
                return employeeContractStorage.createEmployeeContract.call(accounts[2], 1000, 18);
            }).then(function (employeeId2) {
                assert.equal(6, employeeId2, "Employee was not saved in id 6 as expected because it was " + employeeId2);
            });
*/            
    });    
});