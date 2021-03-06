var EmployeeContractStorage = artifacts.require('./EmployeeContractStorage.sol');
var ECRecovery = artifacts.require('./ECRecovery.sol');
var Payroll = artifacts.require('./Payroll.sol');

module.exports = function (deployer) {
  deployer.deploy(ECRecovery);
  
  deployer.link(ECRecovery, Payroll);

  deployer.deploy(EmployeeContractStorage)
    .then(function() {
      return deployer.deploy(Payroll, EmployeeContractStorage.address);
    }).then(function() {
      return EmployeeContractStorage.deployed();
    }).then(function (instance) {
      instance.addAddressToWhitelist(Payroll.address);
    });

  
}
