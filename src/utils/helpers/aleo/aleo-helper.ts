export const aleoHelper = ()=>{
    const remoteProgram = "program momentswap3.aleo;\n\nrecord Identifier:\n    owner as address.private;\n    gates as u64.private;\n    name as field.private;\n    nick_name as field.private;\n    phone_number as field.private;\n    identification_number as field.private;\n    nation as field.private;\n\nrecord Moment:\n    owner as address.private;\n    gates as u64.private;\n    metadata_uri1 as field.private;\n    metadata_uri2 as field.private;\n    metadata_uri3 as field.private;\n    metadata_uri4 as field.private;\n    metadata_uri5 as field.private;\n    time as u64.private;\n\nfunction create_public_identifier:\n    input r0 as address.public;\n    input r1 as field.public;\n    input r2 as field.public;\n    input r3 as field.public;\n    input r4 as field.public;\n    input r5 as field.public;\n    assert.eq self.caller r0 ;\n    cast r0 0u64 r1 r2 r3 r4 r5 into r6 as Identifier.record;\n    output r6 as Identifier.record;\n\nfunction create_private_identifier:\n    input r0 as address.private;\n    input r1 as field.private;\n    input r2 as field.private;\n    input r3 as field.private;\n    input r4 as field.private;\n    input r5 as field.private;\n    assert.eq self.caller r0 ;\n    cast r0 0u64 r1 r2 r3 r4 r5 into r6 as Identifier.record;\n    output r6 as Identifier.record;\n\nfunction burn_public_identifier:\n    input r0 as Identifier.record;\n    assert.eq self.caller r0.owner ;\n\nfunction burn_private_identifier:\n    input r0 as Identifier.record;\n    assert.eq self.caller r0.owner ;\n\nfunction create_public_moment:\n    input r0 as field.public;\n    input r1 as field.public;\n    input r2 as field.public;\n    input r3 as field.public;\n    input r4 as field.public;\n    input r5 as u64.public;\n    cast self.caller 0u64 r0 r1 r2 r3 r4 r5 into r6 as Moment.record;\n    output r6 as Moment.record;\n\nfunction create_private_moment:\n    input r0 as field.private;\n    input r1 as field.private;\n    input r2 as field.private;\n    input r3 as field.private;\n    input r4 as field.private;\n    input r5 as u64.private;\n    cast self.caller 0u64 r0 r1 r2 r3 r4 r5 into r6 as Moment.record;\n    output r6 as Moment.record;\n\nfunction share_private_moment:\n    input r0 as Moment.record;\n    input r1 as address.private;\n    assert.eq self.caller r0.owner ;\n    cast r1 0u64 r0.metadata_uri1 r0.metadata_uri2 r0.metadata_uri3 r0.metadata_uri4 r0.metadata_uri5 r0.time into r2 as Moment.record;\n    output r0 as Moment.record;\n    output r2 as Moment.record;\n\nfunction delete_public_moment:\n    input r0 as Moment.record;\n    assert.eq self.caller r0.owner ;\n\nfunction delete_private_moment:\n    input r0 as Moment.record;\n    assert.eq self.caller r0.owner ;\n\nfunction transfer_public:\n    input r0 as Moment.record;\n    input r1 as address.public;\n    assert.eq self.caller r0.owner ;\n    cast r1 r0.gates r0.metadata_uri1 r0.metadata_uri2 r0.metadata_uri3 r0.metadata_uri4 r0.metadata_uri5 r0.time into r2 as Moment.record;\n    output r2 as Moment.record;\n\nfunction transfer_private:\n    input r0 as Moment.record;\n    input r1 as address.private;\n    assert.eq self.caller r0.owner ;\n    cast r1 r0.gates r0.metadata_uri1 r0.metadata_uri2 r0.metadata_uri3 r0.metadata_uri4 r0.metadata_uri5 r0.time into r2 as Moment.record;\n    output r2 as Moment.record;\n\nfunction transfer_private_to_public:\n    input r0 as Moment.record;\n    input r1 as address.public;\n    assert.eq self.caller r0.owner ;\n    cast r1 r0.gates r0.metadata_uri1 r0.metadata_uri2 r0.metadata_uri3 r0.metadata_uri4 r0.metadata_uri5 r0.time into r2 as Moment.record;\n    output r2 as Moment.record;\n\nfunction transfer_public_to_private:\n    input r0 as Moment.record;\n    input r1 as address.private;\n    assert.eq self.caller r0.owner ;\n    cast r1 r0.gates r0.metadata_uri1 r0.metadata_uri2 r0.metadata_uri3 r0.metadata_uri4 r0.metadata_uri5 r0.time into r2 as Moment.record;\n    output r2 as Moment.record;\n"    
    const aleoFunction = "create_public_identifier";
    const inputs = [
      "",
      "777field",
      "777field",
      "777field",
      "777field",
      "777field",
    ];
    const privateKey = "";
    const fee = 0.1;
    const feeRecord =""
    const url = "https://vm.aleo.org/api";
    return {remoteProgram,aleoFunction,inputs,privateKey,fee,feeRecord,url}
}