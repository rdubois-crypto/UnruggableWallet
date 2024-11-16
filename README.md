# UnruggableWallet -- ETHGlobal BANGKOK 2024


<div align="center">
<img src=image.png>
</div>

_<p align="center"> - MOO!, I said MOO(sig)_

## Table of Contents

## Description


This project was developed as part of the ETHGlobal Bangkok Hackathon.
Leveraging MPC multisig signature **Musig2** (MOO!) with Account abstraction, it provides resistance against trapped or buggy hardware (which is the same) by providing a security equal to the **weaker** link. Compared to the safe, the multisig is computed offchain and provide only a single chain verification footprint. This provides both privacy and gas efficiency.

<div align="center">
<img src=image-2.png>
</div>

## What is demonstrated ?

### Problematic

A hot wallet is inspectable, but is not resilient to malwares on the host, even using Passkeys. On the other hand hardware wallet cannot disclose their full design for NDA reasons, letting a possibility to insert a potential trapdoor. Also when implementing cryptography, a bug can be leveraged to extract secrets. A way to solve this is to use multisig. Current non MPC solutions reveals information about the governance. MPC solutions are mostly ECDSA based, often crippled by attacks. This project leverage the safest algorithm, benefiting from Taproot (BTC) experience, aligning its implementation on BIP327 specs: Musig2 (Moooooooo !).


### Initial target

The user want to switch from a simple EoA to a multisig wallet, combining two different stacks/provider (hardware/software). It generates its new Musig2 public keys in each wallet, publicly aggregate them. Then a 7702 transaction is pushed to add a delegation to a contract which public key is the aggregated public key.

Now when signing, the wallet companion (Rabby/Metamask) generates one share of the signature, while the hardware wallet generates its own. The companion aggregates the signature and pushes it onchain.

## Installation

### Javascript (Signer) library

It is necessary to install noble-curves, which the library is based on for the elliptic primitives function.

`npm install @noble/curves`

Test of BIP327 can be run typing  

`node test_bip327.mjs`

The test includes the BIP327 test vectors, enforcing compatibility of the signer with BTC, and any 4337/7702 integrating the libSCL_BIP327.sol verifier.

### Contracts (On chain Verifier)

The Onchain verifier is the smartContract libSCL_BIP327.sol. To ensure interoperability and security, the verifier is compliant with 
[BIP 327](https://github.com/bitcoin/bips/blob/master/bip-0327.mediawiki), only that it takes a decompressed key in raw format (2x32 bytes).

```
//A schnorr verifier compatible with BIP327
//compared to BIP327, which takes only pubkeyX as input, it is assumed that public key has been decompressed using ecDecompress_BTC
//this avoid to perform the same decompression at every verification
  function Schnorr_verify(bytes memory message, uint256 pubkeyX, uint256 pubkeyY, uint256 r, uint256 s)
```

#### Deploy the stack on networks 

```bash
forge script tbd.s.sol --private-key <PRIVATE_KEY> --broadcast -vvv --rpc-url <RPC_URL>
```

## Live contracts addresses
(TBD)
## References
- Multisignature in bitcoin : https://bitcoinwiki.org/wiki/multisignature
- Musig2 : https://eprint.iacr.org/2020/1261



## Description of Musig2 primitives

A 2 of 2 session is described here. It generalizes identically with larger user set.
We use BIP327 with no tweak.


### Key generation and aggregation

First, user1 and user2 generates their private key, or import them from seed. 
```
    const sk1=secp256k1.utils.randomPrivateKey();//this provides a 32 bytes array
    const sk2=secp256k1.utils.randomPrivateKey();
```

Corresponding aggregated key is derived from public keys:
```
 const pubK1=IndividualPubKey_array(sk1);
 const pubK2=IndividualPubKey_array(sk2);

 const pubkeys=[pubK1, pubK2];

 let aggpk = key_agg(pubkeys)[0];//here aggpk is a 33 bytes compressed public key
 let x_aggpk=aggpk.slice(1,33);//x-only version for noncegen
```
(of course in practice derivation occurs separately in each signer secure domain)


### Signature session

Assuming user generated their public key according to previous section, they now want to jointly sign a message `msg`. An example session is provided [here](https://github.com/rdubois-crypto/UnruggableWallet/blob/66b84ec4f807919dd443907463318fac0ac1b5f5/src/libMPC/test_bip327.mjs#L290). 

#### Round 1
In first round, user1 and user2 generates public and secret nonces. Public are shared, secret keep in respective secure domain.

```
    let nonce1= nonce_gen(seckeys[0], pubkeys[0], aggpk, msg, i.to_bytes(4, 'big'));
    let nonce2= nonce_gen(seckeys[1], pubkeys[1], aggpk, msg, i.to_bytes(4, 'big'));

    let aggnonce = nonce_agg(nonce1[0], nonce2[0]);
```

#### Round 2
In second round, each user computes its partial signature, which are then aggregated and broadcast on chain:

```
    const tweaks=[];
    const session_ctx=[aggnonce, pubkeys, [], [], msg];

    let p1=psign(nonce1[1], seckeys[0], session_ctx);
    let p2=psign(nonce2[1], seckeys[1], session_ctx);
    
    psigs=[p1,p2];
    
    let res=partial_sig_agg(psigs, session_context);
```
res is the final results to push onchain

## Code ownership

License is MIT, which allow any use as long as citation and headers are provided

-  smoo.th  cryptographic library has been forked : https://github.com/get-smooth/crypto-lib.
- The bip327.mjs module is heavily inspired from BIP327 python material, but using the more secure noble-curves repository. 

(Biased advice: you shall always secure fund with a HW.)
- https://github.com/paradigmxyz/forge-alphanet: example of Delegation with 7702



## Warning

This is hackathon code, nonce generation is not safe, do not use this in production !


## Future work

Keywords: Unruggable wallet, EIP7702, MPC, Musig2, Schnorr, BIP327.
