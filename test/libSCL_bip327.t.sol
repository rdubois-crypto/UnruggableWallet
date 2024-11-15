/********************************************************************************************/
/*
/*   ╔═╗╔╦╗╔═╗╔═╗╔╦╗╦ ╦  ╔═╗╦═╗╦ ╦╔═╗╔╦╗╔═╗╦  ╦╔╗ 
/*   ╚═╗║║║║ ║║ ║ ║ ╠═╣  ║  ╠╦╝╚╦╝╠═╝ ║ ║ ║║  ║╠╩╗
/*   ╚═╝╩ ╩╚═╝╚═╝o╩ ╩ ╩  ╚═╝╩╚═ ╩ ╩   ╩ ╚═╝╩═╝╩╚═╝
/*              
/* Copyright (C) 2024 - Renaud Dubois - This file is part of SCL (Smoo.th CryptoLib) project
/* License: This software is licensed under MIT License (and allways will)   
/* Description: This library contains utils that provides OFFCHAIN computations, they are  provided as
/* an helper for integration, test and fuzzing BUT SHALL NOT USED ONCHAIN for performances and security reasons                  
/********************************************************************************************/
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 <0.9.0;


import "forge-std/Test.sol";
import {stdJson} from "forge-std/StdJson.sol";

import "@solidity/lib/libSCL_BIP327.sol";

contract Test_bip327 is Test {

function test_BIP327_taggedhash() public view{
 string memory mesg="abc";
 string memory tag_btc="BIP0340/challenge";
 
 uint256 res=tagged_hashBTC(tag_btc, bytes(mesg));
 assertEq(res, 0x770a5b7e7c304bbcc3ea107343ff951dd404312ef418db0c3b94e2ebfbb50087);
 
 bytes memory message=hex"28d5dd7459fc54ff02304280ce9bcc54a29cf0e5d72cd4ccafe961a1cfe8a8d3";
 uint256 aggpk=0x23189cc577a55b5ba8016136947cb0a1e97567d332cc993e9d108010708f10c0;
 uint256 r=0x61074a45b0030ff5b7280dd094bf06c361adc0394a9bd17756db7bc9aa598353;

 uint256 e=tagged_hashBTC(tag_btc, abi.encodePacked(r, aggpk, message ))%n;
 assertEq(e,59360190507588923198077279932140239987278168570671311919050862648063319287044);
  
}



function test_BIP327_Decompress() public{
  bytes memory message=hex"28d5dd7459fc54ff02304280ce9bcc54a29cf0e5d72cd4ccafe961a1cfe8a8d3";

  uint256 r=0x61074a45b0030ff5b7280dd094bf06c361adc0394a9bd17756db7bc9aa598353;
  uint256 s=0x6c5b2ebc4404cf1f04e71c3795484fe83aabc48845a56f796d7c816a67601256;
  uint256 pubKeyX=0x23189cc577a55b5ba8016136947cb0a1e97567d332cc993e9d108010708f10c0;
  uint256 pubKeyY=ecDecompress_BTC(pubKeyX);
  console.log("PubKeyY=",pubKeyY);
  assertEq(pubKeyY, 20168163184469178153570129703058949506444642671018723386953039971488174913766);
  bool res=Schnorr_verify(message,pubKeyX, pubKeyY, r,s );
  
  assertEq(res, true);
}

}