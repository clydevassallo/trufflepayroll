var OneTimeChannel = artifacts.require('./OneTimeChannel.sol');
import { default as Abi } from 'ethereumjs-abi'
import { default as Web3 } from 'web3'

/* Note: Signing transactions did not work in truffle test. For this reason, the amount of testing
 on the payment channel is limited */

// https://truffleframework.com/docs/truffle/testing/testing-your-contracts#clean-room-environment
// ^ Should be at a clean state
contract('OneTimeChannel', function (accounts) {
    
    it('should not allow timeout before expiry', function() {
        return OneTimeChannel.new(accounts[1], accounts[2], accounts[3], 1000, {from: accounts[0], value: 100000})
        .then(function (instance) {
            return instance.timeOutChannel({from: accounts[0]});
        }).then(function(){
            assert.equal(true,false,"Timeout should not have succeeded before expiry");
        }).catch(function() {
            assert.isOk(true);
        });
    });

    it('should allow timeout after expiry', function() {
        let oneTimeChannel;
        return OneTimeChannel.new(accounts[1], accounts[2], accounts[3], 1, {from: accounts[0], value: 100000})
        .then(function (instance) {
            oneTimeChannel = instance;
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            return sleep(3000);
        }).then(function (){
            return oneTimeChannel.timeOutChannel({from: accounts[0]});
        }).then(function(){
            assert.isOk(true);
        });
    });

    it('should not allow timeout by other accounts', function() {
        let oneTimeChannel;
        return OneTimeChannel.new(accounts[1], accounts[2], accounts[3], 1, {from: accounts[0], value: 100000})
        .then(function (instance) {
            oneTimeChannel = instance;
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            return sleep(3000);
        }).then(function (){
            return oneTimeChannel.timeOutChannel({from: accounts[1]});
        }).then(function(){
            assert.equal(true,false,"Timeout should not have succeeded by other account");
        }).catch(function() {
            assert.isOk(true);
        });
    });

    it('should get channel parties correctly', function() {
        let oneTimeChannel;
        return OneTimeChannel.new(accounts[1], accounts[2], accounts[3], 1, {from: accounts[0], value: 100000})
        .then(function (instance) {
            oneTimeChannel = instance; 

            // Obtained from Remix
            let hash = '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad'
            let  signature = '0xe5d8830e36b09084133f6dc7e0fcdaa94d27b9819df1215b5f3e1c1186ba998367b2d2220f72ad33ce27641bc5077ac66fbc49eadf938d7b16b5ec2f2c089e461c';

            return oneTimeChannel.getChannelParties.call(hash,signature);
        }).then(function(parties) {
            assert.equal('0xa1e44dce319d49ce58fbaf2dd901e37d8e4dd4df', parties[0], "Wrong signer")
            assert.equal(accounts[1], parties[1], "Wrong channel opener returned")
            assert.equal(accounts[2], parties[3], "Wrong channel remaining balance wallet returned")
            assert.equal(accounts[3], parties[2], "Wrong payment receiver returned")
            console.log(JSON.stringify(parties));
        });     
    });

});