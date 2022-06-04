let Web3 = require('web3');
let smartContractJson = require('../public/smartcontracts/sideChain.json');
let abi = smartContractJson.abi;
let bytecode = smartContractJson.bytecode;

require('dotenv').config();
w3 = new Web3(
    process.env.BLOCKCHAIN_RPC
)
let my_address = process.env.PUBLIC_KEY;
let private_key = process.env.PRIVATE_KEY;
const deploySmartContract = () => {
    let myContract = new w3.eth.Contract(abi);

    // encode transactions to ABI
    var deployData = myContract.deploy({
        data: bytecode
    }).encodeABI();


    var tx = {
        gas: 0,
        gasLimit: 6721975,
        data: deployData
    }
    var contractaddr = '';
    w3.eth.accounts.signTransaction(tx, private_key).then(async (signed) => {
        w3.eth.sendSignedTransaction(signed.rawTransaction).then((result) => {
            contractaddr = result.contractAddress;
            console.log("contractAddress is " + result.contractAddress);
        });
    });

    return contractaddr;
}



deploySmartContract();
