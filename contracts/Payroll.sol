pragma solidity ^0.4.24;

import "./EmployeeContractStorage.sol";
import "./OneTimeChannel.sol";

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Payroll is Ownable {

    /* Data Definitions */  

    /* Data Storage */ 
    using SafeMath for uint;

    EmployeeContractStorage public employeeContractStorage;

    mapping (address => OneTimeChannel) channels;

    mapping (address => uint) employeePunchInTime;

    /* Events */ 

    event HiredEmployee (
        address indexed from,
        uint employeeId
    );

    event PunchIn (
        address indexed from
    );

    event PunchOut (
        address indexed from,
        bytes32 _hash,
        bytes signature,
        uint value
    );

    /* Function Modifiers */

    modifier onlyEmployee() {
        require(getEmployeeContractStorage().employeeExists(msg.sender) == true, "Only employees can call this function");
        _;
    }

    modifier externalStorageSet() {
        require(address(employeeContractStorage) != address(0), "Initialize the employee storage before calling this function");
        _;
    }

    /* Constructor */
    constructor(address _employeeContractStorageAddress) 
    public {
        setEmployeeContractStorage(_employeeContractStorageAddress);
    }
    

    /* Functions */       

    // Callable By Everyone //

    function getOwner() 
    public view returns (address) {
        return owner;
    }

    // Callable By Owner //

    function setEmployeeContractStorage(address _employeeContractStorageAddress) 
    public onlyOwner {
        require(_employeeContractStorageAddress != address(0), "Given address is invalid. Points to 0x0.");
        employeeContractStorage = EmployeeContractStorage(_employeeContractStorageAddress);
    }

    function addFunds() 
    public onlyOwner payable {
        // Used by the administrator to add funds to the payroll.
        // The funds in this contract are considered as a pool to pay employees.
        require(msg.value > 0, "Withdrawing 0 will have no effect");
    }

    function withdrawFunds(uint amount) 
    public onlyOwner {
        // Administrator of the payroll can withdraw funds
        require(amount <= address(this).balance, "Not enough money in Payroll");
        require(amount > 0, "Withdrawing 0 will have no effect");
        msg.sender.transfer(amount);
    }

    function getBalance() 
    public view onlyOwner
    returns (uint) {
        return address(this).balance;
    }

    function releaseChannel(address _employeeAddress) 
    public onlyOwner {
        require(_employeeAddress != address(0), "Given address is invalid. Points to 0x0.");
        require(isEmployed(_employeeAddress), "Employee is not employed");
        require(address(channels[_employeeAddress]) != address(0), "Channel for employee does not exist");
        
        // Set employee as punched out, to allow future punchins
        employeePunchInTime[_employeeAddress] = 0;
        
        // Attempt to timeout the channel, subject to expiration restriction
        // All money will be sent to the Payroll contract
        channels[_employeeAddress].timeOutChannel();

        // Point the channel for employee to 0x0
        channels[_employeeAddress] = OneTimeChannel(0);
    }

    function hireEmployee(address _incomeAccount, uint _salaryPerSecond, uint _maximumSecondsPerSession)
    public onlyOwner 
    returns (uint) {
        require(_incomeAccount != address(0), "Given address is invalid. Points to 0x0.");

        // Create the employee in storage. Storage handles validation for duplicates
        uint employeeId = getEmployeeContractStorage().createEmployeeContract(_incomeAccount, _salaryPerSecond, _maximumSecondsPerSession);

        // Emit event to signal the creation of a new employee
        emit HiredEmployee(msg.sender, employeeId);
        
        return employeeId;
    }

    function countEmployees()
    public view onlyOwner
    returns (uint) {
        return getEmployeeContractStorage().getNumberOfEmployees();
    }

    function isEmployed(address _employeeAddress) 
    public view onlyOwner 
    returns (bool) {
        return getEmployeeContractStorage().employeeExists(_employeeAddress);
    }

    // Used when generating the hash and signature from front-end
    // to end that the generated information can only be used on 
    // this specific channel.
    function getEmployeeChannelAddress(address _employeeAddress) 
    public view onlyOwner
    returns (address) {
        require(_employeeAddress != address(0), "Given address is invalid. Points to 0x0.");
        require(isEmployed(_employeeAddress), "Employee is not employed");
        require(address(channels[_employeeAddress]) != address(0), "Channel for employee does not exist");
        
        address channelAddress = address(channels[_employeeAddress]);
        return channelAddress;
    }

    function getEmployeeMaximumSalary(address _employeeAddress, uint _time) 
    public onlyOwner view
    returns (uint) {
        return getEmployeeMaxSalary(_employeeAddress, _time);
    }
    
    function getPunchedInTime(address employeeAddress) 
    public view onlyOwner
    returns (uint) {
        return employeePunchInTime[employeeAddress];
    }

    // Callable By Employee //

    function punchIn() 
    public onlyEmployee {
        // Get employeeAddress
        address employeeAddress = msg.sender;

        // Ensure employee is not punched in and punch in
        require(employeePunchInTime[employeeAddress] == 0, "Already punched in. Please punch out before punching in or ask the administrator to timeout your previous channel.");
        
        // Ensure a channel does not already exist for this employee
        require(channels[employeeAddress] == OneTimeChannel(0), "A channel already exists. Probably a punch out was missed. Ask employer to timeout the channel.");
        
        /*
            Get required information to validate and open channel
        */

        // Get Salary Per Second 
        uint employeeSalaryPerSecond = getEmployeeContractStorage().readSalaryPerSecond(employeeAddress);

        // Get Maximum Seconds Per Session
        uint employeeMaximumSecondsPerSession = getEmployeeContractStorage().readMaximumSecondsPerSession(employeeAddress);
        
        // Calculate maximum salary for session
        uint employeeMaximumSalaryPerSession = employeeSalaryPerSecond * employeeMaximumSecondsPerSession;

        // Ensure there is enough money in the payroll to pay the maximum salary
        require(address(this).balance >= employeeMaximumSalaryPerSession, "There is not enough money in the payroll. Contact your administrator");

        // Set as punched in
        employeePunchInTime[employeeAddress] = now;
        
        /*
            Create a new one time channel in the map and transfer the maximum daily amount 
            from this contract to the channel.

            The channel will have the following details: -
            1) address channelOpener - The owner of the Payroll. This is used to verify signature
                of messages and guard the timeout function.
            2) address remainingBalanceWallet - The address of the Payroll contract. This will 
                be used to return funds to this contract when the channel is closed 
                or timed out.
            3) address paymentReceiverWallet - The address of the Employee. This will be used when 
                the channel is closed to pay the signed message value.
            4) uint timeout - The timeout period which has to elapse in order for an employer to be
                able to timeout the channel and prevent employee from locking funds. 
        */

        // Set expiration of channel 1 hour after the maximum allowed hours to give some leniency
        uint timeoutValue = employeeMaximumSecondsPerSession.add(1 hours);

        // Open the payment channel
        channels[employeeAddress] = OneTimeChannel((new OneTimeChannel).value(employeeMaximumSalaryPerSession)(owner, address(this), employeeAddress, timeoutValue));    

        emit PunchIn(msg.sender);
    }

    function getChannelParties(bytes32 _hash, bytes _signature) 
    public view onlyEmployee
    returns (address,address,address,address) {
        return channels[msg.sender].getChannelParties(_hash, _signature);
    }

    function punchOut(bytes32 _hash, bytes _signature, uint _value) 
    public onlyEmployee {
        uint employeeSalaryPerSecond = getEmployeeContractStorage().readSalaryPerSecond(msg.sender);

        // Get employee maximum salary for session (reverts if not punched in).
        // A 1min tolerance was added to account for inaccuracy of 'now'
        uint maximumSalary = getCurrentMaximumSalary().add(employeeSalaryPerSecond.mul(60));

        // Verify value of time provider by employer when calculating payment value
        require(_value <= maximumSalary, "The amount being claimed with punch out is higher than the maximum salary for the session. Ask employer to issue another signed managed with the correct salary if not available.");

        address employeeAddress = msg.sender;
        
        // Set employee punch in time to 0 to indicate punched out
        employeePunchInTime[employeeAddress] = 0;

        // Attempt to close the channel 
        channels[employeeAddress].closeChannel(_hash, _signature, _value);
        channels[employeeAddress] = OneTimeChannel(0);

        emit PunchOut(employeeAddress, _hash, _signature, _value);
    }

    function isPunchedIn() 
    public view onlyEmployee
    returns (bool) {
        // Get employeeAddress
        address employeeAddress = msg.sender;
        
        return employeePunchInTime[employeeAddress] > 0;
    }

    // Could be marked as view but the now would not be evaluated properly
    function getCurrentMaximumSalary() 
    public onlyEmployee
    returns (uint) {
        return getEmployeeMaxSalary(msg.sender, now);
    }

    /* Private Functions */

    function getEmployeeContractStorage() 
    private view externalStorageSet
    returns (EmployeeContractStorage) {
        return employeeContractStorage;
    }

    function getEmployeeMaxSalary(address _employeeAddress, uint _currentTime)
    private view
    returns (uint) {
        // Ensure employee is punched in
        require(employeePunchInTime[_employeeAddress] != 0, "Employee is not punched in");

        // Consider punch in and current time compared to max value
        uint punchInTime = employeePunchInTime[_employeeAddress];
        uint punchedInTime = _currentTime.sub(punchInTime);

        // Get employee maximum seconds per session
        uint maximumSecondsPerSession = getEmployeeContractStorage().readMaximumSecondsPerSession(_employeeAddress);

        // If punchedInTime > limit, set the punchedInTime to limit
        if (punchedInTime > maximumSecondsPerSession) {
            punchedInTime = maximumSecondsPerSession;
        }
        // Get Salary Per Second 
        uint employeeSalaryPerSecond = getEmployeeContractStorage().readSalaryPerSecond(_employeeAddress);

        // Calculate Maximum Salary
        uint currrentMaximumSalary = employeeSalaryPerSecond.mul(punchedInTime);

        return currrentMaximumSalary;
    }


    /* Default Function */

    function() public payable {
        
    }

}