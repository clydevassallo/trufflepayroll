// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import { default as Abi } from 'ethereumjs-abi'

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
    const self = this;

    // Keep track of shown events to prevent displaying them multiple times 
    App.shownEvents = new Object();

    // Bootstrap the EmployeeContractStorage abstraction for Use.
    EmployeeContractStorage.setProvider(web3.currentProvider);
    Payroll.setProvider(web3.currentProvider);

    // Load accounts with a delay to ensure the web3 provider is injected
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

        $('#current-account').text(web3.eth.accounts[0]);
      })
    }, 1000)

    // Reload page on account change
    setInterval(function() {
      if (web3.eth.accounts[0] !== App.account) {
        App.account = web3.eth.accounts[0];
        window.location.reload();
      }
    }, 2000);

    // Listen to EmployeeContractStorage Events
    EmployeeContractStorage.deployed().then(function (instance) {
      let employeeContractStorage = instance
      App.listenToEvent(employeeContractStorage.EmployeeContractCreation({fromBlock: 'latest'}));
    });

    // Listen to Payroll Events
    Payroll.deployed().then(function (instance) {
      let payroll = instance
      App.listenToEvent(payroll.HiredEmployee({fromBlock: 'latest'}));
      App.listenToEvent(payroll.PunchIn({fromBlock: 'latest'}));
      App.listenToEvent(payroll.PunchOut({fromBlock: 'latest'}));
    });
  },

  listenToEvent: function(solidityEvent) {
    solidityEvent.watch(function(error, result){
      if (!error)
      {
        if (!App.shownEvents[result.transactionHash]) {
          $('#events-list').append('<li class="list-group-item" style="background-color:navy; color: white; width: 100%">'+result.event+': '+ JSON.stringify(result.args)+'</li>');
          App.shownEvents[result.transactionHash] = true;
          console.log(JSON.stringify(result));
        }
        console.log(JSON.stringify(result));
      } else {
        console.log(error);
      }
    });
  },

  /* Administration */ 
  hireEmployee: function (employeeAccount, salaryPerSecond, maxSecondsPerSession) {
    let payroll
    Payroll.deployed().then(function (instance) {
      payroll = instance
      return payroll
      .hireEmployee(employeeAccount, web3.toWei(salaryPerSecond, "ether"), maxSecondsPerSession, 
        {from: web3.eth.accounts[0], gas:180000}
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
      return payroll.addFunds({from: web3.eth.accounts[0], value: web3.toWei(amountToDeposit, "ether"), gas:22000});
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

  generateHashAndSignature: function(employeeAddress, paymentValue) {
    let payroll
    Payroll.deployed().then(function (instance) {
      payroll = instance
      return payroll.getEmployeeChannelAddress.call(employeeAddress);
    }).then(function (channelAddress) {
      if (channelAddress) {
        // Generate hash and signature from address and value
        console.log('Channel Address is ' + channelAddress);
        let message = abi.soliditySHA3(
            ["address", "uint256"],
            [channelAddress, web3.toWei(paymentValue, "ether")]
        );

        let hash = "0x" + message.toString("hex");
            
        web3.eth.sign(
          web3.eth.accounts[0],
          hash,
          function (error, result) {
            console.log('-------------- web3ethsign hash --------------')
            if (!error)
            { 
              console.log('No Error in web3ethsign hash!');
              console.log('Signature is ' + result);
              Swal.fire({
                position: 'top-end',
                type: 'success',
                title: 'Successfully Generated Signature',
                text: 'Hash: ' + hash + '. Signature: ' + result,
                showConfirmButton: true,
                width: 500
              });
            } else {
              console.log('Error is ' + error);
            }
            console.log('--------------------------------------------------')
          }
        );
      } else {
        Swal.fire({
          position: 'top-end',
          type: 'error',
          title: 'Failed to get employee channel address',
          showConfirmButton: false,
          timer: 1500,
          width: 300
        });
      }
    })
  },

  timeoutChannel: function(walletAddress) {
    let payroll
    Payroll.deployed().then(function (instance) {
      payroll = instance;
      return payroll.releaseChannel(walletAddress, {from: web3.eth.accounts[0], gas:50000});
    }).then(function (value) {
      Swal.fire({
        position: 'top-end',
        type: 'success',
        title: 'Channel was successfully timed out!',
        showConfirmButton: false,
        timer: 1500,
        width: 300
      });
    }).catch(function (e) {
      console.log(e);
      Swal.fire({
        position: 'top-end',
        type: 'error',
        title: 'Failed to time out channel!',
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
      .punchIn({from: web3.eth.accounts[0], gas:900000});
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
      return payroll.getChannelParties.call(hash, signature, {from: web3.eth.accounts[0]});
    }).then(function (signerAndOpener) {  
      console.log('Signer is ' + signerAndOpener[0]);
      console.log('Opener is ' + signerAndOpener[1]);
      console.log('Payee is ' + signerAndOpener[2]);
      console.log('Remaining Balance Wallet is ' + signerAndOpener[3]);
      return payroll
      .punchOut(hash, signature, web3.toWei(value, "ether"), {from: web3.eth.accounts[0], gas:80000});
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
  }

}

/* Administration Event Listeners */

$('#admin-hire-employee-form').on('submit', function (e) {
  e.preventDefault();

  let name = $('#employee-name').val();
  let walletAddress = $('#employee-wallet-address').val();
  let hourlySalary = $('#employee-hourly-salary').val();
  let maxHoursPerSession = $('#employee-max-hours-per-session').val();
  
  let salaryPerSecond = hourlySalary / 3600;
  let maxSecondsPerSession = maxHoursPerSession * 3600;
  
  console.log('Name ' + name);
  console.log('Wallet Address ' + walletAddress);
  console.log('Hourly Salary ' + hourlySalary);
  console.log('Max Hours Per Session ' + maxHoursPerSession);
  console.log('Salary Per Second ' + salaryPerSecond);
  console.log('Max Seconds Per Session' + maxSecondsPerSession);

  App.hireEmployee(walletAddress, salaryPerSecond, maxSecondsPerSession);
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

$('#admin-generate-signature-form').on('submit', function (e) {
  e.preventDefault();

  let payeeAddress = $('#employee-payee-address').val();
  let paymentValue = $('#employee-payee-value').val();

  console.log(payeeAddress);
  console.log(paymentValue);

  App.generateHashAndSignature(payeeAddress, paymentValue);
})

$('#admin-timeout-channel-form').on('submit', function (e) {
  e.preventDefault();

  let walletAddress = $('#timeout-channel-employee-wallet-address').val();

  console.log(walletAddress);

  App.timeoutChannel(walletAddress);
})

/* Employee Event Listeners */

$('#employee-is-punched-in-text').on('show.bs.collapse', function(e) {
  App.amIPunchedIn();
})

$('#employee-punch-in').on('click', function (e) {
  App.punchIn();
})

$('#employee-punch-out-form').on('submit', function (e) {
  e.preventDefault();

  /* ====================== Call Solidity Hire Employee ======================= */
  /* data: address _incomeAccount, uint _hourlySalary, uint _maximumHoursPerSession */
  let hash = $('#employee-punch-out-hash').val();
  let signature = $('#employee-punch-out-signature').val();
  let value = $('#employee-punch-out-value').val();

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

  window.abi = Abi;

  App.start()
  
})

