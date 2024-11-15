import hashlib
from reference import tagged_hash, int_from_bytes, nonce_hash, nonce_gen_internal, key_agg_coeff, hash_keys, test_sign_and_verify_random, test_sig_agg_vectors



print("/*UNITARY TESTS FOR BIP327*/")
print("/*------------------------*/")
print("/*vector for tagged_hash*/")

tag="BIP0340/challenge"
msg="abc".encode()
print("message:", msg)
print("tag:", tag)

print("final hex")
print(hex(int_from_bytes(tagged_hash(tag, msg))))

print("final int")
print((int_from_bytes(tagged_hash(tag, msg))))


print("/*------------------------*/")
print("/*vector for nonce_hash*/")

rand=bytes.fromhex("0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F")

msg=bytes.fromhex("0101010101010101010101010101010101010101010101010101010101010101")
sk=bytes.fromhex("0202020202020202020202020202020202020202020202020202020202020202")
pk=bytes.fromhex("024D4B6CD1361032CA9BD2AEB9D900AA4D45D9EAD80AC9423374C451A7254D0766")
aggpk=bytes.fromhex("0707070707070707070707070707070707070707070707070707070707070707")
extra_in=bytes.fromhex("0808080808080808080808080808080808080808080808080808080808080808")
msg_prefixed = bytes.fromhex("01")
msg_prefixed += len(msg).to_bytes(8, 'big')
msg_prefixed += msg

res=nonce_hash(rand,  pk, aggpk,0,msg_prefixed, extra_in);

print("input to nonce hash:", hex(int_from_bytes(rand)), hex(int_from_bytes(pk)), hex(int_from_bytes(aggpk)), 0, hex(int_from_bytes(msg_prefixed)), hex(int_from_bytes(extra_in)))
print("nonce hash:", res, hex(res) )

res=nonce_gen_internal(rand,sk, pk, aggpk,msg, extra_in);
print("nonce gen internal secnonce:\n", hex(int_from_bytes(res[0] )))

print("nonce gen internal pubnonce\n:", hex(int_from_bytes(res[1] )))


print("/*------------------------*/")
print("/*vector for hash_keys*/")

pubkeys=[bytes.fromhex("02F9308A019258C31049344F85F89D5229B531C845836F99B08601F113BCE036F9"),
         bytes.fromhex("03DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659"),
         bytes.fromhex("023590A94E768F8E1815C2F24B4D80A8E3149316C3518CE7B7AD338368D038CA66")];

res=hash_keys(pubkeys);
print("hashkeys:", hex(int_from_bytes(res)));


res=key_agg_coeff(pubkeys, pubkeys[0]);
print("keyagg coeff 0:", hex(res));

res=key_agg_coeff(pubkeys, pubkeys[1]);#second key is 1, optim Musig2*
print("keyagg coeff 1:", hex(res));

test_sign_and_verify_random(1);

print("/*------------------------*/")
print("/*vector for sig_agg*/")

test_sig_agg_vectors();
