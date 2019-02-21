var Payroll = artifacts.require('./Payroll.sol');
var EmployeeContractStorage = artifacts.require('./EmployeeContractStorage.sol');

// https://truffleframework.com/docs/truffle/testing/testing-your-contracts#clean-room-environment
// ^ Should be at a clean state
contract('Payroll', function (accounts) {

    describe("Clean Payroll Tests", function() {
        // Clean the employee contract storage as it was not being cleaned even though it should have been.
        before("Initial State", function () {
            let payroll
            let employeeContractStorage;
            return Payroll
            .deployed()
            .then(function (instance) {
                payroll = instance;
                return EmployeeContractStorage.new({from: accounts[0]});
            }).then(function (instance) {
                employeeContractStorage = instance;
                return payroll.setEmployeeContractStorage(instance.address, {from: accounts[0]});
            }).then(function() {
                employeeContractStorage.addAddressToWhitelist(payroll.address);
            });
        });

        it('should create the employee and the employee should be employed', function() {
            let payroll
            return Payroll
            .deployed()
            .then(function (instance) {
                payroll = instance;
                return payroll.countEmployees.call();
            }).then(function (employeeCount){
                console.log('There are '+ employeeCount + ' employees!!!')
            
                return payroll.hireEmployee(accounts[1], 10, 8);
            }).then(function() {
                return payroll.isEmployed.call(accounts[1]);
            }).then(function(isEmployed) {
                assert.equal(isEmployed, true);
            });
        });

        it('should manage the balance', function() {
            let initialBalance;
            let payroll
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
            let payroll
            return Payroll
            .deployed()
            .then(function (instance) {
                payroll = instance;
                return payroll.getBalance.call();
            }).then(function(balance) {
                return payroll.hireEmployee(accounts[2], balance, 2);
            }).then(function() {
                return payroll.punchIn({from: accounts[2]});
            }).then(function() {
                assert.equal(true,false,"PunchIn should have failed with insufficient balance but didn't");
            }).catch(function(e) {
                let errorMessage = e.message;
                assert.equal(true, errorMessage.includes('not enough money'));
            }).then(function() {
                return payroll.isPunchedIn.call({from: accounts[2]});
            }).then(function(isPunchedIn){
                assert.isFalse(isPunchedIn, "Expected employee to not be punched in but was.")
            });
        });

        it('should allow employees to punch in with sufficient balance', function() {
            let payroll
            return Payroll
            .deployed()
            .then(function (instance) {
                payroll = instance;
                return payroll.getBalance.call();
            }).then(function(balance) {
                return payroll.hireEmployee(accounts[3], balance/4, 2);
            }).then(function() {
                return payroll.punchIn({from: accounts[3]});
            }).then(function() {
                return payroll.isPunchedIn.call({from: accounts[3]});
            }).then(function(isPunchedIn) { 
                assert.isOk(isPunchedIn, "Expected employee to be punched in but was not.");
            });
        });

    });

});