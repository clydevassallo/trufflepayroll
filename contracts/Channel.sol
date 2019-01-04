pragma solidity ^0.4.24;

contract Channel {

    address channelSender;
    address channelRecipient;
    uint startDate;
    uint channelTimeout;
    mapping (bytes32 => address) signatures;

    constructor(address to, address from, uint timeout) 
    public payable {
        channelRecipient = to;
        channelSender = from;
        startDate = now;
        channelTimeout = timeout;
    }

    // SEE: https://github.com/ethereum/solidity/blob/develop/docs/solidity-by-example.rst#micropayment-channel 
    function closeChannel(bytes32 h, uint8 v, bytes32 r, bytes32 s, uint value) 
    public payable {

        address signer;
        bytes32 proof;

        // get signer from signature
        signer = ecrecover(h, v, r, s);

        // signature is invalid, throw
        require (signer == channelSender || signer == channelRecipient, "Channel can only be closed by sender or recipient");

        // was "proof = sha3(this, value);"
        proof = keccak256(abi.encode(this, value));

        // signature is valid but doesn't match the data provided
        require (proof == h, "Proof failed");

        if (signatures[proof] == 0) {
            signatures[proof] = signer;
        }
        else if (signatures[proof] != signer){
            // channel completed, both signatures provided
            channelRecipient.transfer(value);
            selfdestruct(channelSender);
        }

    }

    function timeOutChannel() 
    public payable {
        uint endDate = startDate + channelTimeout;

        require (endDate <= now, "Channel timeout not yet elapsed");

        selfdestruct(channelSender);
    }

}