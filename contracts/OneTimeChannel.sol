pragma solidity ^0.4.24;

import "zeppelin/contracts/ECRecovery.sol";

contract OneTimeChannel {

    address channelOpener;
    address remainingBalanceWallet;
    address paymentReceiverWallet;
    uint expirationDate;
    mapping (bytes32 => address) signatures;
    
    constructor (address _opener, address _remainingBalanceWallet, address _paymentReceiverWallet, 
                uint _timeout) 
    public payable {
        channelOpener = _opener;
        remainingBalanceWallet = _remainingBalanceWallet;
        paymentReceiverWallet = _paymentReceiverWallet;
        expirationDate = now + _timeout;
    }
    
    // SEE: https://github.com/ethereum/solidity/blob/develop/docs/solidity-by-example.rst#micropayment-channel 
    // v used to check which account's private key was used to sign the message, and the transaction's sender
    function closeChannel(bytes32 _hash, bytes _sig, uint value) 
    public payable {
        address signer;
        bytes32 proof;

        // get signer from signature
        signer = getSignerFromHashAndSig(_hash, _sig);
        
        // signature is invalid, throw
        require(signer == channelOpener, "Message can only be signer by the channel opener.");

        // was "proof = sha3(this, value);"
        proof = keccak256(abi.encodePacked(this, value));

        // signature is valid but doesn't match the data provided
        require(proof == _hash, "Signature was correct but the value being withdraw does not match that specified by the signer.");
        
        require(value <= this.balance, "Requested value is greater than this channel's balance");

        paymentReceiverWallet.transfer(value);
        selfdestruct(remainingBalanceWallet);
    }
    
    function timeOutChannel() 
    public payable {
        require (expirationDate <= now, "Channel timeout not yet elapsed");
        require (msg.sender == channelOpener, "Not authorised. Only channel opener can timeout this channel.");

        selfdestruct(remainingBalanceWallet);
    }

    function getSignerFromHashAndSig(bytes32 _hash, bytes _sig) 
    private 
    returns (address) {
        return ECRecovery.recover(_hash,_sig);
    }

    function getChannelParties(bytes32 _hash, bytes _sig) 
    public 
    returns (address,address,address,address) {
        return (ECRecovery.recover(_hash,_sig),channelOpener,paymentReceiverWallet,remainingBalanceWallet);
    }

}