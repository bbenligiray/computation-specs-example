const airnodeAbi = require('@api3/airnode-abi');
const bson = require('bson');

function serialize(params) {
	const buffer = bson.serialize(params).buffer;
	return String.fromCharCode.apply(null, new Uint16Array(buffer));
}

function deserialize(serializedParams) {
	const buffer = new Uint16Array(new ArrayBuffer(serializedParams.length * 2));

	for (var i = 0; i < serializedParams.length; i++) {
		buffer[i] = serializedParams.charCodeAt(i);
	}

	return Object.values(bson.deserialize(buffer));
}

const rawComputationSpecs = 'return [ res.field1 * 3, res.field2 ];';
const hexlifiedComputationSpecs = '0x' + Buffer.from(rawComputationSpecs, 'ascii').toString('hex');

const params = [
	{
		name: '_compSpecs', type: 'bytes', value: hexlifiedComputationSpecs
	},
	{
		name: 'someOtherParameter', type: 'uint256', value: 123
	}
];

const abiSerialized = airnodeAbi.encode(params);
const serializedParams = serialize(params);
let serializedHex = '';

for (let i = 0; i < serializedParams.length; i++) {
	serializedHex += serializedParams.charCodeAt(i).toString(16).padStart(4, '0');
}

console.log(`airnode ABI serialization (${abiSerialized.length} chars): ${abiSerialized}`);
console.log(`bson serialization (${serializedParams.length} UTF-32 chars): ${serializedParams}`);
console.log(`bson hex (${serializedHex.length} chars): ${serializedHex}`);

let deserializedHex = '';
const hexes = serializedHex.match(/.{1,4}/g) || [];

for (let i = 0; i < hexes.length; i++) {
	deserializedHex += String.fromCharCode(parseInt(hexes[i], 16));
}

console.log(deserialize(deserializedHex));
