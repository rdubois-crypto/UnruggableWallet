/********************************************************************************************/
/*
/*   ╔═╗╔╦╗╔═╗╔═╗╔╦╗╦ ╦  ╔═╗╦═╗╦ ╦╔═╗╔╦╗╔═╗╦  ╦╔╗ 
/*   ╚═╗║║║║ ║║ ║ ║ ╠═╣  ║  ╠╦╝╚╦╝╠═╝ ║ ║ ║║  ║╠╩╗
/*   ╚═╝╩ ╩╚═╝╚═╝o╩ ╩ ╩  ╚═╝╩╚═ ╩ ╩   ╩ ╚═╝╩═╝╩╚═╝
/*              
/* Copyright (C) 2024 - Renaud Dubois - This file is part of SCL (Smoo.th CryptoLib) project
/* License: This software is licensed under MIT License (and allways will)      
/* Description: This file implements the BIP327/BIP340 verification protocol. The front signing algorithm 
/* is implemented in libMPC                                  
/********************************************************************************************/
pragma solidity ^0.8.23;

import "../lib/libSCL_BIP327.sol";

// SPDX-License-Identifier: MIT

/// @notice Contract designed for being delegated to by EOAs to authorize an aggregated Musig2 key to transact on their behalf.
contract SCLBIP3277702 {
    /// @notice The x coordinate of the authorized public key
    uint256 authorizedPublicKeyX;
    /// @notice The y coordinate of the authorized public key
    uint256 authorizedPublicKeyY;

    /// @notice Internal nonce used for replay protection, must be tracked and included into prehashed message.
    uint256 public nonce;

    /// @notice Authorizes provided public key to transact on behalf of this account. Only callable by EOA itself.
    function authorize(uint256 publicKeyX, uint256 publicKeyY) public {
        require(msg.sender == address(this));

        authorizedPublicKeyX = publicKeyX;
        authorizedPublicKeyY = publicKeyY;
    }

    /// @notice Main entrypoint for authorized transactions. Accepts transaction parameters (to, data, value) and a musig2 signature.
    function transact(address to, bytes memory data, uint256 value, uint256 r, uint256 s) public {
        bytes32 digest = keccak256(abi.encode(nonce++, to, data, value));
        require(Schnorr_verify(abi.encodePacked(digest), authorizedPublicKeyX, authorizedPublicKeyY, r, s), "Invalid signature");

        (bool success,) = to.call{value: value}(data);
        require(success);
    }
}
