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

const App = {
  
  start: function () {
    const self = this

    // Bootstrap the EmployeeContractStorage abstraction for Use.
    EmployeeContractStorage.setProvider(web3.currentProvider);
    Payroll.setProvider(web3.currentProvider);

    setTimeout(() => {
      web3.eth.getAccounts((err, accs) => {
        if (err != null) {
          alert('There was an error fetching your accounts.')
          return
        }
  
        if (accs.length === 0) {
          alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
          return
        }
  
        App.accounts = accs; 
        App.account = App.accounts[0];
      })
    }, 1000)

    setInterval(function() {
      if (web3.eth.accounts[0] !== App.account) {
        App.account = web3.eth.accounts[0];
        window.location.reload();
      }
    }, 2000);

    EmployeeContractStorage.deployed().then(function (instance) {
      let employeeContractStorage = instance
      employeeContractStorage.EmployeeContractCreation().watch(function(error, result){
        if (!error)
          {
            console.log('No Error in EmployeeContractCreation Event!');
            console.log(result);
          } else {
            console.err(error);
          }
      }); 
    });

    Payroll.deployed().then(function (instance) {
      let payroll = instance
      payroll.HiredEmployee().watch(function(error, result){
        if (!error)
          {
            console.log('No Error in HiredEmployee Event!');
            console.log(result);
          } else {
            console.err(error);
          }
      }); 
    });

    Payroll.deployed().then(function (instance) {
      let payroll = instance
      payroll.PunchOut().watch(function(error, result){
        if (!error)
          {
            console.log('No Error in PunchOut Event!');
            console.log(result);
          } else {
            console.err(error);
          }
      }); 
    });
    
  },

  /* Administration */ 
  hireEmployee: function (employeeAccount, hourlySalary, maxHoursPerDay) {
    let payroll
    Payroll.deployed().then(function (instance) {
      payroll = instance
      return payroll
      .hireEmployee(employeeAccount, hourlySalary, maxHoursPerDay, 
        {from: web3.eth.accounts[0], gas:1000000}
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
      console.log(e);
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
      $('#admin-get-payroll-balance-text').text('Payroll Balance: ' + web3.fromWei(balance,"ether") + ' ETH');
    })
  },

  depositInPayroll: function(amountToDeposit) {
    let payroll
    Payroll.deployed().then(function (instance) {
      payroll = instance
      return payroll.addFunds({from: web3.eth.accounts[0], value: web3.toWei(amountToDeposit, "ether"), gas:1000000});
    }).then(function (value) {
      Swal.fire({
        position: 'top-end',
        type: 'success',
        title: 'Funds were successfully added!',
        showConfirmButton: false,
        timer: 1500,
        width: 300
      });
    }).catch(function (e) {
      console.log(e);
      Swal.fire({
        position: 'top-end',
        type: 'error',
        title: 'Failed to add funds!',
        showConfirmButton: false,
        timer: 1500,
        width: 300
      });
    })  
  },

  /* Employees */ 

  punchIn: function() {
    let payroll
    Payroll.deployed().then(function (instance) {
      payroll = instance
      return payroll
      .punchIn({from: web3.eth.accounts[0], gas:1000000});
    }).then(function (value) {
      Swal.fire({
        position: 'top-end',
        type: 'success',
        title: 'You were successfully punched in!',
        showConfirmButton: false,
        timer: 1500,
        width: 300
      });
    }).catch(function (e) {
      console.log(e);
      Swal.fire({
        position: 'top-end',
        type: 'error',
        title: 'Failed to punch in!',
        showConfirmButton: false,
        timer: 1500,
        width: 300
      });
    })
  },

  punchOut: function(hash, signature, value) {
    let payroll
    Payroll.deployed().then(function (instance) {
      payroll = instance
      return payroll
      .punchOut(hash, signature, value, {from: web3.eth.accounts[0], gas:1000000});
    }).then(function (value) {
      Swal.fire({
        position: 'top-end',
        type: 'success',
        title: 'You were successfully punched out!',
        showConfirmButton: false,
        timer: 1500,
        width: 300
      });
    }).catch(function (e) {
      console.log(e);
      Swal.fire({
        position: 'top-end',
        type: 'error',
        title: 'Failed to punch out!',
        showConfirmButton: false,
        timer: 1500,
        width: 300
      });
    })
  },

  amIPunchedIn: function() {
    let payroll
    Payroll.deployed().then(function (instance) {
      payroll = instance
      return payroll
      .isPunchedIn.call({from: web3.eth.accounts[0]});
    }).then(function (isPunchedIn) {
      $('#employee-is-punched-in-text').text('Am I Punched In? ' + isPunchedIn);
    });
  },

  getMyId: function() {
    let payroll
    Payroll.deployed().then(function (instance) {
      payroll = instance
      return payroll
      .getEmployeeId.call({from: web3.eth.accounts[0]});
    }).then(function (employeeId) {
      console.log(employeeId);
      $('#employee-get-my-id-text').text('Employee Id is ' + employeeId);
    });
  }
}

/* Administration Event Listeners */

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

  let walletAddress = $('#potential-employee-wallet-address').val();

  console.log(walletAddress);

  App.isEmployed(walletAddress);
})

$('#admin-get-payroll-balance-text').on('show.bs.collapse', function(e) {
  App.getPayrollBalance();
})

$('#admin-deposit-payroll-form').on('submit', function (e) {
  e.preventDefault();

  let amountToDeposit = $('#amount-to-deposit').val();

  console.log(amountToDeposit);

  App.depositInPayroll(amountToDeposit);
})

/* Employee Event Listeners */

$('#employee-is-punched-in-text').on('show.bs.collapse', function(e) {
  App.amIPunchedIn();
})

$('#employee-punch-in').on('click', function (e) {
  console.log("Punching in....");
  App.punchIn();
})

$('#employee-get-my-id-text').on('show.bs.collapse', function(e) {
  App.getMyId();
})

$('#employee-punch-out-form').on('submit', function (e) {
  e.preventDefault();

  /* ====================== Call Solidity Hire Employee ======================= */
  /* data: address _incomeAccount, uint _hourlySalary, uint _maximumHoursPerDay */
  let hash = $('#employee-punch-out-hash').val();
  let signature = $('#employee-punch-out-signature').val();
  let value = $('#employee-punch-out-value').val();

  console.log(hash);
  console.log(signature);
  console.log(value);

  App.punchOut(hash, signature, value);
})

/* Windows Event Listeners and Initialization */ 

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

