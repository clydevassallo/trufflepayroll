var Payroll = artifacts.require('./Payroll.sol');
var EmployeeContractStorage = artifacts.require('./EmployeeContractStorage.sol');
import { default as Abi } from 'ethereumjs-abi'
var EthUtil = require('ethereumjs-util');


// https://truffleframework.com/docs/truffle/testing/testing-your-contracts#clean-room-environment
// ^ Should be at a clean state
contract('Payroll', function (accounts) {

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
        let balanceBeforeWithdrawal
        return Payroll
        .deployed()
        .then(function (instance) {
            payroll = instance;
            return payroll.getBalance.call();
        }).then(function(balance) {
            initialBalance = balance;

            // Deposit
            return payroll.addFunds({value: 1000000000000000000});
        }).then(function() {
            return payroll.getBalance.call();
        }).then(function(balance) {
            // Check balance
            assert.equal(Number(initialBalance) + 1000000000000000000, balance);
            balanceBeforeWithdrawal = balance;
            // Withdraw
            return payroll.withdrawFunds(50);
        }).then(function() {
            return payroll.getBalance.call();
        }).then(function(balance){
            // Check balance
            assert.equal(Number(balanceBeforeWithdrawal) + 50, balance.toString());
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

    it('should get maximum salary within session limit', function() {
        let payroll
        let sessionLimit
        return Payroll
        .deployed()
        .then(function (instance) {
            payroll = instance;
            return payroll.getBalance.call();
        }).then(function(balance) {
            sessionLimit =  balance/4 * 2;
            return payroll.hireEmployee(accounts[4], balance/4, 2);
        }).then(function() {
            return payroll.punchIn({from: accounts[4]});
        }).then(function() {
            return payroll.isPunchedIn.call({from: accounts[4]});
        }).then(function(isPunchedIn) { 
            assert.isOk(isPunchedIn, "Expected employee to be punched in but was not.");
            return payroll.getEmployeeChannelAddress.call(accounts[4]);
        }).then(function(){
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            return sleep(3000);
        }).then(function(){
            return payroll.getCurrentMaximumSalary({from: accounts[4]});
        }).then(function(){
            return payroll.getCurrentMaximumSalary.call({from: accounts[4]});
        }).then(function(maximumSalary){
            assert.isOk(maximumSalary <= sessionLimit, "Maximum salary was greater than session limit. MaximumSalary" + maximumSalary + '. Session limit ' + sessionLimit );
        })
    });

    it('should get expected salary', function() {
        let payroll
        let punchedInTime
        let expectedSalary
        let salaryRate
        let currentTime
        return Payroll
        .deployed()
        .then(function (instance) {
            payroll = instance;
            return payroll.getBalance.call();
        }).then(function(balance) {
            salaryRate = balance/500;
            return payroll.hireEmployee(accounts[5], balance/500, 200);
        }).then(function() {
            return payroll.punchIn({from: accounts[5]});
        }).then(function() {
            return payroll.isPunchedIn.call({from: accounts[5]});
        }).then(function(isPunchedIn) { 
            assert.isOk(isPunchedIn, "Expected employee to be punched in but was not.");
            return payroll.getEmployeeChannelAddress.call(accounts[5]);
        }).then(function(){
            return payroll.getPunchedInTime.call(accounts[5], {from: accounts[0]});
        }).then(function(_punchedInTime){
            punchedInTime = _punchedInTime;
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            return sleep(3000);
        }).then(function(){
            currentTime = ~~(Date.now() / 1000);
            expectedSalary = (currentTime - punchedInTime) * salaryRate;
            return payroll.getEmployeeMaximumSalary.call(accounts[5], currentTime, {from: accounts[0]});
        }).then(function (currentMaximumSalary) {            
            assert.equal(currentMaximumSalary, expectedSalary);
        })
    });

    /*
        Unfortunately the test below is not working as I am encountering problems when 
        signing the message here even though the same signing method works in the application.
        I tried various different things including using ethereumjs-util to sign the message with 
        no luck. Due to this problem, tests for punch out could not be automated.    
    */    

    // it('should allow employees to punch out', function() {
    //     let payroll
    //     let hash
    //     let signature
    //     let message
    //     let owner
    //     return Payroll
    //     .deployed()
    //     .then(function (instance) {
    //         payroll = instance;
    //         return payroll.getOwner.call();
    //     }).then(function(_owner){
    //         owner = _owner;
    //         console.log('owner is '+ owner);
    //         console.log('account0 is ' + accounts[0]);
    //         console.log('web3 accounts 0 is ' + web3.eth.accounts[0]);
    //         return payroll.getBalance.call();
    //     }).then(function(balance) {
    //         return payroll.hireEmployee(accounts[6], balance/4, 2);
    //     }).then(function() {
    //         return payroll.punchIn({from: accounts[6]});
    //     }).then(function() {
    //         return payroll.isPunchedIn.call({from: accounts[6]});
    //     }).then(function(isPunchedIn) { 
    //         assert.isOk(isPunchedIn, "Expected employee to be punched in but was not.");
    //         return payroll.getEmployeeChannelAddress.call(accounts[6]);
    //     }).then(function (employeeChannelAddress) {
    //         let channelAddress = employeeChannelAddress; 
    //         console.log('channel address is ' + channelAddress);           
    //         message = Abi.soliditySHA3(
    //             ["address", "uint256"],
    //             [channelAddress, 1]
    //         );
    
    //         hash = "0x" + message.toString("hex");
    //         return web3.eth.sign(
    //             owner,
    //             hash,
    //             function (error, result) {
    //                 if (!error) {
    //                     signature = result;
    //                     console.log(signature);
    //                 }
    //             }
    //         );
    //     }).then(function(){
    //         function sleep(ms) {
    //             return new Promise(resolve => setTimeout(resolve, ms));
    //         }
    //         return sleep(1000);
    //     }).then(function(){
    //         console.log('signature ' + signature);
    //         console.log('hash ' + hash);

    //         return payroll.punchOut(hash, signature, 1, {from: accounts[6]});
    //     }).then(function(){
    //         return payroll.isPunchedIn.call({from: accounts[6]});
    //     }).then(function(isPunchedIn) { 
    //         assert.isOk(isPunchedIn, "Expected employee to be punched out but was not.");
    //     })
    // });




});