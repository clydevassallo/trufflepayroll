pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ECRecovery.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract OneTimeChannel is Ownable {

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
    public onlyOwner {

        // get signer from signature
        address signer = getSignerFromHashAndSig(_hash, _sig);
        
        // signature is invalid, throw
        require(signer == channelOpener, "Message can only be signer by the channel opener.");

        // was "proof = sha3(this, value);"
        bytes32 proof = keccak256(abi.encodePacked(this, value));

        // signature is valid but doesn't match the data provided
        require(proof == _hash, "Signature was correct but the value being withdraw does not match that specified by the signer.");
        
        require(value <= address(this).balance, "Requested value is greater than this channel's balance");

        paymentReceiverWallet.transfer(value);
        selfdestruct(remainingBalanceWallet);
    }
    
    function timeOutChannel() 
    public onlyOwner {
        require (expirationDate <= now, "Channel timeout not yet elapsed");

        selfdestruct(remainingBalanceWallet);
    }

    function getSignerFromHashAndSig(bytes32 _hash, bytes _sig) 
    private pure
    returns (address) {
        return ECRecovery.recover(_hash,_sig);
    }

    function getChannelParties(bytes32 _hash, bytes _sig) 
    public view
    returns (address,address,address,address) {
        return (getSignerFromHashAndSig(_hash,_sig),channelOpener,paymentReceiverWallet,remainingBalanceWallet);
    }

}