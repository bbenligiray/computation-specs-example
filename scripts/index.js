const hre = require('hardhat');
const airnodeAbi = require('@api3/airnode-abi');

async function main() {
  // Deploy the contracts
  const MockAirnodeRrp = await hre.ethers.getContractFactory('MockAirnodeRrp');
  const mockAirnodeRrp = await MockAirnodeRrp.deploy();
  const MockClient = await hre.ethers.getContractFactory('MockClient');
  const mockClient = await MockClient.deploy();

  // Here, the requester represents what they want to be done with the JSON object
  // encoded as a bytes string
  const rawComputationSpecs = "hre.ethers.utils.defaultAbiCoder.encode(['uint256','string'],[apiResponse.field1*3,apiResponse.field2])";
  console.log(`\nThis is created by the requester to specify an arbitrary computation:\n  ${rawComputationSpecs}`)
  const hexlifiedComputationSpecs = '0x' + Buffer.from(rawComputationSpecs, 'ascii').toString('hex');
  console.log(`\nBefore using it as a parameter, the requester hexlifies it:\n  ${hexlifiedComputationSpecs}`);

  // Then, these specs are treated as a reserved parameter similar to _path, etc.
  const parameters = airnodeAbi.encode([
    {
      name: '_compSpecs', type: 'bytes', value: hexlifiedComputationSpecs
    },
    {
      name: 'someOtherParameter', type: 'uint256', value: 123
    }
  ]);
console.log(`\nThe hexlified computations specs are encoded as a bytes type reserved parameter, along with the other request parameters:\n  ${parameters}\n`);
  await mockAirnodeRrp.makeRequest(parameters);

  // Airnode listens for this event and decodes the computation specs
  const logs = await hre.ethers.provider.getLogs({
    address: mockAirnodeRrp.address,
    topics: [hre.ethers.utils.id("RequestCreated(bytes)")]
  });
  const decodedLog = mockAirnodeRrp.interface.parseLog(logs[0]);
  const decodedParameters = airnodeAbi.decode(decodedLog.args.parameters);
  const recoveredHexlifiedComputationSpecs = decodedParameters._compSpecs;
  const recoveredRawComputationSpecs = Buffer.from(recoveredHexlifiedComputationSpecs.substring(2), 'hex').toString();
  console.log(`This is received and decoded at Airnode, ready to be used to process the API response:\n  ${recoveredRawComputationSpecs}`);

  // Now Airnode makes the API call and gets the JSON (assume the parameters required to do that were also specified)
  const apiResponse = {
    field1: 123,
    field2: "This is a string",
    field3: -987
  };
  console.log(`\nThis is what Airnode has received from the API:\n${JSON.stringify(apiResponse, null, 2)}\n`);

  // Based on recoveredRawComputationSpecs and apiResponse, it forms a response of bytes type
  const response = eval(recoveredRawComputationSpecs);
  // and responds with it to the client
  await mockClient.fulfill(response);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
