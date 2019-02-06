// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import employeeStorageArtifact from '../../build/contracts/EmployeeContractStorage.json'
import payrollArtifact from '../../build/contracts/Payroll.json'

// EmployeeContractStorage is our usable abstraction, which we'll use through the code below.
const EmployeeContractStorage = contract(employeeStorageArtifact)
const Payroll = contract(payrollArtifact)

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account

const App = {
  start: function () {
    const self = this

    // Bootstrap the EmployeeContractStorage abstraction for Use.
    EmployeeContractStorage.setProvider(web3.currentProvider);
    Payroll.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs;
      account = accounts[0];
    })
  },

  hireEmployee: function (employeeAccount, hourlySalary, maxHoursPerDay) {
    let payroll
    Payroll.deployed().then(function (instance) {
      payroll = instance
      return payroll
      .hireEmployee(employeeAccount, hourlySalary, maxHoursPerDay, 
        {from: account}
      );
    }).then(function (value) {
      Swal.fire({
        position: 'top-end',
        type: 'success',
        title: 'Employee Account was successfully created!',
        showConfirmButton: false,
        timer: 1500,
        width: 300
      });
    }).catch(function (e) {
      Swal.fire({
        position: 'top-end',
        type: 'error',
        title: 'Failed to create employee!',
        showConfirmButton: false,
        timer: 1500,
        width: 300
      });
    })
  },

  countEmployees: function() {
    let payroll
    Payroll.deployed().then(function (instance) {
      payroll = instance
      return payroll.countEmployees.call();
    }).then(function (employeeCount) {
      $('#admin-count-employees-text').text('Number of Employees: ' + employeeCount);
    })
  },

  isEmployed: function (potentialEmployeeAccount) {
    let payroll
    Payroll.deployed().then(function (instance) {
      payroll = instance
      return payroll.isEmployed.call(potentialEmployeeAccount);
    }).then(function (isEmployed) {
      if (isEmployed) {
        Swal.fire({
          position: 'top-end',
          type: 'success',
          title: 'Employee with that address is employed',
          showConfirmButton: false,
          timer: 1500,
          width: 300
        });
      } else {
        Swal.fire({
          position: 'top-end',
          type: 'error',
          title: 'Employee with that address is not employed',
          showConfirmButton: false,
          timer: 1500,
          width: 300
        });
      }
    })
  },

  getPayrollBalance: function() {
    let payroll
    Payroll.deployed().then(function (instance) {
      payroll = instance
      return payroll.getBalance.call();
    }).then(function (balance) {
      $('#admin-get-payroll-balance-text').text('Payroll Balance: ' + balance);
    })
  }
}

$('#admin-hire-employee').on('click', function (e) {
  console.log("CLICKED HIRE EMPLOYEE");
})

$('#admin-hire-employee-form').on('submit', function (e) {
  e.preventDefault();

  /* ====================== Call Solidity Hire Employee ======================= */
  /* data: address _incomeAccount, uint _hourlySalary, uint _maximumHoursPerDay */
  let name = $('#employee-name').val();
  let walletAddress = $('#employee-wallet-address').val();
  let hourlySalary = $('#employee-hourly-salary').val();
  let maxHoursPerDay = $('#employee-max-hours-per-day').val();
  
  console.log(name);
  console.log(walletAddress);
  console.log(hourlySalary);
  console.log(maxHoursPerDay);

  App.hireEmployee(walletAddress, hourlySalary, maxHoursPerDay);
})

$('#admin-count-employees-text').on('show.bs.collapse', function(e) {
  App.countEmployees();
})

$('#admin-is-employed-form').on('submit', function (e) {
  e.preventDefault();

  /* ====================== Call Solidity Hire Employee ======================= */
  /* data: address _incomeAccount, uint _hourlySalary, uint _maximumHoursPerDay */
  let walletAddress = $('#potential-employee-wallet-address').val();

  console.log(walletAddress);

  App.isEmployed(walletAddress);
})

$('#admin-get-payroll-balance-text').on('show.bs.collapse', function(e) {
  App.getPayrollBalance();
})

window.App = App

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:7545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'))
  }

  App.start()
  
})

