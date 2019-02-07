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

    it('should manage the balance', function() {
        let initialBalance;
        return Payroll
        .deployed()
        .then(function (instance) {
            payroll = instance;
            return payroll.getBalance.call();
        }).then(function(balance) {
            initialBalance = balance;

            // Deposit
            return payroll.addFunds({value: 100});
        }).then(function() {
            return payroll.getBalance.call();
        }).then(function(balance) {
            // Check balance
            assert.equal(Number(initialBalance) + 100, balance);

            // Withdraw
            return payroll.withdrawFunds(50);
        }).then(function() {
            return payroll.getBalance.call();
        }).then(function(balance){
            // Check balance
            assert.equal(Number(initialBalance) + 50, balance);
        });
    });

    it('should not allow employees to punch in with insufficient balance', function() {
        return Payroll
        .deployed()
        .then(function (instance) {
            payroll = instance;
            return payroll.hireEmployee(accounts[3], 10, 8);
        }).then(function() {
            return payroll.punchIn({from: accounts[3]});
        }).then(function() {
            assert.equal(true,false,"PunchIn should have failed with insufficient balance but didn't");
        }).catch(function(e) {
            let errorMessage = e.message;
            assert.equal(true, errorMessage.includes('not enough money'));
        });
    });
});