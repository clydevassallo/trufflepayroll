var EmployeeContractStorage = artifacts.require('./EmployeeContractStorage.sol');

module.exports = function (deployer) {
  deployer.deploy(EmployeeContractStorage)
}
