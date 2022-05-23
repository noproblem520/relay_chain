let Web3 = require('web3');
let smartContractJson = require('../public/smartcontracts/sideChain.json');
let abi = smartContractJson.abi;
let bytecode = smartContractJson.bytecode;

require('dotenv').config();
w3 = new Web3(
    // # demo1's blockchain
    // # Web3.HTTPProvider("HTTP://140.118.9.225:23001")
    //  VM blockchain
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

    w3.eth.accounts.signTransaction(tx, private_key).then(signed => {
        w3.eth.sendSignedTransaction(signed.rawTransaction).then((result) => {
            // TODO：save the contractAddress to the database
            console.log("contractAddress is " + result.contractAddress)
        });
    });
}



deploySmartContract();