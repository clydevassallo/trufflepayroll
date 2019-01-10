// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import employeeStorageArtifact from '../../build/contracts/EmployeeContractStorage.json'

// EmployeeContractStorage is our usable abstraction, which we'll use through the code below.
const EmployeeContractStorage = contract(employeeStorageArtifact)

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account

const App = {
  start: function () {
    const self = this

    // Bootstrap the EmployeeContractStorage abstraction for Use.
    EmployeeContractStorage.setProvider(web3.currentProvider)

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

      accounts = accs
      account = accounts[0]

      self.createEmployee(accounts[1], 10, 100000, 8);

      /*
      Call fns in this 
      self.refreshBalance()
      */

      /* 
      Subscribe to comparing event
      
      var myEvent = instance.comparing({},{fromBlock: 0, toBlock: 'latest');
      myEvent.watch(function(error, result) {
        console.log("event called");
        console.log(result);
        console.log(result.args);
      });
      */
    })
  },

  setStatus: function (message) {
    const status = document.getElementById('status')
    status.innerHTML = message
  },

  createEmployee: function (employeeAccount, hourlySalary, maxSalaryPerDay, maxHoursPerDay) {
    const self = this

    let employeeContractStorage
    EmployeeContractStorage.deployed().then(function (instance) {
      employeeContractStorage = instance
      return employeeContractStorage
      .createEmployeeContract(employeeAccount, hourlySalary, 
        maxSalaryPerDay, maxHoursPerDay, 
        {from: accounts[0]}
      );
    }).then(function (value) {
      // promise
      alert("Employee was created with id " + value);
    }).catch(function (e) {
      alert(e);
      self.setStatus('Error; see log.')
    })
  }

  // ,
  // sendCoin: function () {
  //   const self = this

  //   const amount = parseInt(document.getElementById('amount').value)
  //   const receiver = document.getElementById('receiver').value

  //   this.setStatus('Initiating transaction... (please wait)')

  //   let meta
  //   MetaCoin.deployed().then(function (instance) {
  //     meta = instance
  //     return meta.sendCoin(receiver, amount, { from: account })
  //   }).then(function () {
  //     self.setStatus('Transaction complete!')
  //     self.refreshBalance()
  //   }).catch(function (e) {
  //     console.log(e)
  //     self.setStatus('Error sending coin; see log.')
  //   })
  // }
}

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
