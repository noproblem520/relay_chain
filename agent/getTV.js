let Web3 = require('web3');
let smartContractJson = require('../public/smartcontracts/sideChain.json');
let abi = smartContractJson.abi;
require('dotenv').config();
w3 = new Web3(
    process.env.BLOCKCHAIN_RPC
)

let nodeTVAry = null;
let round = null;
const init = () => {
    NodeAmount = 5;
    round = 1000;
    nodeTVAry = new Array();
}

const getAvgTV = async (addr) => {

    let contract = new w3.eth.Contract(abi, addr);
    for (let i = 0; i < NodeAmount; i++) {
        nodeTVAry.push(await contract.methods.retrieveTV(i).call());
    }
    let sum = 0;
    for (let i = 0; i < NodeAmount; i++) {
        sum += parseFloat(nodeTVAry[i][nodeTVAry[i].length - 1]);
    }
    return Math.round(sum / NodeAmount * round) / round;
}


const start = async (addr) => {
    init();
    return await getAvgTV(addr);
}


module.exports = {
    runAgent: async (addr) => {
        return await start(addr);
    }
}