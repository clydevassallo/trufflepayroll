var EmployeeContractStorage = artifacts.require('./EmployeeContractStorage.sol');
var ECRecovery = artifacts.require('./ECRecovery.sol');
var Channel = artifacts.require('./OneTimeChannel.sol');
var Ownable = artifacts.require('./Ownable.sol');
var Payroll = artifacts.require('./Payroll.sol');

module.exports = function (deployer) {
  deployer.deploy(EmployeeContractStorage)

  deployer.deploy(ECRecovery);
  // deployer.link(ECRecovery, Channel);

  // deployer.deploy(Channel)

  deployer.link(ECRecovery, Payroll);

  // deployer.link(EmployeeContractStorage, Payroll);
  // deployer.link(Channel, Payroll)

  deployer.deploy(Ownable);

  deployer.deploy(EmployeeContractStorage)
    .then(function() {
      return deployer.deploy(Payroll, EmployeeContractStorage.address);
    });
}
