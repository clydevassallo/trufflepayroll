var Payroll = artifacts.require('./Payroll.sol');

contract('Payroll', function (accounts) {
    let payroll;
    it('should create the employee and the employee should be employed', function() {
        return Payroll
        .deployed()
        .then(function (instance) {
            payroll = instance;
            return payroll.hireEmployee(accounts[2], 10, 8);
        }).then(function() {
            return payroll.isEmployed.call(accounts[2]);
        }).then(function(isEmployed) {
            assert.equal(isEmployed, true);
        });
    });

    it('should update the balance', function() {
        let initialBalance;
        return Payroll
        .deployed()
        .then(function (instance) {
            payroll = instance;
            return payroll.getBalance.call();
        }).then(function(balance) {
            initialBalance = balance
            return payroll.addFunds({value: 100});
        }).then(function() {
            return payroll.getBalance.call();
        }).then(function(balance) {
            assert.equal(Number(initialBalance) + 100, balance);
        });
    });
});